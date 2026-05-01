package com.example.SmartFlow.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookAppointmentRequest {

    @NotNull private Long doctorId;
    @NotNull private Long departmentId;
    @NotNull private Long hospitalId;

    @NotNull @FutureOrPresent
    private LocalDate scheduledDate;

    // Optional — if not provided, system auto-assigns next available slot
    private LocalTime appointmentTime;
}