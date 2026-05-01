package com.example.SmartFlow.dto.response;

import lombok.Data;

@Data
public class HospitalResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String phone;
    private String status;
}