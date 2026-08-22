package com.edupass.biometric.server

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpServer
import java.io.OutputStream
import java.net.InetSocketAddress
import java.util.concurrent.Executors

class BiometricTriggerServer(
    private val port: Int = 8080,
    private val onRequestTrigger: (clientIp: String, callback: (Boolean, String) -> Unit) -> Unit
) {

    private var server: HttpServer? = null
    private var isRunning = false

    fun start(): Boolean {
        if (isRunning) return true
        try {
            server = HttpServer.create(InetSocketAddress(port), 0)
            server?.createContext("/trigger", TriggerHandler())
            server?.createContext("/verify", TriggerHandler())
            server?.createContext("/status", StatusHandler())
            server?.createContext("/", StatusHandler())
            server?.executor = Executors.newCachedThreadPool()
            server?.start()
            isRunning = true
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    fun stop() {
        try {
            server?.stop(0)
            server = null
            isRunning = false
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun isServerRunning(): Boolean = isRunning

    private inner class TriggerHandler : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            val remoteIp = exchange.remoteAddress.address.hostAddress ?: "127.0.0.1"

            // Enable CORS for browser integration
            exchange.responseHeaders.add("Access-Control-Allow-Origin", "*")
            exchange.responseHeaders.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            exchange.responseHeaders.add("Access-Control-Allow-Headers", "Content-Type")

            if (exchange.requestMethod.equals("OPTIONS", ignoreCase = true)) {
                exchange.sendResponseHeaders(204, -1)
                return
            }

            // Trigger UI biometric prompt on main thread and suspend response until user scan
            val syncLock = Object()
            var isApproved = false
            var proofHash = ""

            onRequestTrigger(remoteIp) { approved, hash ->
                synchronized(syncLock) {
                    isApproved = approved
                    proofHash = hash
                    syncLock.notifyAll()
                }
            }

            synchronized(syncLock) {
                try {
                    // Wait up to 30 seconds for user touch input on mobile phone
                    syncLock.wait(30000)
                } catch (e: InterruptedException) {
                    e.printStackTrace()
                }
            }

            val jsonResponse = if (isApproved) {
                """
                {
                    "status": "SUCCESS",
                    "verified": true,
                    "biometric_type": "FINGERPRINT_FACE_ID_ZK",
                    "proof_hash": "$proofHash",
                    "timestamp": ${System.currentTimeMillis()},
                    "message": "Biometric verification completed successfully on mobile device"
                }
                """.trimIndent()
            } else {
                """
                {
                    "status": "FAILED",
                    "verified": false,
                    "error": "USER_CANCELLED_OR_TIMEOUT",
                    "timestamp": ${System.currentTimeMillis()}
                }
                """.trimIndent()
            }

            val bytes = jsonResponse.toByteArray(Charsets.UTF_8)
            val statusCode = if (isApproved) 200 else 401
            exchange.responseHeaders.add("Content-Type", "application/json")
            exchange.sendResponseHeaders(statusCode, bytes.size.toLong())
            val os: OutputStream = exchange.responseBody
            os.write(bytes)
            os.close()
        }
    }

    private inner class StatusHandler : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            exchange.responseHeaders.add("Access-Control-Allow-Origin", "*")
            exchange.responseHeaders.add("Content-Type", "application/json")
            val statusJson = """
            {
                "server": "EduPass Biometric Remote Trigger Engine",
                "status": "ACTIVE",
                "port": $port,
                "endpoints": ["/trigger", "/verify", "/status"]
            }
            """.trimIndent()
            val bytes = statusJson.toByteArray(Charsets.UTF_8)
            exchange.sendResponseHeaders(200, bytes.size.toLong())
            val os: OutputStream = exchange.responseBody
            os.write(bytes)
            os.close()
        }
    }
}
