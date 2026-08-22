package com.edupass.biometric.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RectangleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.PitchBlack

@Composable
fun BrutalistCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = CrispWhite,
    borderColor: Color = PitchBlack,
    borderWidth: Dp = 2.dp,
    shadowOffset: Dp = 4.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val clickableModifier = if (onClick != null) {
        Modifier.clickable { onClick() }
    } else Modifier

    Box(
        modifier = modifier
            .fillMaxWidth()
            .drawBehind {
                if (shadowOffset > 0.dp) {
                    val shadowPx = shadowOffset.toPx()
                    drawRect(
                        color = PitchBlack,
                        topLeft = Offset(shadowPx, shadowPx),
                        size = size
                    )
                }
            }
            .background(backgroundColor, RectangleShape)
            .border(borderWidth, borderColor, RectangleShape)
            .then(clickableModifier)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            content()
        }
    }
}
