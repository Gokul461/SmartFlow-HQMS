package com.example.SmartFlow.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class TokenResponse {
    private Long id;
    private Integer tokenNumber;
    private Boolean priority;
    private String status;

    // Patient — null for unregistered walk-ins
    private Long patientId;
    private String patientName;   // populated from walkInName if unregistered

    // Doctor
    private Long doctorId;        //  add
    private String doctorName;    // add

    private Long departmentId;
    private String departmentName;

    private Boolean walkIn;       // add

    private LocalDateTime createdAt;
    private LocalTime appointmentTime;
}