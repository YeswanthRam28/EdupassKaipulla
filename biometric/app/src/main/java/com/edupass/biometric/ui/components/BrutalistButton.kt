package com.edupass.biometric.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange

@Composable
fun BrutalistButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    backgroundColor: Color = SafetyOrange,
    contentColor: Color = PitchBlack,
    tag: String? = null,
    isFullWidth: Boolean = true
) {
    Box(
        modifier = modifier
            .then(if (isFullWidth) Modifier.fillMaxWidth() else Modifier)
            .drawBehind {
                drawRect(
                    color = PitchBlack,
                    topLeft = Offset(3.dp.toPx(), 3.dp.toPx()),
                    size = size
                )
            }
            .background(backgroundColor, RectangleShape)
            .border(2.dp, PitchBlack, RectangleShape)
            .clickable { onClick() }
            .padding(horizontal = 20.dp, vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (tag != null) {
                Text(
                    text = "[$tag]",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = contentColor
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                text = text.uppercase(),
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 14.sp,
                letterSpacing = 0.5.sp,
                color = contentColor
            )
        }
    }
}
