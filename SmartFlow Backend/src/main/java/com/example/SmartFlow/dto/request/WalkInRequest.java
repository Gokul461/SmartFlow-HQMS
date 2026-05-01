package com.example.SmartFlow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WalkInRequest {

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Doctor is required")
    private Long doctorId;

    // One of these must be provided
    private Long patientId;      // registered patient walking in
    private String patientName;  // unregistered walk-in (no account)
}