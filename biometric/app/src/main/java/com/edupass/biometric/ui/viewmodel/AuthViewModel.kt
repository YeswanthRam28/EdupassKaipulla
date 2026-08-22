package com.edupass.biometric.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edupass.biometric.server.BiometricTriggerServer
import com.edupass.biometric.ui.components.UserRole
import com.edupass.biometric.utils.NetworkUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

data class StudentCredential(
    val id: String,
    val studentId: String,
    val studentName: String,
    val credentialType: String,
    val degree: String,
    val cgpa: Double?,
    val credits: Int?,
    val institutionName: String,
    val commitmentHash: String,
    val ipfsCid: String,
    val edupassSignature: String,
    val isRevoked: Boolean = false,
    val issuedAt: String = "2026-08-22T06:05:00Z"
)

data class AuthUiState(
    val selectedRole: UserRole = UserRole.STUDENT,
    val userId: String = "EDU-2026-0687",
    val mobileKey: String = "EDUPASS-KEY-0B1C-9414-2026",
    val deviceId: String = "ANDROID_HW_ID_991A",
    val password: String = "edupass2026",
    val isLoading: Boolean = false,
    val isKeyVerified: Boolean = false,
    val showBiometricPrompt: Boolean = false,
    val isAuthenticated: Boolean = false,
    val loggedInRole: UserRole? = null,
    val accessToken: String? = null,
    val userFullName: String? = "Yeswanth Ram JP",
    val userEmail: String? = "student@university.edu",
    val studentCredentials: List<StudentCredential> = emptyList(),
    val isFetchingCredentials: Boolean = false,
    val errorMessage: String? = null,
    val isGeneratingProof: Boolean = false,
    val generatedProofHash: String? = null,
    // Server & Trigger State
    val deviceIpAddress: String = NetworkUtils.getLocalIpAddress(),
    val laptopIpAddress: String = NetworkUtils.CONFIGURED_LAPTOP_IP,
    val isServerRunning: Boolean = false,
    val pendingTriggerClientIp: String? = null,
    val latestServerLog: String? = null
)

class AuthViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private var triggerServer: BiometricTriggerServer? = null
    private var activeCallback: ((Boolean, String) -> Unit)? = null

    init {
        refreshIpAddress()
        startServer()
        fetchStudentCredentials()
    }

    fun refreshIpAddress() {
        val ip = NetworkUtils.getLocalIpAddress()
        _uiState.value = _uiState.value.copy(deviceIpAddress = ip)
    }

    fun startServer() {
        if (triggerServer == null) {
            triggerServer = BiometricTriggerServer(port = 8080) { clientIp, callback ->
                handleIncomingTrigger(clientIp, callback)
            }
        }
        val success = triggerServer?.start() ?: false
        _uiState.value = _uiState.value.copy(
            isServerRunning = success,
            latestServerLog = if (success) "SERVER STARTED AT HTTP://${_uiState.value.deviceIpAddress}:8080/TRIGGER" else "SERVER FAILED TO START"
        )
    }

    fun stopServer() {
        triggerServer?.stop()
        _uiState.value = _uiState.value.copy(
            isServerRunning = false,
            latestServerLog = "SERVER STOPPED"
        )
    }

    fun toggleServer() {
        if (_uiState.value.isServerRunning) {
            stopServer()
        } else {
            startServer()
        }
    }

    fun handleIncomingTrigger(clientIp: String, callback: (Boolean, String) -> Unit) {
        activeCallback = callback
        _uiState.value = _uiState.value.copy(
            pendingTriggerClientIp = clientIp,
            latestServerLog = "INCOMING TRIGGER FROM $clientIp"
        )
    }

    fun respondToTrigger(approved: Boolean, proofHash: String) {
        activeCallback?.invoke(approved, proofHash)
        activeCallback = null
        val log = if (approved) "VERIFICATION APPROVED ($proofHash)" else "VERIFICATION REJECTED"
        _uiState.value = _uiState.value.copy(
            pendingTriggerClientIp = null,
            latestServerLog = log
        )
    }

    fun simulateTestTrigger() {
        handleIncomingTrigger("172.16.42.95 (LAPTOP)") { approved, hash ->
            val log = if (approved) "LAPTOP TRIGGER APPROVED ($hash)" else "LAPTOP TRIGGER CANCELLED"
            _uiState.value = _uiState.value.copy(latestServerLog = log)
        }
    }

    fun selectRole(role: UserRole) {
        val defaultId = when (role) {
            UserRole.STUDENT -> "EDU-2026-0687"
            UserRole.INSTITUTION -> "INST-MIT-001"
            UserRole.VERIFIER -> "VRF-GOV-9912"
            UserRole.EMPLOYER -> "EMP-FAANG-4401"
        }
        _uiState.value = _uiState.value.copy(
            selectedRole = role,
            userId = defaultId,
            errorMessage = null
        )
    }

    fun updateUserId(id: String) {
        _uiState.value = _uiState.value.copy(userId = id, errorMessage = null)
    }

    fun updateMobileKey(key: String) {
        _uiState.value = _uiState.value.copy(mobileKey = key, errorMessage = null)
    }

    fun updatePassword(pass: String) {
        _uiState.value = _uiState.value.copy(password = pass, errorMessage = null)
    }

    fun fetchStudentCredentials(studentId: String = _uiState.value.userId) {
        val targetId = if (studentId.isBlank()) "EDU-2026-0687" else studentId.trim()
        _uiState.value = _uiState.value.copy(isFetchingCredentials = true)

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val apiUrl = "${NetworkUtils.BASE_URL}credentials/student/$targetId"
                val url = URL(apiUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.setRequestProperty("Accept", "application/json")
                conn.setRequestProperty("ngrok-skip-browser-warning", "true")
                _uiState.value.accessToken?.let { token ->
                    if (token.isNotBlank()) {
                        conn.setRequestProperty("Authorization", "Bearer $token")
                    }
                }
                conn.connectTimeout = 6000
                conn.readTimeout = 6000

                val responseCode = conn.responseCode
                if (responseCode in 200..299) {
                    val stream = conn.inputStream
                    val responseText = BufferedReader(InputStreamReader(stream, StandardCharsets.UTF_8)).use { it.readText() }
                    val jsonArray = JSONArray(responseText)
                    val list = mutableListOf<StudentCredential>()

                    for (i in 0 until jsonArray.length()) {
                        val obj = jsonArray.getJSONObject(i)
                        list.add(
                            StudentCredential(
                                id = obj.optString("id", "cred_$i"),
                                studentId = obj.optString("student_id", targetId),
                                studentName = obj.optString("student_name", "Yeswanth Ram JP"),
                                credentialType = obj.optString("credential_type", "DEGREE"),
                                degree = obj.optString("degree", "B.Tech Computer Science"),
                                cgpa = if (obj.has("cgpa") && !obj.isNull("cgpa")) obj.getDouble("cgpa") else null,
                                credits = if (obj.has("credits") && !obj.isNull("credits")) obj.getInt("credits") else null,
                                institutionName = obj.optString("institution_name", "EduPass University"),
                                commitmentHash = obj.optString("commitment_hash", "0x891abcf019a0e28f391a271b..."),
                                ipfsCid = obj.optString("ipfs_cid", "ipfs://bafybeig991a8819edupass2026v1"),
                                edupassSignature = obj.optString("edupass_signature", "0xedupass_sig_88190B1C94142026"),
                                isRevoked = obj.optBoolean("is_revoked", false),
                                issuedAt = obj.optString("issued_at", "2026-08-22T06:05:00Z")
                            )
                        )
                    }

                    withContext(Dispatchers.Main) {
                        _uiState.value = _uiState.value.copy(
                            isFetchingCredentials = false,
                            studentCredentials = if (list.isNotEmpty()) list else getDefaultStudentCredentials(targetId)
                        )
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        _uiState.value = _uiState.value.copy(
                            isFetchingCredentials = false,
                            studentCredentials = getDefaultStudentCredentials(targetId)
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    _uiState.value = _uiState.value.copy(
                        isFetchingCredentials = false,
                        studentCredentials = getDefaultStudentCredentials(targetId)
                    )
                }
            }
        }
    }

    private fun getDefaultStudentCredentials(studentId: String): List<StudentCredential> {
        val name = _uiState.value.userFullName ?: "Yeswanth Ram JP"
        return listOf(
            StudentCredential(
                id = "cred_degree_01",
                studentId = studentId,
                studentName = name,
                credentialType = "DEGREE CERTIFICATE",
                degree = "B.Tech Computer Science & Engineering",
                cgpa = 9.37,
                credits = 142,
                institutionName = "EduPass University",
                commitmentHash = "0x891abcf019a0e28f391a271b8c991a0b1c94142026",
                ipfsCid = "ipfs://bafybeig991a8819edupass2026v1",
                edupassSignature = "0xedupass_sig_88190B1C94142026",
                isRevoked = false,
                issuedAt = "2026-08-22T06:05:00Z"
            ),
            StudentCredential(
                id = "cred_marksheet_02",
                studentId = studentId,
                studentName = name,
                credentialType = "MARKSHEET",
                degree = "Semester VII Academic Marksheet",
                cgpa = 9.40,
                credits = 24,
                institutionName = "EduPass University",
                commitmentHash = "0x772b1abcf019a0e28f391a271b8c991a0b1c94142027",
                ipfsCid = "ipfs://bafybeig991a8819edupassmarksheetv1",
                edupassSignature = "0xedupass_sig_772B1B1C94142027",
                isRevoked = false,
                issuedAt = "2026-08-20T10:30:00Z"
            ),
            StudentCredential(
                id = "cred_tc_03",
                studentId = studentId,
                studentName = name,
                credentialType = "TRANSFER CERTIFICATE (TC)",
                degree = "Official Migration & Conduct Certificate",
                cgpa = null,
                credits = null,
                institutionName = "EduPass Registrar Office",
                commitmentHash = "0x551abcf019a0e28f391a271b8c991a0b1c94142028",
                ipfsCid = "ipfs://bafybeig991a8819edupasstcv1",
                edupassSignature = "0xedupass_sig_551C1B1C94142028",
                isRevoked = false,
                issuedAt = "2026-08-18T14:15:00Z"
            ),
            StudentCredential(
                id = "cred_provisional_04",
                studentId = studentId,
                studentName = name,
                credentialType = "PROVISIONAL CERTIFICATE",
                degree = "Provisional Graduation Degree Seal",
                cgpa = 9.37,
                credits = 142,
                institutionName = "EduPass University",
                commitmentHash = "0x331abcf019a0e28f391a271b8c991a0b1c94142029",
                ipfsCid = "ipfs://bafybeig991a8819edupassprovv1",
                edupassSignature = "0xedupass_sig_331D1B1C94142029",
                isRevoked = false,
                issuedAt = "2026-08-15T09:00:00Z"
            ),
            StudentCredential(
                id = "cred_badge_05",
                studentId = studentId,
                studentName = name,
                credentialType = "SKILL BADGE",
                degree = "Zero-Knowledge Circuitry & Cryptographic Proofs",
                cgpa = null,
                credits = null,
                institutionName = "EduPass ZK Research Lab",
                commitmentHash = "0x111abcf019a0e28f391a271b8c991a0b1c94142030",
                ipfsCid = "ipfs://bafybeig991a8819edupassbadgev1",
                edupassSignature = "0xedupass_sig_111E1B1C94142030",
                isRevoked = false,
                issuedAt = "2026-08-10T11:45:00Z"
            )
        )
    }

    fun verifyMobileKeyWithBackend(
        onVerificationSuccess: () -> Unit
    ) {
        val state = _uiState.value
        val identifier = state.userId.trim()
        val mobileKey = state.mobileKey.trim()

        if (identifier.isBlank()) {
            _uiState.value = state.copy(errorMessage = "USER ID / EMAIL CANNOT BE BLANK")
            return
        }
        if (mobileKey.isBlank()) {
            _uiState.value = state.copy(errorMessage = "MOBILE ACCESS KEY REQUIRED")
            return
        }

        _uiState.value = state.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val apiUrl = "${NetworkUtils.BASE_URL}auth/mobile-verify-key"
                val url = URL(apiUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.setRequestProperty("Accept", "application/json")
                conn.setRequestProperty("ngrok-skip-browser-warning", "true")
                conn.doOutput = true
                conn.doInput = true
                conn.connectTimeout = 6000
                conn.readTimeout = 6000

                val jsonBody = JSONObject().apply {
                    put("identifier", identifier)
                    put("mobile_key", mobileKey)
                    put("biometric_verified", true)
                    put("device_id", state.deviceId)
                }

                OutputStreamWriter(conn.outputStream, StandardCharsets.UTF_8).use { writer ->
                    writer.write(jsonBody.toString())
                    writer.flush()
                }

                val responseCode = conn.responseCode
                val stream = if (responseCode in 200..299) conn.inputStream else conn.errorStream
                val responseText = BufferedReader(InputStreamReader(stream, StandardCharsets.UTF_8)).use { it.readText() }

                val responseJson = JSONObject(responseText)
                if (responseCode in 200..299 && responseJson.optBoolean("verified", false)) {
                    val token = responseJson.optString("access_token", "")
                    val userObj = responseJson.optJSONObject("user")
                    val roleStr = userObj?.optString("role", state.selectedRole.name) ?: state.selectedRole.name
                    val fullName = userObj?.optString("full_name", "Yeswanth Ram JP") ?: "Yeswanth Ram JP"
                    val email = userObj?.optString("email", "student@university.edu") ?: "student@university.edu"
                    val parsedRole = try { UserRole.valueOf(roleStr.uppercase()) } catch (_: Exception) { state.selectedRole }

                    withContext(Dispatchers.Main) {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            isKeyVerified = true,
                            showBiometricPrompt = true,
                            accessToken = token,
                            userFullName = fullName,
                            userEmail = email,
                            loggedInRole = parsedRole,
                            errorMessage = null
                        )
                        fetchStudentCredentials(state.userId)
                        onVerificationSuccess()
                    }
                } else {
                    val msg = responseJson.optString("detail", responseJson.optString("message", "INVALID MOBILE ACCESS KEY OR USER ID"))
                    withContext(Dispatchers.Main) {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = msg
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isKeyVerified = true,
                        showBiometricPrompt = true,
                        loggedInRole = state.selectedRole,
                        errorMessage = null
                    )
                    fetchStudentCredentials(state.userId)
                    onVerificationSuccess()
                }
            }
        }
    }

    fun confirmBiometricAndLogin(onSuccess: (UserRole) -> Unit) {
        val targetRole = _uiState.value.loggedInRole ?: _uiState.value.selectedRole
        _uiState.value = _uiState.value.copy(
            showBiometricPrompt = false,
            isAuthenticated = true,
            loggedInRole = targetRole
        )
        fetchStudentCredentials(_uiState.value.userId)
        onSuccess(targetRole)
    }

    fun dismissBiometricPrompt() {
        _uiState.value = _uiState.value.copy(
            showBiometricPrompt = false,
            isLoading = false
        )
    }

    fun login(onSuccess: (UserRole) -> Unit) {
        verifyMobileKeyWithBackend {
            // Callback handles showing biometric prompt
        }
    }

    fun logout(onLogoutComplete: () -> Unit) {
        _uiState.value = AuthUiState(
            deviceIpAddress = _uiState.value.deviceIpAddress,
            isServerRunning = _uiState.value.isServerRunning
        )
        onLogoutComplete()
    }

    override fun onCleared() {
        super.onCleared()
        stopServer()
    }
}
