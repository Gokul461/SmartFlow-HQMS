package com.example.SmartFlow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminSignupRequest {
    @NotBlank private String name;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    private String phone;

    // Hospital details
    @NotBlank private String hospitalName;
    @NotBlank private String hospitalCity;
    private String hospitalAddress;
    private String hospitalPhone;
}