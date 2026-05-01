package com.example.SmartFlow.service;

import com.example.SmartFlow.dto.request.WalkInRequest;
import com.example.SmartFlow.dto.response.TokenResponse;
import com.example.SmartFlow.entity.*;
import com.example.SmartFlow.repository.DepartmentRepository;
import com.example.SmartFlow.repository.TokenRepository;
import com.example.SmartFlow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final DepartmentRepository departmentRepo;

    // ── GENERATE from appointment ─────────────────────────────────────────────

    public Token generateToken(Appointment appointment) {
        Integer next = tokenRepo.findMaxTokenNumberByDepartmentId(
                appointment.getDepartment().getId()) + 1;

        Token token = new Token();
        token.setAppointment(appointment);
        token.setPatient(appointment.getPatient());
        token.setDoctor(appointment.getDoctor());
        token.setDepartment(appointment.getDepartment());
        token.setHospital(appointment.getHospital());
        token.setTokenNumber(next);
        token.setPriority(false);
        token.setWalkIn(false);
        token.setStatus(Token.TokenStatus.WAITING);
        return tokenRepo.save(token);
    }

    // ── CREATE walk-in token ──────────────────────────────────────────────────

    public TokenResponse createWalkInToken(WalkInRequest req, User receptionist) {

        // Must have either patientId or patientName
        if (req.getPatientId() == null && (req.getPatientName() == null
                || req.getPatientName().isBlank()))
            throw new RuntimeException("Provide either a patientId or a patientName");

        Department dept = departmentRepo.findById(req.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Receptionist can only create tokens for their own department
        if (!dept.getId().equals(receptionist.getDepartment().getId()))
            throw new RuntimeException("Not your department");

        User doctor = userRepo.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Doctor must belong to same hospital as receptionist
        if (!doctor.getHospital().getId()
                .equals(receptionist.getHospital().getId()))
            throw new RuntimeException("Doctor not in your hospital");

        if (doctor.getRole() != User.Role.DOCTOR)
            throw new RuntimeException("Specified user is not a doctor");

        Integer next = tokenRepo.findMaxTokenNumberByDepartmentId(dept.getId()) + 1;

        Token token = new Token();
        token.setDepartment(dept);
        token.setHospital(receptionist.getHospital());
        token.setDoctor(doctor);
        token.setTokenNumber(next);
        token.setPriority(false);
        token.setWalkIn(true);
        token.setStatus(Token.TokenStatus.WAITING);

        if (req.getPatientId() != null) {
            // Registered patient walking in
            User patient = userRepo.findById(req.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            token.setPatient(patient);
        } else {
            // Unregistered walk-in — store name only
            token.setWalkInName(req.getPatientName());
        }

        return toTokenResponse(tokenRepo.save(token));
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    /** Live queue — WAITING only (public display board) */
    public List<TokenResponse> getQueueByDepartment(Long deptId) {
        return tokenRepo.findByDepartmentIdAndStatusOrderByPriorityDescCreatedAtAsc(
                        deptId, Token.TokenStatus.WAITING)
                .stream().map(this::toTokenResponse).toList();
    }

    /** Today's queue — ALL statuses, today only (receptionist dashboard) */
    public List<TokenResponse> getTodayQueueByDepartment(Long deptId) {
        LocalDate today = LocalDate.now();
        return tokenRepo.findByDepartmentId(deptId)
                .stream()
                .filter(t -> {
                    if (Boolean.FALSE.equals(t.getWalkIn()) && t.getAppointment() != null)
                        return today.equals(t.getAppointment().getScheduledDate());
                    return today.equals(t.getCreatedAt().toLocalDate());
                })
                .sorted(Comparator.comparing(Token::getPriority, Comparator.reverseOrder())
                        .thenComparing(this::effectiveTime))
                .map(this::toTokenResponse)
                .toList();
    }

    /** History — tokens for a specific date (appointment scheduled date or walk-in arrival date) */
    public List<TokenResponse> getQueueByDepartmentAndDate(Long deptId, LocalDate date) {
        return tokenRepo.findByDepartmentId(deptId)
                .stream()
                .filter(t -> {
                    if (Boolean.FALSE.equals(t.getWalkIn()) && t.getAppointment() != null)
                        return date.equals(t.getAppointment().getScheduledDate());
                    return date.equals(t.getCreatedAt().toLocalDate());
                })
                .sorted(Comparator.comparing(Token::getPriority, Comparator.reverseOrder())
                        .thenComparing(this::effectiveTime))
                .map(this::toTokenResponse)
                .toList();
    }

    private LocalTime effectiveTime(Token t) {
        if (!Boolean.TRUE.equals(t.getWalkIn())
                && t.getAppointment() != null
                && t.getAppointment().getAppointmentTime() != null)
            return t.getAppointment().getAppointmentTime();
        return t.getCreatedAt().toLocalTime();
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    public TokenResponse updateStatus(Long tokenId,
                                      Token.TokenStatus status, User receptionist) {
        Token token = tokenRepo.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        if (!token.getDepartment().getId()
                .equals(receptionist.getDepartment().getId()))
            throw new RuntimeException("Not your department");

        if (status == Token.TokenStatus.IN_PROGRESS) {
            Integer alreadyInProgress = tokenRepo.countByDepartmentIdAndStatus(
                    token.getDepartment().getId(), Token.TokenStatus.IN_PROGRESS);
            if (alreadyInProgress > 0)
                throw new RuntimeException("Another patient is already in progress in this department");
        }

        token.setStatus(status);
        return toTokenResponse(tokenRepo.save(token));
    }

    public TokenResponse markPriority(Long tokenId, User receptionist) {
        Token token = tokenRepo.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        if (!token.getDepartment().getId()
                .equals(receptionist.getDepartment().getId()))
            throw new RuntimeException("Not your department");

        token.setPriority(true);
        return toTokenResponse(tokenRepo.save(token));
    }

    // ── MAPPER ────────────────────────────────────────────────────────────────

    public TokenResponse toTokenResponse(Token t) {
        TokenResponse r = new TokenResponse();
        r.setId(t.getId());
        r.setTokenNumber(t.getTokenNumber());
        r.setPriority(t.getPriority());
        r.setStatus(t.getStatus().name());
        r.setWalkIn(t.getWalkIn());
        r.setDepartmentId(t.getDepartment().getId());
        r.setDepartmentName(t.getDepartment().getName());
        r.setCreatedAt(t.getCreatedAt());
        if (t.getAppointment() != null) {
            r.setAppointmentTime(t.getAppointment().getAppointmentTime());
        }

        // Patient — registered or walk-in name
        if (t.getPatient() != null) {
            r.setPatientId(t.getPatient().getId());
            r.setPatientName(t.getPatient().getName());
        } else {
            r.setPatientName(t.getWalkInName()); // unregistered walk-in
        }

        // Doctor
        if (t.getDoctor() != null) {
            r.setDoctorId(t.getDoctor().getId());
            r.setDoctorName(t.getDoctor().getName());
        }

        return r;
    }
    // In TokenService
    public TokenResponse unmarkPriority(Long tokenId, User receptionist) {
        Token token = tokenRepo.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        if (!token.getDepartment().getId()
                .equals(receptionist.getDepartment().getId()))
            throw new RuntimeException("Not your department");
        token.setPriority(false);
        return toTokenResponse(tokenRepo.save(token));
    }
}