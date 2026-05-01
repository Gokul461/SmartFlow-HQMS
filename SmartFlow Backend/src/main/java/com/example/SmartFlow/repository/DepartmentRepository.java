package com.example.SmartFlow.repository;

import com.example.SmartFlow.entity.Department;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByNameAndHospitalId(String name, Long hospitalId);
    @EntityGraph(attributePaths = {"hospital"})
    List<Department> findByHospitalId(Long hospitalId);
}