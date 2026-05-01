package com.example.SmartFlow.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private Long hospitalId;
    private String hospitalName;
    private Long departmentId;
    private String departmentName;
    private Boolean isActive;
}