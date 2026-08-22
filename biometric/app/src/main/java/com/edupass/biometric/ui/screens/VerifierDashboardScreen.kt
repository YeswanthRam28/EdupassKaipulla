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
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.components.BrutalistButton
import com.edupass.biometric.ui.components.BrutalistCard
import com.edupass.biometric.ui.theme.AccentGreen
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.MutedText
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange
import com.edupass.biometric.ui.theme.StudioGrey
import com.edupass.biometric.ui.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VerifierDashboardScreen(
    viewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()
    var inputHash by remember { mutableStateOf("0x8F92A13904B8C127D9E4") }
    var verificationResult by remember { mutableStateOf<Boolean?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioGrey)
            .verticalScroll(scrollState)
    ) {
        // TOP APP BAR
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(CrispWhite)
                .border(2.dp, PitchBlack)
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = PitchBlack)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "VERIFIER PORTAL",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp,
                    color = PitchBlack
                )
            }
            IconButton(onClick = onLogout) {
                Icon(Icons.Default.ExitToApp, contentDescription = "Logout", tint = PitchBlack)
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // HERO CARD
            BrutalistCard(
                backgroundColor = PitchBlack,
                shadowOffset = 6.dp
            ) {
                Text(
                    text = "INSTANT PROOF VERIFICATION ENGINE",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = SafetyOrange
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "LICENSE KEY: ${state.userId}",
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Black,
                    fontSize = 18.sp,
                    color = CrispWhite
                )
                Text(
                    text = "NATIONAL ACCREDITATION AGENCY // GOVT VERIFIER",
                    fontFamily = FontFamily.SansSerif,
                    fontSize = 12.sp,
                    color = CrispWhite.copy(alpha = 0.8f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // SCANNER SIMULATOR & INPUT
            Text(
                text = "[01] VERIFY STUDENT PROOF / HASH:",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = PitchBlack
            )

            Spacer(modifier = Modifier.height(8.dp))

            BrutalistCard(
                backgroundColor = CrispWhite,
                shadowOffset = 4.dp
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = SafetyOrange)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "ZERO-KNOWLEDGE AUDIT SCANNER",
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        color = PitchBlack
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "PASTE PROOF STRING OR SCAN PRESENTED QR",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = MutedText
                )
                Spacer(modifier = Modifier.height(4.dp))

                OutlinedTextField(
                    value = inputHash,
                    onValueChange = { inputHash = it },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RectangleShape,
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        focusedBorderColor = SafetyOrange,
                        unfocusedBorderColor = PitchBlack
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(14.dp))

                BrutalistButton(
                    text = "VERIFY ZK PROOF VALIDITY",
                    tag = "VERIFY",
                    backgroundColor = SafetyOrange,
                    contentColor = PitchBlack,
                    onClick = {
                        verificationResult = true
                    }
                )

                if (verificationResult == true) {
                    Spacer(modifier = Modifier.height(14.dp))
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(StudioGrey)
                            .border(2.dp, PitchBlack)
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = AccentGreen)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "PROOF VALIDATED — 100% GENUINE",
                                    fontFamily = FontFamily.SansSerif,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp,
                                    color = PitchBlack
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "CLAIM: Degree B.Sc CS Valid • GPA > 3.5 Verified • MIT Issuer Key Match",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp,
                            color = PitchBlack
                        )
                        Text(
                            text = "ZERO DATA LEAKAGE: RAW TRANSCRIPT WAS NOT REVEALED",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.sp,
                            color = AccentGreen
                        )
                    }
                }
            }
        }
    }
}
