package com.edupass.biometric.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RectangleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.edupass.biometric.ui.theme.AccentGreen
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.MutedText
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange
import com.edupass.biometric.ui.theme.StudioGrey

@Composable
fun BiometricVerificationDialog(
    clientIp: String,
    onApprove: (String) -> Unit,
    onReject: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    Dialog(
        onDismissRequest = onReject,
        properties = DialogProperties(dismissOnBackPress = true, dismissOnClickOutside = false)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(PitchBlack, RectangleShape)
                .border(3.dp, SafetyOrange, RectangleShape)
                .padding(20.dp)
        ) {
            // HEADER BAR
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Security, contentDescription = null, tint = SafetyOrange)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "REMOTE BIOMETRIC TRIGGER",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Black,
                        fontSize = 13.sp,
                        color = SafetyOrange
                    )
                }
                Box(
                    modifier = Modifier
                        .background(SafetyOrange)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "INCOMING HTTP",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 8.sp,
                        color = PitchBlack
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
            Divider(color = SafetyOrange, thickness = 1.dp)
            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "REQUESTING HOST: $clientIp",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = CrispWhite
            )

            Text(
                text = "ACTION: Biometric Authentication & ZK-Proof Generation requested via http://$clientIp:8080/trigger",
                fontFamily = FontFamily.SansSerif,
                fontSize = 11.sp,
                color = CrispWhite.copy(alpha = 0.8f),
                modifier = Modifier.padding(vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(20.dp))

            // ANIMATED BIOMETRIC SENSOR TARGET
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
                    .background(StudioGrey)
                    .border(2.dp, PitchBlack)
                    .clickable {
                        val proofHash = "0x" + (1..32).map { "0123456789ABCDEF".random() }.joinToString("")
                        onApprove(proofHash)
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Fingerprint,
                        contentDescription = "Scan",
                        tint = SafetyOrange,
                        modifier = Modifier
                            .size(54.dp)
                            .scale(pulseScale)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "TAP HERE TO AUTHENTICATE FINGERPRINT / FACE ID",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 9.sp,
                        color = PitchBlack
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(SafetyOrange)
                        .border(1.5.dp, PitchBlack)
                        .clickable {
                            val proofHash = "0x" + (1..32).map { "0123456789ABCDEF".random() }.joinToString("")
                            onApprove(proofHash)
                        }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "APPROVE & SIGN",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Black,
                        fontSize = 11.sp,
                        color = PitchBlack
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(CrispWhite)
                        .border(1.5.dp, PitchBlack)
                        .clickable { onReject() }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "REJECT",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = PitchBlack
                    )
                }
            }
        }
    }
}
