package com.edupass.biometric.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RectangleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CellTower
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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

@Composable
fun ServerStatusCard(
    deviceIp: String,
    port: Int = 8080,
    isServerRunning: Boolean,
    onToggleServer: () -> Unit,
    onTestTrigger: () -> Unit,
    recentLog: String? = null,
    modifier: Modifier = Modifier
) {
    val endpointUrl = "http://$deviceIp:$port/trigger"

    BrutalistCard(
        backgroundColor = PitchBlack,
        shadowOffset = 6.dp,
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.CellTower, contentDescription = null, tint = SafetyOrange)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "BIOMETRIC TRIGGER SERVER",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Black,
                    fontSize = 12.sp,
                    color = SafetyOrange
                )
            }
            Box(
                modifier = Modifier
                    .background(if (isServerRunning) AccentGreen else SafetyOrange)
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = if (isServerRunning) "PORT $port ONLINE" else "SERVER STOPPED",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 9.sp,
                    color = PitchBlack
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Divider(color = SafetyOrange, thickness = 1.dp)
        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "PHONE IP: $deviceIp  //  LAPTOP IP: 100.117.215.39",
            fontFamily = FontFamily.Monospace,
            fontSize = 9.sp,
            color = AccentGreen
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "TRIGGER ENDPOINT URL (CALL FROM LAPTOP):",
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            color = CrispWhite.copy(alpha = 0.7f)
        )
        Spacer(modifier = Modifier.height(2.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(StudioGrey)
                .border(1.5.dp, PitchBlack)
                .padding(horizontal = 10.dp, vertical = 8.dp)
        ) {
            Text(
                text = endpointUrl,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = PitchBlack
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            BrutalistButton(
                text = "LAPTOP TEST TRIGGER",
                tag = "100.117.215.39",
                backgroundColor = SafetyOrange,
                contentColor = PitchBlack,
                isFullWidth = false,
                modifier = Modifier.weight(1f),
                onClick = onTestTrigger
            )

            BrutalistButton(
                text = if (isServerRunning) "STOP" else "START",
                backgroundColor = CrispWhite,
                contentColor = PitchBlack,
                isFullWidth = false,
                modifier = Modifier.weight(0.7f),
                onClick = onToggleServer
            )
        }

        if (recentLog != null) {
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "LAST EVENT: $recentLog",
                fontFamily = FontFamily.Monospace,
                fontSize = 9.sp,
                color = AccentGreen
            )
        }
    }
}
