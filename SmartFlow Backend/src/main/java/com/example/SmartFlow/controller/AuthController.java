package com.example.SmartFlow.controller;

import com.example.SmartFlow.dto.request.LoginRequest;
import com.example.SmartFlow.dto.request.PatientSignupRequest;
import com.example.SmartFlow.dto.response.ApiResponse;
import com.example.SmartFlow.dto.response.AuthResponse;
import com.example.SmartFlow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
//for all the type of users.
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {
        AuthResponse res = authService.loginUser(req);
        return ResponseEntity.ok(ApiResponse.success("Login successful", res));
    }

    @PostMapping("/superadmin/login")
    public ResponseEntity<ApiResponse<AuthResponse>> superAdminLogin(
            @Valid @RequestBody LoginRequest req) {
        AuthResponse res = authService.loginSuperAdmin(req);
        return ResponseEntity.ok(ApiResponse.success("Login successful", res));
    }

    @PostMapping("/patient/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> patientSignup(
            @Valid @RequestBody PatientSignupRequest req) {
        AuthResponse res = authService.registerPatient(req);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", res));
    }
}