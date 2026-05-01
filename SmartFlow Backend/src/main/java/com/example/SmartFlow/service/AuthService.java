package com.example.SmartFlow.service;

import com.example.SmartFlow.dto.request.*;
import com.example.SmartFlow.dto.response.AuthResponse;
import com.example.SmartFlow.entity.*;
import com.example.SmartFlow.exception.UnauthorizedException;
import com.example.SmartFlow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final SuperAdminRepository superAdminRepo;
    private final HospitalRepository hospitalRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse loginUser(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new UnauthorizedException("Invalid email or password");

        if (Boolean.FALSE.equals(user.getIsActive()))
            throw new UnauthorizedException("Account is deactivated. Contact your administrator.");

        String token = jwtService.generateToken(
                user.getEmail(), user.getRole().name(), user.getId());

        Long deptId     = user.getDepartment() != null ? user.getDepartment().getId()   : null;
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : null;
        return new AuthResponse(token, user.getRole().name(),
                user.getId(), user.getName(), user.getEmail(), deptId, deptName);
    }

    public AuthResponse loginSuperAdmin(LoginRequest req) {
        SuperAdmin admin = superAdminRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), admin.getPassword()))
            throw new UnauthorizedException("Invalid email or password");

        String token = jwtService.generateToken(
                admin.getEmail(), "SUPER_ADMIN", admin.getId());

        return new AuthResponse(token, "SUPER_ADMIN",
                admin.getId(), admin.getName(), admin.getEmail(), null, null);
    }

    public AuthResponse registerPatient(PatientSignupRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        User patient = new User();
        patient.setName(req.getName());
        patient.setEmail(req.getEmail());
        patient.setPassword(passwordEncoder.encode(req.getPassword()));
        patient.setPhone(req.getPhone());
        patient.setRole(User.Role.PATIENT);
        userRepo.save(patient);

        String token = jwtService.generateToken(
                patient.getEmail(), "PATIENT", patient.getId());

        return new AuthResponse(token, "PATIENT",
                patient.getId(), patient.getName(), patient.getEmail(), null, null);
    }

    public AuthResponse registerAdmin(AdminSignupRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        // Create hospital first
        Hospital hospital = new Hospital();
        hospital.setName(req.getHospitalName());
        hospital.setCity(req.getHospitalCity());
        hospital.setAddress(req.getHospitalAddress());
        hospital.setPhone(req.getHospitalPhone());
        hospital.setStatus(Hospital.HospitalStatus.ACTIVE);
        Hospital savedHospital = hospitalRepo.save(hospital);

        // No count check here — hospital is brand new, always 0 admins
        // The 2-admin limit is enforced in UserService.createStaff()
        // when an admin tries to create a second admin for their hospital

        // Create first admin
        User admin = new User();
        admin.setName(req.getName());
        admin.setEmail(req.getEmail());
        admin.setPassword(passwordEncoder.encode(req.getPassword()));
        admin.setPhone(req.getPhone());
        admin.setRole(User.Role.ADMIN);
        admin.setHospital(savedHospital);
        userRepo.save(admin);

        String token = jwtService.generateToken(
                admin.getEmail(), "ADMIN", admin.getId());

        return new AuthResponse(token, "ADMIN",
                admin.getId(), admin.getName(), admin.getEmail(), null, null);
    }
}