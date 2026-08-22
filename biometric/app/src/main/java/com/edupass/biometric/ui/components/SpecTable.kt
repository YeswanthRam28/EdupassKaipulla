package com.edupass.biometric.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.MutedText
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange

data class SpecRowData(
    val label: String,
    val value: String
)

@Composable
fun SpecTable(
    title: String = "PASSPORT",
    subtitle: String = "A verifiable graduation paper claim encrypted with Zero-Knowledge proofs for identity, transcript, and biometric validity.",
    specs: List<SpecRowData> = listOf(
        SpecRowData("DOMAIN", "0X19"),
        SpecRowData("CIRCUITRY", "WC"),
        SpecRowData("SALT/HASH", "8C"),
        SpecRowData("TESTING", "01D"),
        SpecRowData("SPEC", "05+")
    ),
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(CrispWhite, RectangleShape)
            .border(2.dp, PitchBlack, RectangleShape)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 24.sp,
                color = PitchBlack
            )
            Box(
                modifier = Modifier
                    .background(SafetyOrange, RectangleShape)
                    .border(1.dp, PitchBlack, RectangleShape)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "V.1.0-PASSPORT",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    color = PitchBlack
                )
            }
        }

        Text(
            text = subtitle,
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            color = MutedText,
            modifier = Modifier.padding(vertical = 10.dp)
        )

        Divider(color = PitchBlack, thickness = 1.5.dp)

        specs.forEach { spec ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = spec.label,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = PitchBlack
                )
                Text(
                    text = spec.value,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = SafetyOrange
                )
            }
            Divider(color = PitchBlack.copy(alpha = 0.3f), thickness = 1.dp)
        }
    }
}
