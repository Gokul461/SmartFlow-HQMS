package com.example.SmartFlow.controller;

import com.example.SmartFlow.dto.request.AdminSignupRequest;
import com.example.SmartFlow.dto.response.ApiResponse;
import com.example.SmartFlow.dto.response.AuthResponse;
import com.example.SmartFlow.dto.response.HospitalResponse;
import com.example.SmartFlow.dto.response.UserResponse;
import com.example.SmartFlow.entity.User;
import com.example.SmartFlow.repository.HospitalRepository;
import com.example.SmartFlow.service.AuthService;
import com.example.SmartFlow.service.HospitalService;
import com.example.SmartFlow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final HospitalService hospitalService;
    private final UserService userService;
    private final AuthService authService;
    private final HospitalRepository hospitalRepo;

    @PostMapping("/hospitals")
    public ResponseEntity<ApiResponse<AuthResponse>> createHospitalWithAdmin(
            @Valid @RequestBody AdminSignupRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
                "Hospital and admin created",
                authService.registerAdmin(req)));
    }

    @GetMapping("/hospitals")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> allHospitals() {
        return ResponseEntity.ok(ApiResponse.success("Hospitals fetched",
                hospitalRepo.findAll().stream()
                        .map(hospitalService::toHospitalResponse).toList()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> allUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {

        User.Role roleEnum = (role != null && !role.isBlank())
                ? User.Role.valueOf(role.toUpperCase()) : null;

        return ResponseEntity.ok(ApiResponse.success("Users fetched",
                userService.searchAllUsers(roleEnum, search)));
    }

    @GetMapping("/users/role-counts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> userRoleCounts() {
        return ResponseEntity.ok(ApiResponse.success("Role counts fetched",
                userService.getRoleCountsAll()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> stats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalHospitals",     hospitalRepo.count());
        stats.put("totalUsers",         userService.getTotalUserCount());
        Map<String, Long> roleCounts  = userService.getRoleCountsAll();
        stats.put("totalAdmins",        roleCounts.getOrDefault("ADMIN", 0L));
        stats.put("totalDoctors",       roleCounts.getOrDefault("DOCTOR", 0L));
        stats.put("totalReceptionists", roleCounts.getOrDefault("RECEPTIONIST", 0L));
        stats.put("totalPatients",      roleCounts.getOrDefault("PATIENT", 0L));
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
    }

    @PutMapping("/hospitals/{id}/activate")
    public ResponseEntity<ApiResponse<HospitalResponse>> activateHospital(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Hospital activated", hospitalService.setHospitalActive(id, true)));
    }

    @PutMapping("/hospitals/{id}/deactivate")
    public ResponseEntity<ApiResponse<HospitalResponse>> deactivateHospital(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Hospital deactivated", hospitalService.setHospitalActive(id, false)));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "User activated", userService.setUserActive(id, true)));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "User deactivated", userService.setUserActive(id, false)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @DeleteMapping("/hospitals/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.ok(ApiResponse.success("Hospital deleted", null));
    }
}