package com.example.SmartFlow.repository;

import com.example.SmartFlow.entity.Appointment;
import com.example.SmartFlow.entity.User;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        @EntityGraph(attributePaths = { "patient", "doctor", "department", "hospital" })
        List<Appointment> findByPatientId(Long patientId);

        @EntityGraph(attributePaths = { "patient", "doctor", "department", "hospital" })
        List<Appointment> findByDoctorIdAndScheduledDate(Long doctorId, LocalDate date);

        @EntityGraph(attributePaths = { "patient", "doctor", "department", "hospital" })
        List<Appointment> findByDepartmentIdAndScheduledDate(Long deptId, LocalDate date);

        boolean existsByPatientIdAndDoctorIdAndScheduledDate(
                        Long patientId, Long doctorId, LocalDate date);

        @Query("""
                            SELECT a.appointmentTime FROM Appointment a
                            WHERE a.doctor.id = :doctorId
                              AND a.scheduledDate = :date
                              AND a.status = 'BOOKED'
                        """)
        List<LocalTime> findBookedTimesByDoctorAndDate(
                        @Param("doctorId") Long doctorId,
                        @Param("date") LocalDate date);

        boolean existsByDoctorIdAndScheduledDateAndAppointmentTime(
                        Long doctorId, LocalDate date, LocalTime time);

        List<Appointment> findByHospitalId(Long hospitalId);

        // Get all distinct patients who have appointments at a hospital
        @Query("""
                            SELECT DISTINCT a.patient FROM Appointment a
                            WHERE a.hospital.id = :hospitalId
                        """)
        @EntityGraph(attributePaths = { "patient" })
        List<User> findDistinctPatientsByHospital(@Param("hospitalId") Long hospitalId);

        // Count distinct patients per hospital
        @Query("""
                            SELECT COUNT(DISTINCT a.patient.id) FROM Appointment a
                            WHERE a.hospital.id = :hospitalId
                        """)
        Long countDistinctPatientsByHospital(@Param("hospitalId") Long hospitalId);
}