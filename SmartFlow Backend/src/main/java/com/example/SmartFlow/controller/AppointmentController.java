package com.example.SmartFlow.controller;

import com.example.SmartFlow.dto.request.BookAppointmentRequest;
import com.example.SmartFlow.dto.response.*;
import com.example.SmartFlow.security.CurrentUser;
import com.example.SmartFlow.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CurrentUser currentUser;

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(
            @Valid @RequestBody BookAppointmentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Appointment booked",
                appointmentService.bookAppointment(req, currentUser.get())));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> myAppointments() {
        return ResponseEntity.ok(ApiResponse.success("Appointments fetched",
                appointmentService.getMyAppointments(currentUser.get())));
    }

    //  new — get available time slots for a doctor on a date
    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<LocalTime>>> getSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Slots fetched",
                appointmentService.getAvailableSlots(doctorId, date)));
    }
}