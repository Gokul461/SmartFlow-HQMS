package com.example.SmartFlow.dto.request;

import com.example.SmartFlow.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateStaffRequest {
    @NotBlank private String name;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    private String phone;
    @NotNull private User.Role role; // RECEPTIONIST or DOCTOR
    @NotNull private Long departmentId;
}