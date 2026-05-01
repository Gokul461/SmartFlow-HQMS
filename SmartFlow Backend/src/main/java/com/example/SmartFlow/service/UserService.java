package com.example.SmartFlow.service;

import com.example.SmartFlow.dto.request.CreateStaffRequest;
import com.example.SmartFlow.dto.response.UserResponse;
import com.example.SmartFlow.entity.*;
import com.example.SmartFlow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final DepartmentRepository departmentRepo;
    private final PasswordEncoder passwordEncoder;
    private final AppointmentRepository appointmentRepo;
    // CREATE 

    public UserResponse createStaff(CreateStaffRequest req, User admin) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        if (req.getRole() == User.Role.ADMIN) {
            Integer count = userRepo.countByHospitalIdAndRole(
                    admin.getHospital().getId(), User.Role.ADMIN);
            if (count >= 2)
                throw new RuntimeException("Maximum 2 admins allowed per hospital");
        }

        Department dept = null;
        if (req.getRole() != User.Role.ADMIN) {
            if (req.getDepartmentId() == null || req.getDepartmentId() == 0)
                throw new RuntimeException("Department is required for " + req.getRole().name().toLowerCase());
            dept = departmentRepo.findById(req.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            if (!dept.getHospital().getId().equals(admin.getHospital().getId()))
                throw new RuntimeException("Department does not belong to your hospital");
        }

        User staff = new User();
        staff.setName(req.getName());
        staff.setEmail(req.getEmail());
        staff.setPassword(passwordEncoder.encode(req.getPassword()));
        staff.setPhone(req.getPhone());
        staff.setRole(req.getRole());
        staff.setHospital(admin.getHospital());
        staff.setDepartment(dept);

        return toUserResponse(userRepo.save(staff));
    }

    // READ

    public List<UserResponse> getStaffByHospital(Long hospitalId, User admin) {
        if (!admin.getHospital().getId().equals(hospitalId))
            throw new RuntimeException("Access denied");
        return userRepo.findByHospitalId(hospitalId)
                .stream()
                .filter(u -> u.getRole() != User.Role.PATIENT)
                .map(this::toUserResponse).toList();
    }

    /** Search + filter staff within a hospital (Admin dashboard) */
    public List<UserResponse> searchStaff(Long hospitalId, User.Role role, String search) {
        String trimmed = (search != null && search.isBlank()) ? null : search;
        return userRepo.searchStaff(hospitalId, role, trimmed)
                .stream()
                .filter(u -> u.getRole() != User.Role.PATIENT)
                .map(this::toUserResponse)
                .toList();
    }

    // Search + filter across all users (SuperAdmin dashboard)
    public List<UserResponse> searchAllUsers(User.Role role, String search) {
        String trimmed = (search != null && search.isBlank()) ? null : search;
        return userRepo.searchAllUsers(role, trimmed)
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    public List<UserResponse> getDoctorsByDepartment(Long departmentId) {
        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        return userRepo.findByHospitalIdAndDepartmentId(
                        dept.getHospital().getId(), departmentId)
                .stream()
                .filter(u -> u.getRole() == User.Role.DOCTOR)
                .map(this::toUserResponse).toList();
    }

    // Per-role count scoped to a hospital — Admin dashboard cards 
   public Map<String, Long> getRoleCountsForHospital(Long hospitalId) {
    Map<String, Long> counts = new LinkedHashMap<>();

    // Seed all roles with 0
    for (User.Role r : User.Role.values()) {
        counts.put(r.name(), 0L);
    }

    // Get staff counts (ADMIN, DOCTOR, RECEPTIONIST) from users table
    userRepo.countByRoleForHospital(hospitalId)
            .forEach(row -> counts.put(row[0].toString(), (Long) row[1]));

    // Override PATIENT count from appointments table (correct source)
    counts.put("PATIENT", appointmentRepo.countDistinctPatientsByHospital(hospitalId));

    return counts;
}

    // Per-role count across all hospitals — SuperAdmin dashboard cards
    public Map<String, Long> getRoleCountsAll() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (User.Role r : User.Role.values()) counts.put(r.name(), 0L);
        userRepo.countByRoleAll()
                .forEach(row -> counts.put(row[0].toString(), (Long) row[1]));
        return counts;
    }

    public long getTotalUserCount() {
        return userRepo.count();
    }

    // ACTIVATE / DEACTIVATE 

    public UserResponse setUserActive(Long userId, boolean active) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(active);
        return toUserResponse(userRepo.save(user));
    }

    // DELETE 

    public void deleteUser(Long userId) {
        if (!userRepo.existsById(userId))
            throw new RuntimeException("User not found");
        userRepo.deleteById(userId);
    }

    // GUARD 

    // Prevents admin from modifying users outside their own hospital 
    public void assertSameHospital(Long targetUserId, User admin) {
        User target = userRepo.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (target.getHospital() == null ||
                !target.getHospital().getId().equals(admin.getHospital().getId()))
            throw new AccessDeniedException("Cannot modify users outside your hospital");
    }

    public UserResponse toUserResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setName(u.getName());
        r.setEmail(u.getEmail());
        r.setPhone(u.getPhone());
        r.setRole(u.getRole().name());
        r.setIsActive(u.getIsActive());
        if (u.getHospital() != null) {
            r.setHospitalId(u.getHospital().getId());
            r.setHospitalName(u.getHospital().getName());
        }
        if (u.getDepartment() != null) {
            r.setDepartmentId(u.getDepartment().getId());
            r.setDepartmentName(u.getDepartment().getName());
        }
        return r;
    }
    public List<UserResponse> getPatientsByHospital(Long hospitalId, String search) {
        String term = (search != null && !search.isBlank()) ? search.toLowerCase() : null;
        return appointmentRepo.findDistinctPatientsByHospital(hospitalId)
                .stream()
                .filter(u -> term == null
                        || u.getName().toLowerCase().contains(term)
                        || u.getEmail().toLowerCase().contains(term))
                .map(this::toUserResponse)
                .toList();
    }

    // Count of patients per hospital for dashboard
    public long getPatientCountByHospital(Long hospitalId) {
        return appointmentRepo.countDistinctPatientsByHospital(hospitalId);
    }
}