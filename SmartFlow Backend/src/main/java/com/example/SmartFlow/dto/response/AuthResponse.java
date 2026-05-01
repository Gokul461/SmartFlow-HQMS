package com.example.SmartFlow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private Long userId;
    private String name;
    private String email;
    private Long departmentId;
    private String departmentName;
}