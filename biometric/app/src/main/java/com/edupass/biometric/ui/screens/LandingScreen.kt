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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.components.BrutalistButton
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange
import com.edupass.biometric.ui.theme.StudioGrey

@Composable
fun LandingScreen(
    onNavigateToLogin: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioGrey)
    ) {
        // TOP HEADER BRANDING BAR
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(CrispWhite)
                .border(2.dp, PitchBlack)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "EDUPASS.IO",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Black,
                fontSize = 12.sp,
                color = PitchBlack
            )
            Text(
                text = "v1.0-PASS",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = PitchBlack
            )
        }

        // MAIN CENTERED CONTENT CONTAINER
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CrispWhite)
                    .border(3.dp, PitchBlack)
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "PRIVACY PASSPORT",
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Black,
                    fontSize = 36.sp,
                    lineHeight = 40.sp,
                    letterSpacing = (-1).sp,
                    color = PitchBlack,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                BrutalistButton(
                    text = "CONTINUE TO LOGIN",
                    tag = "01",
                    backgroundColor = SafetyOrange,
                    contentColor = PitchBlack,
                    onClick = onNavigateToLogin
                )
            }
        }
    }
}
