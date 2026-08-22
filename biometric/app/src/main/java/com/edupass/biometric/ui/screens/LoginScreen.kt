package com.edupass.biometric.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import com.edupass.biometric.ui.components.BiometricVerificationDialog
import com.edupass.biometric.ui.components.BrutalistButton
import com.edupass.biometric.ui.components.RoleSelectorChip
import com.edupass.biometric.ui.components.UserRole
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.MutedText
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange
import com.edupass.biometric.ui.theme.StudioGrey
import com.edupass.biometric.ui.viewmodel.AuthViewModel
import com.edupass.biometric.utils.BiometricUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onBackToLanding: () -> Unit,
    onLoginSuccess: (UserRole) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val activity = context as? FragmentActivity

    LaunchedEffect(state.showBiometricPrompt) {
        if (state.showBiometricPrompt && activity != null && BiometricUtils.canAuthenticate(context)) {
            BiometricUtils.showBiometricPrompt(
                activity = activity,
                title = "Verify your identity",
                subtitle = "Confirm fingerprint or Face ID to unlock EduPass Passport",
                onSuccess = {
                    viewModel.confirmBiometricAndLogin(onSuccess = onLoginSuccess)
                },
                onError = { _ ->
                    // Fallback to overlay dialog if native prompt is cancelled or errors
                }
            )
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(StudioGrey)
                .verticalScroll(scrollState)
        ) {
            // TOP NAVIGATION HEADER
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CrispWhite)
                    .border(2.dp, PitchBlack)
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBackToLanding) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PitchBlack)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "EDUPASS LOGIN // MOBILE ACCESS KEY & BIOMETRIC AUTH",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Black,
                    fontSize = 12.sp,
                    color = PitchBlack
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // HERO CARD HEADER
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PitchBlack)
                        .padding(16.dp)
                ) {
                    Column {
                        Text(
                            text = "MOBILE ACCESS PORTAL",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = SafetyOrange
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "BIOMETRIC KEY LOGIN",
                            fontFamily = FontFamily.SansSerif,
                            fontWeight = FontWeight.Black,
                            fontSize = 24.sp,
                            color = CrispWhite
                        )
                        Text(
                            text = "Enter your User ID & Unique Mobile Access Key from Web Dashboard to unlock your encrypted passport.",
                            fontFamily = FontFamily.SansSerif,
                            fontSize = 12.sp,
                            color = CrispWhite.copy(alpha = 0.8f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // ROLE SELECTOR TAB CHIPS
                Text(
                    text = "[01] SELECT ROLE CATEGORY:",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = PitchBlack
                )
                Spacer(modifier = Modifier.height(8.dp))

                RoleSelectorChip(
                    selectedRole = state.selectedRole,
                    onRoleSelected = { role -> viewModel.selectRole(role) }
                )

                Spacer(modifier = Modifier.height(20.dp))

                // CREDENTIAL INPUT CARD
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(CrispWhite)
                        .border(2.dp, PitchBlack)
                        .padding(16.dp)
                ) {
                    Text(
                        text = "ENTER ${state.selectedRole.displayName} CREDENTIALS",
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        color = PitchBlack
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // INPUT FIELD 1: USER ID OR EMAIL
                    Text(
                        text = "USER ID / EMAIL (E.G. EDU-2026-0687)",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = MutedText
                    )
                    Spacer(modifier = Modifier.height(4.dp))

                    OutlinedTextField(
                        value = state.userId,
                        onValueChange = { viewModel.updateUserId(it) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RectangleShape,
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = PitchBlack) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(
                            focusedBorderColor = SafetyOrange,
                            unfocusedBorderColor = PitchBlack,
                            cursorColor = PitchBlack
                        ),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // INPUT FIELD 2: UNIQUE MOBILE ACCESS KEY
                    Text(
                        text = "UNIQUE MOBILE ACCESS KEY",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = MutedText
                    )
                    Spacer(modifier = Modifier.height(4.dp))

                    OutlinedTextField(
                        value = state.mobileKey,
                        onValueChange = { viewModel.updateMobileKey(it) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RectangleShape,
                        leadingIcon = { Icon(Icons.Default.Key, contentDescription = null, tint = PitchBlack) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(
                            focusedBorderColor = SafetyOrange,
                            unfocusedBorderColor = PitchBlack,
                            cursorColor = PitchBlack
                        ),
                        singleLine = true
                    )

                    if (state.errorMessage != null) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SafetyOrange)
                                .border(1.dp, PitchBlack)
                                .padding(8.dp)
                        ) {
                            Text(
                                text = "ERROR: ${state.errorMessage}",
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                color = PitchBlack
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    BrutalistButton(
                        text = if (state.isLoading) "VERIFYING KEY WITH SERVER..." else "PROCEED WITH BIOMETRIC AUTH",
                        tag = "BIOMETRIC",
                        backgroundColor = SafetyOrange,
                        contentColor = PitchBlack,
                        onClick = {
                            viewModel.verifyMobileKeyWithBackend {
                                // Trigger Biometric Authentication Prompt
                            }
                        }
                    )
                }
            }
        }

        // BIOMETRIC AUTHENTICATION PROMPT OVERLAY TRIGGERED UPON SUCCESSFUL KEY VERIFICATION
        if (state.showBiometricPrompt) {
            BiometricVerificationDialog(
                clientIp = "DEVICE BIOMETRIC SENSOR",
                onApprove = { _ ->
                    viewModel.confirmBiometricAndLogin(onSuccess = onLoginSuccess)
                },
                onReject = {
                    viewModel.dismissBiometricPrompt()
                }
            )
        }
    }
}
