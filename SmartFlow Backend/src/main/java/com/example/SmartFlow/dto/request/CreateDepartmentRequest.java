package com.example.SmartFlow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDepartmentRequest {
    @NotBlank private String name;
}