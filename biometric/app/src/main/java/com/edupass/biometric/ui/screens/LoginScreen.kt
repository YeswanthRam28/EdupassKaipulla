package com.edupass.biometric.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RectangleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.components.BrutalistButton
import com.edupass.biometric.ui.components.RoleSelectorChip
import com.edupass.biometric.ui.components.UserRole
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.MutedText
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange
import com.edupass.biometric.ui.theme.StudioGrey
import com.edupass.biometric.ui.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onBackToLanding: () -> Unit,
    onLoginSuccess: (UserRole) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

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
                text = "EDUPASS LOGIN // SELECT ROLE",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Black,
                fontSize = 13.sp,
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
                        text = "ROLE ACCESS PORTAL",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = SafetyOrange
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "CHOOSE YOUR IDENTITY",
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp,
                        color = CrispWhite
                    )
                    Text(
                        text = "Access tailored dashboards for Students, Issuing Institutions, Verifiers, and Employers.",
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

                // ROLE-SPECIFIC ID FIELD
                Text(
                    text = state.selectedRole.idPlaceholder.uppercase(),
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

                // PASSWORD FIELD
                Text(
                    text = "PASSWORD / SECURITY PHRASE",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = MutedText
                )
                Spacer(modifier = Modifier.height(4.dp))

                OutlinedTextField(
                    value = state.password,
                    onValueChange = { viewModel.updatePassword(it) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RectangleShape,
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = PitchBlack) },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
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
                    text = "AUTHENTICATE AS ${state.selectedRole.displayName}",
                    tag = "PROCEED",
                    backgroundColor = SafetyOrange,
                    contentColor = PitchBlack,
                    onClick = {
                        viewModel.login { role -> onLoginSuccess(role) }
                    }
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // DEMO ROLE PRESET SHORTCUTS
            Text(
                text = "[02] QUICK DEMO ACCESS PRESETS:",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = PitchBlack
            )
            Spacer(modifier = Modifier.height(8.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CrispWhite)
                    .border(2.dp, PitchBlack)
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                UserRole.values().forEach { role ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(StudioGrey)
                            .border(1.dp, PitchBlack)
                            .clickable {
                                viewModel.selectRole(role)
                                viewModel.login { r -> onLoginSuccess(r) }
                            }
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "LOGIN AS ${role.displayName}",
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = PitchBlack
                            )
                            Text(
                                text = role.demoId,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp,
                                color = MutedText
                            )
                        }
                        Box(
                            modifier = Modifier
                                .background(SafetyOrange)
                                .border(1.dp, PitchBlack)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "TAP TO ENTER ->",
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp,
                                color = PitchBlack
                            )
                        }
                    }
                }
            }
        }
    }
}
