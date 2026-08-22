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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.theme.AccentGreen
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.MutedText
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange
import com.edupass.biometric.ui.theme.StudioGrey
import com.edupass.biometric.ui.viewmodel.AuthViewModel
import com.edupass.biometric.ui.viewmodel.StudentCredential

@Composable
fun StudentDashboardScreen(
    viewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchStudentCredentials()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioGrey)
    ) {
        // TOP BRANDING BAR
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
                Icon(Icons.Default.Person, contentDescription = null, tint = PitchBlack)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "STUDENT PASSPORT PORTAL",
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
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // 1. STUDENT PROFILE INFO HEADER CARD
            Card(
                colors = CardDefaults.cardColors(containerColor = PitchBlack),
                shape = RectangleShape,
                modifier = Modifier
                    .fillMaxWidth()
                    .border(2.dp, PitchBlack)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = state.userFullName ?: "YESWANTH RAM JP",
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Black,
                        fontSize = 22.sp,
                        color = CrispWhite
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "STUDENT ID: ${state.userId}",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = SafetyOrange
                    )
                    Text(
                        text = "EMAIL: ${state.userEmail ?: "student@university.edu"}",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = CrispWhite.copy(alpha = 0.8f)
                    )
                    Text(
                        text = "MOBILE ACCESS KEY: ${state.mobileKey}",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = MutedText
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 2. VERIFIED ACADEMIC DOCUMENTS LIST
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "VERIFIED DOCUMENTS (${state.studentCredentials.size})",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp,
                    color = PitchBlack
                )
                Box(
                    modifier = Modifier
                        .background(AccentGreen)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "ZK ANCHORED",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 9.sp,
                        color = PitchBlack
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(state.studentCredentials) { cred ->
                    StudentCredentialCard(cred = cred)
                }
            }
        }
    }
}

@Composable
fun StudentCredentialCard(cred: StudentCredential) {
    Card(
        colors = CardDefaults.cardColors(containerColor = CrispWhite),
        shape = RectangleShape,
        modifier = Modifier
            .fillMaxWidth()
            .border(2.dp, PitchBlack)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .background(SafetyOrange)
                        .border(1.dp, PitchBlack)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = cred.credentialType,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 9.sp,
                        color = PitchBlack
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Verified",
                        tint = AccentGreen,
                        modifier = Modifier.padding(end = 4.dp)
                    )
                    Text(
                        text = "VERIFIED",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 9.sp,
                        color = AccentGreen
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = cred.degree,
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 16.sp,
                color = PitchBlack
            )

            Text(
                text = "ISSUER: ${cred.institutionName}",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                color = PitchBlack
            )

            if (cred.cgpa != null || cred.credits != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (cred.cgpa != null) {
                        Text(
                            text = "CGPA: ${cred.cgpa}",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = SafetyOrange
                        )
                    }
                    if (cred.credits != null) {
                        Text(
                            text = "CREDITS: ${cred.credits}",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = PitchBlack
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "COMMITMENT: ${cred.commitmentHash}",
                fontFamily = FontFamily.Monospace,
                fontSize = 9.sp,
                color = MutedText
            )
            Text(
                text = "SIGNATURE: ${cred.edupassSignature}",
                fontFamily = FontFamily.Monospace,
                fontSize = 9.sp,
                color = MutedText
            )
        }
    }
}
