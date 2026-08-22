package com.edupass.biometric.server

import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors

class BiometricTriggerServer(
    private val port: Int = 8080,
    private val onRequestTrigger: (clientIp: String, callback: (Boolean, String) -> Unit) -> Unit
) {

    private var serverSocket: ServerSocket? = null
    private var isRunning = false
    private val threadPool = Executors.newCachedThreadPool()

    fun start(): Boolean {
        if (isRunning) return true
        return try {
            serverSocket = ServerSocket(port)
            isRunning = true
            threadPool.execute {
                listen()
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun listen() {
        while (isRunning) {
            try {
                val socket = serverSocket?.accept() ?: break
                threadPool.execute {
                    handleClient(socket)
                }
            } catch (e: Exception) {
                if (!isRunning) break
            }
        }
    }

    private fun handleClient(socket: Socket) {
        try {
            socket.soTimeout = 30000
            val remoteIp = socket.inetAddress?.hostAddress ?: "127.0.0.1"
            val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
            val writer = PrintWriter(OutputStreamWriter(socket.getOutputStream()), true)

            val requestLine = reader.readLine() ?: return
            val parts = requestLine.split(" ")
            val method = parts.getOrNull(0) ?: "GET"
            val path = parts.getOrNull(1) ?: "/"

            if (method.equals("OPTIONS", ignoreCase = true)) {
                writer.print("HTTP/1.1 204 No Content\r\n")
                writer.print("Access-Control-Allow-Origin: *\r\n")
                writer.print("Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n")
                writer.print("Access-Control-Allow-Headers: Content-Type\r\n")
                writer.print("\r\n")
                writer.flush()
                socket.close()
                return
            }

            if (path.startsWith("/trigger") || path.startsWith("/verify")) {
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
                val statusLine = if (isApproved) "HTTP/1.1 200 OK" else "HTTP/1.1 401 Unauthorized"

                val os = socket.getOutputStream()
                val header = "$statusLine\r\n" +
                        "Access-Control-Allow-Origin: *\r\n" +
                        "Content-Type: application/json\r\n" +
                        "Content-Length: ${bytes.size}\r\n" +
                        "\r\n"
                os.write(header.toByteArray(Charsets.UTF_8))
                os.write(bytes)
                os.flush()
            } else {
                val statusJson = """
                {
                    "server": "EduPass Biometric Remote Trigger Engine",
                    "status": "ACTIVE",
                    "port": $port,
                    "endpoints": ["/trigger", "/verify", "/status"]
                }
                """.trimIndent()

                val bytes = statusJson.toByteArray(Charsets.UTF_8)
                val os = socket.getOutputStream()
                val header = "HTTP/1.1 200 OK\r\n" +
                        "Access-Control-Allow-Origin: *\r\n" +
                        "Content-Type: application/json\r\n" +
                        "Content-Length: ${bytes.size}\r\n" +
                        "\r\n"
                os.write(header.toByteArray(Charsets.UTF_8))
                os.write(bytes)
                os.flush()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            try {
                socket.close()
            } catch (_: Exception) {}
        }
    }

    fun stop() {
        try {
            isRunning = false
            serverSocket?.close()
            serverSocket = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun isServerRunning(): Boolean = isRunning
}
