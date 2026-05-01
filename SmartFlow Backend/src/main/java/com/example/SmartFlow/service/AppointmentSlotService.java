package com.example.SmartFlow.service;

import com.example.SmartFlow.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentSlotService {

    private final AppointmentRepository appointmentRepo;

    @Value("${appointment.slot.duration:15}")
    private int slotDuration;

    @Value("${appointment.slot.start:09:00}")
    private String startTime;

    @Value("${appointment.slot.end:17:00}")
    private String endTime;

    // Returns all available slots for a doctor on a date
    public List<LocalTime> getAvailableSlots(Long doctorId, LocalDate date) {
        LocalTime start = LocalTime.parse(startTime);
        LocalTime end   = LocalTime.parse(endTime);

        // Get already booked times for this doctor on this date
        List<LocalTime> booked = appointmentRepo
                .findBookedTimesByDoctorAndDate(doctorId, date);

        // Generate all slots and filter out booked ones
        LocalTime lunchStart = LocalTime.of(12, 0);
        LocalTime lunchEnd   = LocalTime.of(13, 0);

        LocalTime now = LocalDate.now().equals(date) ? LocalTime.now() : null;

        List<LocalTime> available = new ArrayList<>();
        LocalTime slot = start;
        while (slot.isBefore(end)) {
            boolean isLunch = !slot.isBefore(lunchStart) && slot.isBefore(lunchEnd);
            boolean isPast  = now != null && !slot.isAfter(now);
            if (!isLunch && !isPast && !booked.contains(slot)) {
                available.add(slot);
            }
            slot = slot.plusMinutes(slotDuration);
        }
        return available;
    }

    // Auto-assigns next available slot
    public LocalTime getNextAvailableSlot(Long doctorId, LocalDate date) {
        List<LocalTime> available = getAvailableSlots(doctorId, date);
        if (available.isEmpty())
            throw new RuntimeException(
                    "No available slots for this doctor on " + date +
                    ". Please choose another date.");
        return available.get(0);
    }
}