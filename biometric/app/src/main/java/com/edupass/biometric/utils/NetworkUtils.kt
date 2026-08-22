package com.edupass.biometric.utils

import java.net.Inet4Address
import java.net.NetworkInterface

object NetworkUtils {
    const val CONFIGURED_PHONE_IP = "100.97.10.19"
    const val CONFIGURED_LAPTOP_IP = "100.117.215.39"
    const val DEFAULT_PORT = 8080

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
                        if (host != null && host.startsWith("100.")) {
                            return host
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return CONFIGURED_PHONE_IP
    }

    fun getLaptopIpAddress(): String = CONFIGURED_LAPTOP_IP
}
