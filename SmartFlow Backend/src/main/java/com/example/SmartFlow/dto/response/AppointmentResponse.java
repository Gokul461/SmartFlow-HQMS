package com.example.SmartFlow.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long departmentId;
    private String departmentName;
    private Long hospitalId;
    private String hospitalName;
    private LocalDate scheduledDate;
    private String status;
    private TokenResponse token;
    private LocalTime appointmentTime;
}