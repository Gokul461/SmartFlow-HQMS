package com.example.SmartFlow.service;

import com.example.SmartFlow.dto.request.CreateDepartmentRequest;
import com.example.SmartFlow.dto.response.DepartmentResponse;
import com.example.SmartFlow.dto.response.HospitalResponse;
import com.example.SmartFlow.entity.Appointment;
import com.example.SmartFlow.entity.Department;
import com.example.SmartFlow.entity.Hospital;
import com.example.SmartFlow.entity.Token;
import com.example.SmartFlow.entity.User;
import com.example.SmartFlow.repository.AppointmentRepository;
import com.example.SmartFlow.repository.DepartmentRepository;
import com.example.SmartFlow.repository.HospitalRepository;
import com.example.SmartFlow.repository.TokenRepository;
import com.example.SmartFlow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepo;
    private final DepartmentRepository departmentRepo;
    private final UserRepository userRepo;
    private final AppointmentRepository appointmentRepo;
    private final TokenRepository tokenRepo;

    // SEARCH 

    public List<HospitalResponse> searchHospitals(String city) {
        List<Hospital> hospitals = (city != null && !city.isEmpty())
                ? hospitalRepo.findByCityAndStatus(city, Hospital.HospitalStatus.ACTIVE)
                : hospitalRepo.findByStatus(Hospital.HospitalStatus.ACTIVE);
        return hospitals.stream().map(this::toHospitalResponse).toList();
    }

    // DEPARTMENTS 

    public List<DepartmentResponse> getDepartmentsByHospital(Long hospitalId) {
        return departmentRepo.findByHospitalId(hospitalId)
                .stream().map(this::toDepartmentResponse).toList();
    }

    public DepartmentResponse addDepartment(Long hospitalId,
                                            CreateDepartmentRequest req, User admin) {
        if (!admin.getHospital().getId().equals(hospitalId))
            throw new RuntimeException("Access denied");

        if (departmentRepo.existsByNameAndHospitalId(req.getName(), hospitalId))
            throw new RuntimeException("Department already exists");

        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        Department dept = new Department();
        dept.setName(req.getName());
        dept.setHospital(hospital);
        return toDepartmentResponse(departmentRepo.save(dept));
    }

    // DELETE (SuperAdmin only)
    public void deleteHospital(Long hospitalId) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        boolean hasActiveAdmin = userRepo.findByHospitalIdAndRole(hospitalId, User.Role.ADMIN)
                .stream().anyMatch(u -> Boolean.TRUE.equals(u.getIsActive()));
        if (hasActiveAdmin)
            throw new RuntimeException("Please deactivate the hospital admin before deleting the hospital.");

        // 1. Delete all queue tokens for this hospital (walk-ins and appointment-linked)
        List<Token> tokens = tokenRepo.findByHospitalId(hospitalId);
        tokenRepo.deleteAll(tokens);

        // 2. Delete all appointments for this hospital
        //    (patients themselves are preserved — only their history is removed)
        List<Appointment> appointments = appointmentRepo.findByHospitalId(hospitalId);
        appointmentRepo.deleteAll(appointments);

        // 3. Delete all staff (admin, doctors, receptionists) belonging to this hospital
        List<User> staff = userRepo.findByHospitalId(hospitalId);
        userRepo.deleteAll(staff);

        // 4. Delete all departments belonging to this hospital
        List<Department> departments = departmentRepo.findByHospitalId(hospitalId);
        departmentRepo.deleteAll(departments);

        // 5. Delete the hospital
        hospitalRepo.delete(hospital);
    }

    // ACTIVATE / DEACTIVATE (SuperAdmin only) 

    public HospitalResponse setHospitalActive(Long hospitalId, boolean active) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
        hospital.setStatus(active
                ? Hospital.HospitalStatus.ACTIVE
                : Hospital.HospitalStatus.INACTIVE);
        return toHospitalResponse(hospitalRepo.save(hospital));
    }

    public HospitalResponse toHospitalResponse(Hospital h) {
        HospitalResponse r = new HospitalResponse();
        r.setId(h.getId());
        r.setName(h.getName());
        r.setAddress(h.getAddress());
        r.setCity(h.getCity());
        r.setPhone(h.getPhone());
        r.setStatus(h.getStatus().name());
        return r;
    }

    public DepartmentResponse toDepartmentResponse(Department d) {
        DepartmentResponse r = new DepartmentResponse();
        r.setId(d.getId());
        r.setName(d.getName());
        r.setHospitalId(d.getHospital().getId());
        r.setHospitalName(d.getHospital().getName());
        return r;
    }
}