package com.edupass.biometric.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.edupass.biometric.ui.components.UserRole
import com.edupass.biometric.ui.screens.EmployerDashboardScreen
import com.edupass.biometric.ui.screens.HomeScreen
import com.edupass.biometric.ui.screens.InstitutionDashboardScreen
import com.edupass.biometric.ui.screens.LandingScreen
import com.edupass.biometric.ui.screens.LoginScreen
import com.edupass.biometric.ui.screens.StudentDashboardScreen
import com.edupass.biometric.ui.screens.VerifierDashboardScreen
import com.edupass.biometric.ui.viewmodel.AuthViewModel

object Routes {
    const val LANDING = "landing"
    const val LOGIN = "login"
    const val STUDENT_DASHBOARD = "student_dashboard"
    const val INSTITUTION_DASHBOARD = "institution_dashboard"
    const val VERIFIER_DASHBOARD = "verifier_dashboard"
    const val EMPLOYER_DASHBOARD = "employer_dashboard"
}

@Composable
fun EduPassNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Routes.LANDING
    ) {
        composable(Routes.LANDING) {
            LandingScreen(
                onNavigateToLogin = {
                    navController.navigate(Routes.LOGIN)
                }
            )
        }

        composable(Routes.LOGIN) {
            LoginScreen(
                viewModel = authViewModel,
                onBackToLanding = {
                    navController.popBackStack()
                },
                onLoginSuccess = { role ->
                    val destination = when (role) {
                        UserRole.STUDENT -> Routes.STUDENT_DASHBOARD
                        UserRole.INSTITUTION -> Routes.INSTITUTION_DASHBOARD
                        UserRole.VERIFIER -> Routes.VERIFIER_DASHBOARD
                        UserRole.EMPLOYER -> Routes.EMPLOYER_DASHBOARD
                    }
                    navController.navigate(destination) {
                        popUpTo(Routes.LANDING) { inclusive = false }
                    }
                }
            )
        }

        composable(Routes.STUDENT_DASHBOARD) {
            StudentDashboardScreen(
                viewModel = authViewModel,
                onLogout = {
                    authViewModel.logout {
                        navController.navigate(Routes.LANDING) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                }
            )
        }

        composable(Routes.INSTITUTION_DASHBOARD) {
            InstitutionDashboardScreen(
                viewModel = authViewModel,
                onLogout = {
                    authViewModel.logout {
                        navController.navigate(Routes.LANDING) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                }
            )
        }

        composable(Routes.VERIFIER_DASHBOARD) {
            VerifierDashboardScreen(
                viewModel = authViewModel,
                onLogout = {
                    authViewModel.logout {
                        navController.navigate(Routes.LANDING) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                }
            )
        }

        composable(Routes.EMPLOYER_DASHBOARD) {
            EmployerDashboardScreen(
                viewModel = authViewModel,
                onLogout = {
                    authViewModel.logout {
                        navController.navigate(Routes.LANDING) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                }
            )
        }
    }
}
