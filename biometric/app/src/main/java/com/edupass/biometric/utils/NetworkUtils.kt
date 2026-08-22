package com.edupass.biometric.utils

import java.net.Inet4Address
import java.net.NetworkInterface

object NetworkUtils {
    const val NGROK_BASE_URL = "https://intrusive-margit-multiovulated.ngrok-free.dev/"
    const val CONFIGURED_LAPTOP_IP = "172.16.42.95"
    const val BACKEND_PORT = 8000
    const val LOCAL_WIFI_BASE_URL = "http://$CONFIGURED_LAPTOP_IP:$BACKEND_PORT/"
    const val EMULATOR_BASE_URL = "http://10.0.2.2:$BACKEND_PORT/"
    
    // Primary API URL defaults to live ngrok HTTPS server
    const val BASE_URL = NGROK_BASE_URL
    const val DEFAULT_TRIGGER_PORT = 8080

    fun getLocalIpAddress(): String {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val networkInterface = interfaces.nextElement()
                if (networkInterface.isLoopback || !networkInterface.isUp) continue

                val addresses = networkInterface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val addr = addresses.nextElement()
                    if (addr is Inet4Address && !addr.isLoopbackAddress) {
                        val host = addr.hostAddress
                        if (host != null && (
                                    host.startsWith("172.16.") ||
                                            host.startsWith("192.168.") ||
                                            host.startsWith("10.") ||
                                            host.startsWith("100.")
                                    )) {
                            return host
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return CONFIGURED_LAPTOP_IP
    }

    fun getLaptopIpAddress(): String = CONFIGURED_LAPTOP_IP
}
