package com.example.SmartFlow.dto.response;

import lombok.Data;

@Data
public class DepartmentResponse {
    private Long id;
    private String name;
    private Long hospitalId;
    private String hospitalName;
}