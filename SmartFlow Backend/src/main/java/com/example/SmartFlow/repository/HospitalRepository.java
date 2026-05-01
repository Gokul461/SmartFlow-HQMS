package com.example.SmartFlow.repository;

import com.example.SmartFlow.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByCity(String city);
    List<Hospital> findByStatus(Hospital.HospitalStatus status);
    List<Hospital> findByCityAndStatus(String city, Hospital.HospitalStatus status);
}