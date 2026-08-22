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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.VpnKey
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
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

@Composable
fun InstitutionDashboardScreen(
    viewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()
    var batchStatusMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioGrey)
            .verticalScroll(scrollState)
    ) {
        // HEADER BAR
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
                Icon(Icons.Default.School, contentDescription = null, tint = PitchBlack)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "INSTITUTION ISSUER PORTAL",
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
            // INSTITUTION IDENTITY HERO CARD
            BrutalistCard(
                backgroundColor = PitchBlack,
                shadowOffset = 6.dp
            ) {
                Text(
                    text = "ACADEMIC ISSUER WORKBENCH",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = SafetyOrange
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "INSTITUTION CODE: ${state.userId}",
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = CrispWhite
                )
                Text(
                    text = "MASSACHUSETTS INSTITUTE OF TECHNOLOGY // REGISTRAR DEPT",
                    fontFamily = FontFamily.SansSerif,
                    fontSize = 12.sp,
                    color = CrispWhite.copy(alpha = 0.8f)
                )

                Spacer(modifier = Modifier.height(12.dp))
                Divider(color = SafetyOrange, thickness = 1.dp)
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("SIGNING KEY: Groth16-ZK", fontFamily = FontFamily.Monospace, fontSize = 9.sp, color = CrispWhite)
                    Text("STATUS: ACTIVE ISSUER", fontFamily = FontFamily.Monospace, fontSize = 9.sp, color = AccentGreen)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // STATS TILES
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(CrispWhite)
                        .border(2.dp, PitchBlack)
                        .padding(12.dp)
                ) {
                    Column {
                        Text("ISSUED PROOFS", fontFamily = FontFamily.Monospace, fontSize = 9.sp, color = MutedText)
                        Text("1,420", fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Black, fontSize = 22.sp, color = PitchBlack)
                    }
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(CrispWhite)
                        .border(2.dp, PitchBlack)
                        .padding(12.dp)
                ) {
                    Column {
                        Text("DATA LEAKS", fontFamily = FontFamily.Monospace, fontSize = 9.sp, color = MutedText)
                        Text("0.00%", fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Black, fontSize = 22.sp, color = AccentGreen)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // BATCH CREDENTIAL ISSUANCE WORKFLOW
            Text(
                text = "[01] BATCH CREDENTIAL ISSUANCE:",
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
                Text(
                    text = "ISSUE TRANSCRIPTS & DEGREE PROOFS",
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    color = PitchBlack
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Cryptographically sign student transcript claims with zero-knowledge circuits.",
                    fontFamily = FontFamily.SansSerif,
                    fontSize = 11.sp,
                    color = MutedText
                )

                Spacer(modifier = Modifier.height(14.dp))

                BrutalistButton(
                    text = "EXECUTE BATCH TRANSCRIPT SIGNING",
                    tag = "BATCH-ISSUE",
                    backgroundColor = SafetyOrange,
                    contentColor = PitchBlack,
                    onClick = {
                        batchStatusMessage = "BATCH #2026-B SUCCESSFUL: 48 VERIFIABLE TRANSCRIPT PROOFS SIGNED & ANCHORED"
                    }
                )

                if (batchStatusMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(StudioGrey)
                            .border(1.5.dp, PitchBlack)
                            .padding(10.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = AccentGreen)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = batchStatusMessage!!,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                color = PitchBlack
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // STUDENT ROSTER
            Text(
                text = "[02] ACTIVE STUDENT ROSTER:",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = PitchBlack
            )

            Spacer(modifier = Modifier.height(8.dp))

            val roster = listOf(
                Pair("STU-2026-8890", "RAMESH KUMAR • B.SC COMPUTER SCIENCE"),
                Pair("STU-2026-8891", "PRIYA SHARMA • M.SC DATA SCIENCE"),
                Pair("STU-2026-8892", "ALEX CHEN • B.ENG ROBOTICS")
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CrispWhite)
                    .border(2.dp, PitchBlack)
            ) {
                roster.forEachIndexed { idx, item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(item.first, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text(item.second, fontFamily = FontFamily.SansSerif, fontSize = 11.sp, color = MutedText)
                        }
                        Box(
                            modifier = Modifier
                                .background(SafetyOrange)
                                .border(1.dp, PitchBlack)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text("ANCHORED", fontFamily = FontFamily.Monospace, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    if (idx < roster.size - 1) {
                        Divider(color = PitchBlack, thickness = 1.dp)
                    }
                }
            }
        }
    }
}
