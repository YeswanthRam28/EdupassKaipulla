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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.components.BrutalistButton
import com.edupass.biometric.ui.components.OrangeMarqueeBanner
import com.edupass.biometric.ui.components.SpecTable
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.MutedText
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange
import com.edupass.biometric.ui.theme.StudioGrey

@Composable
fun LandingScreen(
    onNavigateToLogin: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioGrey)
            .verticalScroll(scrollState)
    ) {
        // 1. TOP HEADER BRANDING BAR
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(CrispWhite)
                .border(2.dp, PitchBlack)
                .padding(horizontal = 16.dp, vertical = 10.dp),
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
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("ABOUT", fontFamily = FontFamily.Monospace, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text("TOOLS", fontFamily = FontFamily.Monospace, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text("SPECS", fontFamily = FontFamily.Monospace, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }

        // 2. HERO TITLE SECTION
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "ABOUT\nNATIONAL UNIVERSITY REPORTING SERVICE PROVES THAT SOME TRANSCRIPTS ARE FALSIFIED... EDUPASS PROOFS DO NOT LEAK SENSITIVE DATA",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 9.sp,
                    color = MutedText,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    text = "VERTICAL CREDENTIAL LOGO\n\nDON'T SEND YOUR TRANSCRIPT.\nPROVE IT.",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 9.sp,
                    color = MutedText,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "PRIVACY\nPASSPORT",
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 42.sp,
                lineHeight = 44.sp,
                letterSpacing = (-1).sp,
                color = PitchBlack
            )
        }

        // 3. SAFETY ORANGE MARQUEE TICKER BANNER
        OrangeMarqueeBanner()

        // 4. MAIN VALUE PROPOSITION SECTION
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(CrispWhite)
                        .border(2.dp, PitchBlack)
                        .padding(12.dp)
                ) {
                    Text(
                        text = "PROVE WHAT MATTERS WITHOUT REVEALING EVERYTHING ELSE",
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp,
                        color = PitchBlack
                    )
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(CrispWhite)
                        .border(2.dp, PitchBlack)
                        .padding(12.dp)
                ) {
                    Text(
                        text = "RECORDS OWNED BY THE STUDENT, NOT THE GATEKEEPER",
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp,
                        color = PitchBlack
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 5. NUMBERED FEATURES LIST [01] - [05]
            val features = listOf(
                Pair("[01] VERIFIABLE CREDENTIALS", "Delivery mechanism for hardened, privacy-respecting credentials."),
                Pair("[02] ZERO-KNOWLEDGE PROOFS", "Generating responsive interfaces with cryptographic detail, instant verification."),
                Pair("[03] AI BIOMETRIC AGENT", "Biometric verification and identity anchor to prove authenticity without revealing raw data."),
                Pair("[04] INSTANT VERIFICATION", "Transforming state claims into seamless, privacy-respecting verifiable proofs."),
                Pair("[05] CREDENTIAL FIREWALL", "Privacy-centric shield that prevents unauthorized data harvesting.")
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CrispWhite)
                    .border(2.dp, PitchBlack)
            ) {
                features.forEachIndexed { index, item ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp)
                    ) {
                        Text(
                            text = item.first,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = PitchBlack
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = item.second,
                            fontFamily = FontFamily.SansSerif,
                            fontSize = 12.sp,
                            color = MutedText
                        )
                    }
                    if (index < features.size - 1) {
                        Divider(color = PitchBlack, thickness = 1.dp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 6. SPEC TABLE COMPONENT
            SpecTable()

            Spacer(modifier = Modifier.height(20.dp))

            // 7. HERO HEADLINE SECTION
            Text(
                text = "DON'T SEND YOUR TRANSCRIPT. PROVE IT.",
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 28.sp,
                lineHeight = 32.sp,
                color = PitchBlack
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 8. PROJECT CARDS (DASH & RACEPOINT)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Dash Card
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .background(CrispWhite)
                        .border(2.dp, PitchBlack)
                        .padding(12.dp)
                ) {
                    Text("[01]", fontFamily = FontFamily.Monospace, fontSize = 10.sp, color = MutedText)
                    Text("DASH", fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Black, fontSize = 18.sp)
                    Text("VERIFIABLE DEGREE", fontFamily = FontFamily.Monospace, fontSize = 9.sp, color = MutedText)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "A zero-knowledge degree proof created for instant employer verification.",
                        fontFamily = FontFamily.SansSerif,
                        fontSize = 11.sp,
                        color = PitchBlack
                    )
                }

                // Racepoint Card
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .background(CrispWhite)
                        .border(2.dp, PitchBlack)
                        .padding(12.dp)
                ) {
                    Text("[02]", fontFamily = FontFamily.Monospace, fontSize = 10.sp, color = MutedText)
                    Text("RACEPOINT", fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Black, fontSize = 18.sp)
                    Text("VERIFIABLE IDENTITY", fontFamily = FontFamily.Monospace, fontSize = 9.sp, color = MutedText)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "An encrypted biometric credential bound to official university transcripts.",
                        fontFamily = FontFamily.SansSerif,
                        fontSize = 11.sp,
                        color = PitchBlack
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 9. MASSIVE SAFETY ORANGE FOOTER CALLOUT BANNER
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SafetyOrange)
                .border(2.dp, PitchBlack)
                .padding(20.dp)
        ) {
            Text(
                text = "LET'S MAKE YOUR NEXT CREDENTIAL VERIFIABLE.",
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 32.sp,
                lineHeight = 36.sp,
                color = PitchBlack
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "IT'S TIME TRANSCRIPTS DIDN'T TAKE WEEKS. EDUPASS PROOFS TAKE SECONDS.",
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp,
                color = PitchBlack
            )

            Spacer(modifier = Modifier.height(20.dp))

            BrutalistButton(
                text = "ENTER APP & LOGIN ROLE",
                tag = "01",
                backgroundColor = PitchBlack,
                contentColor = SafetyOrange,
                onClick = onNavigateToLogin
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "EDUPASS",
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 54.sp,
                letterSpacing = (-2).sp,
                color = PitchBlack,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}
