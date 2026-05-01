package com.example.SmartFlow.controller;

import com.example.SmartFlow.dto.request.WalkInRequest;
import com.example.SmartFlow.dto.response.*;
import com.example.SmartFlow.entity.Token;
import com.example.SmartFlow.security.CurrentUser;
import com.example.SmartFlow.service.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final TokenService tokenService;
    private final CurrentUser currentUser;

    @GetMapping("/{deptId}/live")
    public ResponseEntity<ApiResponse<List<TokenResponse>>> liveQueue(
            @PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.success("Queue fetched",
                tokenService.getQueueByDepartment(deptId)));
    }

    @GetMapping("/{deptId}/today")
    public ResponseEntity<ApiResponse<List<TokenResponse>>> todayQueue(
            @PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.success("Queue fetched",
                tokenService.getTodayQueueByDepartment(deptId)));
    }

    @GetMapping("/{deptId}/history")
    public ResponseEntity<ApiResponse<List<TokenResponse>>> historyByDate(
            @PathVariable Long deptId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("History fetched",
                tokenService.getQueueByDepartmentAndDate(deptId, date)));
    }

    @PutMapping("/tokens/{id}/status")
    public ResponseEntity<ApiResponse<TokenResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam Token.TokenStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                tokenService.updateStatus(id, status, currentUser.get())));
    }

    @PutMapping("/tokens/{id}/priority")
    public ResponseEntity<ApiResponse<TokenResponse>> markPriority(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Marked as priority",
                tokenService.markPriority(id, currentUser.get())));
    }

    @PostMapping("/walkin")
    public ResponseEntity<ApiResponse<TokenResponse>> walkIn(
            @Valid @RequestBody WalkInRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Walk-in token created",
                tokenService.createWalkInToken(req, currentUser.get())));
    }
    // In QueueController
    @PutMapping("/tokens/{id}/unpriority")
    public ResponseEntity<ApiResponse<TokenResponse>> unmarkPriority(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Priority removed",
                tokenService.unmarkPriority(id, currentUser.get())));
    }

}