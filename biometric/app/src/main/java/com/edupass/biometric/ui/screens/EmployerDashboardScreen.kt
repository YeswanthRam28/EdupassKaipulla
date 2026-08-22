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
import androidx.compose.foundation.shape.RectangleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.PersonSearch
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
fun EmployerDashboardScreen(
    viewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()
    var requestSentMessage by remember { mutableStateOf<String?>(null) }

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
                Icon(Icons.Default.Business, contentDescription = null, tint = PitchBlack)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "EMPLOYER RECRUITING PORTAL",
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
                    text = "VERIFIED CANDIDATE RECRUITING WORKBENCH",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = SafetyOrange
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "COMPANY ID: ${state.userId}",
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Black,
                    fontSize = 18.sp,
                    color = CrispWhite
                )
                Text(
                    text = "GLOBAL RECRUITING DIVISION // VERIFIED APPLICANTS",
                    fontFamily = FontFamily.SansSerif,
                    fontSize = 12.sp,
                    color = CrispWhite.copy(alpha = 0.8f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // CANDIDATE VERIFICATION REQUEST TOOL
            Text(
                text = "[01] REQUEST INSTANT PROOF FROM APPLICANT:",
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
                    Icon(Icons.Default.PersonSearch, contentDescription = null, tint = PitchBlack)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "ONE-CLICK PROOF REQUEST",
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        color = PitchBlack
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Request Zero-Knowledge degree & biometric validation directly from candidates without requesting PDF transcripts.",
                    fontFamily = FontFamily.SansSerif,
                    fontSize = 11.sp,
                    color = MutedText
                )

                Spacer(modifier = Modifier.height(14.dp))

                BrutalistButton(
                    text = "SEND VERIFICATION REQUEST TO RAMESH KUMAR",
                    tag = "DISPATCH",
                    backgroundColor = SafetyOrange,
                    contentColor = PitchBlack,
                    onClick = {
                        requestSentMessage = "REQUEST DISPATCHED TO STUDENT DID STU-2026-8890. AWAITING ZK PROOF PRESENTATION."
                    }
                )

                if (requestSentMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(StudioGrey)
                            .border(1.5.dp, PitchBlack)
                            .padding(10.dp)
                    ) {
                        Text(
                            text = requestSentMessage!!,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp,
                            color = PitchBlack
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // CANDIDATES LIST
            Text(
                text = "[02] APPLICANT VERIFICATION LOG:",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = PitchBlack
            )

            Spacer(modifier = Modifier.height(8.dp))

            val applicants = listOf(
                Triple("RAMESH KUMAR", "STU-2026-8890 • B.SC CS (MIT)", "VERIFIED (GPA > 3.5)"),
                Triple("PRIYA SHARMA", "STU-2026-8891 • M.SC DATA SCIENCE", "VERIFIED (DEGREE)"),
                Triple("ALEX CHEN", "STU-2026-8892 • B.ENG ROBOTICS", "PENDING PROOF")
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CrispWhite)
                    .border(2.dp, PitchBlack)
            ) {
                applicants.forEachIndexed { idx, item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.first, fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Black, fontSize = 13.sp)
                            Text(item.second, fontFamily = FontFamily.Monospace, fontSize = 10.sp, color = MutedText)
                        }
                        Box(
                            modifier = Modifier
                                .background(if (item.third.startsWith("VERIFIED")) AccentGreen else SafetyOrange)
                                .border(1.dp, PitchBlack)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(item.third, fontFamily = FontFamily.Monospace, fontSize = 8.sp, fontWeight = FontWeight.Bold, color = PitchBlack)
                        }
                    }
                    if (idx < applicants.size - 1) {
                        Divider(color = PitchBlack, thickness = 1.dp)
                    }
                }
            }
        }
    }
}
