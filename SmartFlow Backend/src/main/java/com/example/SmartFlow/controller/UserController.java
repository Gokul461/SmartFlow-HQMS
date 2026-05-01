package com.example.SmartFlow.controller;

import com.example.SmartFlow.dto.request.CreateStaffRequest;
import com.example.SmartFlow.dto.response.*;
import com.example.SmartFlow.entity.User;
import com.example.SmartFlow.security.CurrentUser;
import com.example.SmartFlow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUser currentUser;

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<UserResponse>> createStaff(
            @Valid @RequestBody CreateStaffRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Staff created",
                userService.createStaff(req, currentUser.get())));
    }

    // List staff with optional role filter and name/email search 
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStaff(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {

        Long hospitalId = currentUser.get().getHospital().getId();

        User.Role roleEnum = (role != null && !role.isBlank())
                ? User.Role.valueOf(role.toUpperCase()) : null;

        return ResponseEntity.ok(ApiResponse.success("Staff fetched",
                userService.searchStaff(hospitalId, roleEnum, search)));
    }

    // Role counts for admin dashboard summary cards
    @GetMapping("/staff/role-counts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> staffRoleCounts() {
        Long hospitalId = currentUser.get().getHospital().getId();
        return ResponseEntity.ok(ApiResponse.success("Role counts fetched",
                userService.getRoleCountsForHospital(hospitalId)));
    }

    @PutMapping("/staff/{id}/activate")
    public ResponseEntity<ApiResponse<UserResponse>> activateStaff(
            @PathVariable Long id) {
        userService.assertSameHospital(id, currentUser.get());
        return ResponseEntity.ok(ApiResponse.success("Staff activated",
                userService.setUserActive(id, true)));
    }

    @PutMapping("/staff/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateStaff(
            @PathVariable Long id) {
        userService.assertSameHospital(id, currentUser.get());
        return ResponseEntity.ok(ApiResponse.success("Staff deactivated",
                userService.setUserActive(id, false)));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPatients(
            @RequestParam(required = false) String search) {
        Long hospitalId = currentUser.get().getHospital().getId();
        return ResponseEntity.ok(ApiResponse.success("Patients fetched",
                userService.getPatientsByHospital(hospitalId, search)));
    }

// Get patient count for dashboard
    @GetMapping("/patients/count")
    public ResponseEntity<ApiResponse<Long>> getPatientCount() {
            Long hospitalId = currentUser.get().getHospital().getId();
            return ResponseEntity.ok(ApiResponse.success("Patient count fetched",
            userService.getPatientCountByHospital(hospitalId)));
}

}