package com.edupass.biometric.ui.viewmodel

import androidx.lifecycle.ViewModel
import com.edupass.biometric.server.BiometricTriggerServer
import com.edupass.biometric.ui.components.UserRole
import com.edupass.biometric.utils.NetworkUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AuthUiState(
    val selectedRole: UserRole = UserRole.STUDENT,
    val userId: String = UserRole.STUDENT.demoId,
    val password: String = "edupass2026",
    val isAuthenticated: Boolean = false,
    val loggedInRole: UserRole? = null,
    val errorMessage: String? = null,
    val isGeneratingProof: Boolean = false,
    val generatedProofHash: String? = null,
    // Server & Trigger State
    val deviceIpAddress: String = NetworkUtils.CONFIGURED_PHONE_IP,
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
        handleIncomingTrigger("100.117.215.39 (LAPTOP)") { approved, hash ->
            val log = if (approved) "LAPTOP TRIGGER APPROVED ($hash)" else "LAPTOP TRIGGER CANCELLED"
            _uiState.value = _uiState.value.copy(latestServerLog = log)
        }
    }

    fun selectRole(role: UserRole) {
        _uiState.value = _uiState.value.copy(
            selectedRole = role,
            userId = role.demoId,
            errorMessage = null
        )
    }

    fun updateUserId(id: String) {
        _uiState.value = _uiState.value.copy(userId = id, errorMessage = null)
    }

    fun updatePassword(pass: String) {
        _uiState.value = _uiState.value.copy(password = pass, errorMessage = null)
    }

    fun login(onSuccess: (UserRole) -> Unit) {
        val state = _uiState.value
        if (state.userId.isBlank()) {
            _uiState.value = state.copy(errorMessage = "ID CANNOT BE BLANK")
            return
        }
        if (state.password.isBlank()) {
            _uiState.value = state.copy(errorMessage = "PASSWORD REQUIRED")
            return
        }

        _uiState.value = state.copy(
            isAuthenticated = true,
            loggedInRole = state.selectedRole,
            errorMessage = null
        )
        onSuccess(state.selectedRole)
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
