package com.example.SmartFlow.service;

import com.example.SmartFlow.dto.request.BookAppointmentRequest;
import com.example.SmartFlow.dto.response.AppointmentResponse;
import com.example.SmartFlow.entity.*;
import com.example.SmartFlow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final UserRepository userRepo;
    private final DepartmentRepository departmentRepo;
    private final HospitalRepository hospitalRepo;
    private final TokenService tokenService;
    private final TokenRepository tokenRepo;
    private final AppointmentSlotService slotService;

    public AppointmentResponse bookAppointment(
            BookAppointmentRequest req, User patient) {

        // Duplicate booking check
        if (appointmentRepo.existsByPatientIdAndDoctorIdAndScheduledDate(
                patient.getId(), req.getDoctorId(), req.getScheduledDate()))
            throw new RuntimeException(
                    "You already have an appointment with this doctor on this date");

        // Determine appointment time
        LocalTime appointmentTime;
        if (req.getAppointmentTime() != null) {
            // Patient chose a slot — verify it hasn't passed (for today's bookings)
            if (req.getScheduledDate().equals(LocalDate.now()) &&
                    !req.getAppointmentTime().isAfter(LocalTime.now()))
                throw new RuntimeException(
                        "Cannot book a slot that has already passed. Please choose a future time.");
            // Verify it's still available
            if (appointmentRepo.existsByDoctorIdAndScheduledDateAndAppointmentTime(
                    req.getDoctorId(), req.getScheduledDate(), req.getAppointmentTime()))
                throw new RuntimeException(
                        "This time slot is already booked. Please choose another.");
            appointmentTime = req.getAppointmentTime();
        } else {
            // Auto-assign next available slot
            appointmentTime = slotService.getNextAvailableSlot(
                    req.getDoctorId(), req.getScheduledDate());
        }

        // Fetch related entities
        User doctor       = userRepo.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Department dept   = departmentRepo.findById(req.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        Hospital hospital = hospitalRepo.findById(req.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        // Create appointment
        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setDoctor(doctor);
        appt.setDepartment(dept);
        appt.setHospital(hospital);
        appt.setScheduledDate(req.getScheduledDate());
        appt.setAppointmentTime(appointmentTime);  
        appt.setStatus(Appointment.AppointmentStatus.BOOKED);
        Appointment saved = appointmentRepo.save(appt);

        // Auto-generate token
        Token token = tokenService.generateToken(saved);

        AppointmentResponse r = toAppointmentResponse(saved);
        r.setToken(tokenService.toTokenResponse(token));
        return r;
    }

    public List<AppointmentResponse> getMyAppointments(User patient) {
        return appointmentRepo.findByPatientId(patient.getId())
                .stream().map(a -> {
                    AppointmentResponse r = toAppointmentResponse(a);
                    tokenRepo.findByAppointmentId(a.getId())
                            .ifPresent(t -> r.setToken(tokenService.toTokenResponse(t)));
                    return r;
                }).toList();
    }

    // get available slots (called from controller)
    public List<LocalTime> getAvailableSlots(Long doctorId,
                                              java.time.LocalDate date) {
        return slotService.getAvailableSlots(doctorId, date);
    }

    public AppointmentResponse toAppointmentResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setPatientId(a.getPatient().getId());
        r.setPatientName(a.getPatient().getName());
        r.setDoctorId(a.getDoctor().getId());
        r.setDoctorName(a.getDoctor().getName());
        r.setDepartmentId(a.getDepartment().getId());
        r.setDepartmentName(a.getDepartment().getName());
        r.setHospitalId(a.getHospital().getId());
        r.setHospitalName(a.getHospital().getName());
        r.setScheduledDate(a.getScheduledDate());
        r.setAppointmentTime(a.getAppointmentTime());  
        r.setStatus(a.getStatus().name());
        return r;
    }
}