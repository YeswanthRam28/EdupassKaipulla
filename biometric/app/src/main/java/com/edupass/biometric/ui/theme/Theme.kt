package com.edupass.biometric.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val EduPassColorScheme = lightColorScheme(
    primary = PitchBlack,
    onPrimary = CrispWhite,
    primaryContainer = SafetyOrange,
    onPrimaryContainer = PitchBlack,
    secondary = SafetyOrange,
    onSecondary = PitchBlack,
    background = StudioGrey,
    onBackground = PitchBlack,
    surface = CrispWhite,
    onSurface = PitchBlack,
    surfaceVariant = StudioGrey,
    onSurfaceVariant = PitchBlack,
    outline = RuleBorder
)

@Composable
fun EduPassTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = EduPassColorScheme,
        typography = BrutalistTypography,
        content = content
    )
}
