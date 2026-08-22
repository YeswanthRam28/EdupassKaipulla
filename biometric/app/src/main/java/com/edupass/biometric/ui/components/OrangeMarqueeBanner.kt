package com.edupass.biometric.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange

@Composable
fun OrangeMarqueeBanner(
    text: String = "GETTING A TRANSCRIPT TAKES WEEKS. VERIFYING ONE TAKES ANOTHER. EDUPASS TAKES SECONDS. • ",
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "marquee")
    val offsetX by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = -600f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 10000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "offset"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(SafetyOrange, RectangleShape)
            .border(2.dp, PitchBlack, RectangleShape)
            .clipToBounds()
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Row(
            modifier = Modifier.offset { IntOffset(offsetX.toInt(), 0) }
        ) {
            val fullText = text + text + text
            Text(
                text = fullText,
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 13.sp,
                letterSpacing = 0.5.sp,
                color = PitchBlack,
                maxLines = 1
            )
        }
    }
}
