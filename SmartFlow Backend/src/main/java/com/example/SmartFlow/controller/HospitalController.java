package com.example.SmartFlow.controller;

import com.example.SmartFlow.dto.request.CreateDepartmentRequest;
import com.example.SmartFlow.dto.response.*;
import com.example.SmartFlow.security.CurrentUser;
import com.example.SmartFlow.service.HospitalService;
import com.example.SmartFlow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;
    private final UserService userService;
    private final CurrentUser currentUser;

    @GetMapping("/hospitals/search")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> search(
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.success("Hospitals fetched",
                hospitalService.searchHospitals(city)));
    }

    @GetMapping("/hospitals/{hospitalId}/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getDepartments(
            @PathVariable Long hospitalId) {
        return ResponseEntity.ok(ApiResponse.success("Departments fetched",
                hospitalService.getDepartmentsByHospital(hospitalId)));
    }

    @GetMapping("/departments/{departmentId}/doctors")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getDoctors(
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(ApiResponse.success("Doctors fetched",
                userService.getDoctorsByDepartment(departmentId)));
    }

    @PostMapping("/admin/departments")
    public ResponseEntity<ApiResponse<DepartmentResponse>> addDepartment(
            @Valid @RequestBody CreateDepartmentRequest req) {
        // hospitalId taken from the logged-in admin — not from request param
        Long hospitalId = currentUser.get().getHospital().getId();
        return ResponseEntity.ok(ApiResponse.success("Department created",
                hospitalService.addDepartment(hospitalId, req, currentUser.get())));
    }

    @GetMapping("/admin/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getMyDepartments() {
        Long hospitalId = currentUser.get().getHospital().getId();
        return ResponseEntity.ok(ApiResponse.success("Departments fetched",
                hospitalService.getDepartmentsByHospital(hospitalId)));
    }
}