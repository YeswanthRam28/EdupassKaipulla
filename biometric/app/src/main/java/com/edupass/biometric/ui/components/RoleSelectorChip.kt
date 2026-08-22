package com.edupass.biometric.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RectangleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edupass.biometric.ui.theme.CrispWhite
import com.edupass.biometric.ui.theme.PitchBlack
import com.edupass.biometric.ui.theme.SafetyOrange

enum class UserRole(val displayName: String, val idPlaceholder: String, val demoId: String) {
    STUDENT("STUDENT", "Student DID / Roll No (e.g. STU-2026-8890)", "STU-2026-8890"),
    INSTITUTION("INSTITUTION", "Institution Code (e.g. INST-MIT-001)", "INST-MIT-001"),
    VERIFIER("VERIFIER", "Verifier Key (e.g. VRF-GOV-9912)", "VRF-GOV-9912"),
    EMPLOYER("EMPLOYER", "Company ID (e.g. EMP-FAANG-4401)", "EMP-FAANG-4401")
}

@Composable
fun RoleSelectorChip(
    selectedRole: UserRole,
    onRoleSelected: (UserRole) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(CrispWhite, RectangleShape)
            .border(2.dp, PitchBlack, RectangleShape)
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        UserRole.values().forEach { role ->
            val isSelected = selectedRole == role
            val bg = if (isSelected) SafetyOrange else CrispWhite
            val contentColor = PitchBlack

            Box(
                modifier = Modifier
                    .weight(1f)
                    .background(bg, RectangleShape)
                    .border(1.dp, PitchBlack, RectangleShape)
                    .clickable { onRoleSelected(role) }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = role.displayName,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    color = contentColor,
                    maxLines = 1
                )
            }
        }
    }
}
