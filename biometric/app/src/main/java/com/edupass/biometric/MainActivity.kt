package com.edupass.biometric

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.edupass.biometric.ui.components.BiometricVerificationDialog
import com.edupass.biometric.ui.navigation.EduPassNavGraph
import com.edupass.biometric.ui.theme.EduPassTheme
import com.edupass.biometric.ui.theme.StudioGrey
import com.edupass.biometric.ui.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            EduPassTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = StudioGrey
                ) {
                    val state by authViewModel.uiState.collectAsState()
                    val navController = rememberNavController()

                    Box(modifier = Modifier.fillMaxSize()) {
                        EduPassNavGraph(
                            navController = navController,
                            authViewModel = authViewModel
                        )

                        // Global Remote Biometric Verification Overlay Trigger
                        if (state.pendingTriggerClientIp != null) {
                            BiometricVerificationDialog(
                                clientIp = state.pendingTriggerClientIp!!,
                                onApprove = { proofHash ->
                                    authViewModel.respondToTrigger(true, proofHash)
                                },
                                onReject = {
                                    authViewModel.respondToTrigger(false, "")
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
