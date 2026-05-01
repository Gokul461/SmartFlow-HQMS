package com.example.SmartFlow.repository;

import com.example.SmartFlow.entity.Token;
import com.example.SmartFlow.entity.Token.TokenStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {

    @EntityGraph(attributePaths = {"patient", "doctor", "department", "hospital", "appointment"})
    List<Token> findByDepartmentIdAndStatusOrderByPriorityDescCreatedAtAsc(
            Long deptId, TokenStatus status);

    @EntityGraph(attributePaths = {"patient", "doctor", "department", "hospital", "appointment"})
    List<Token> findByDepartmentIdOrderByCreatedAtDesc(Long deptId);

    @EntityGraph(attributePaths = {"patient", "doctor", "department", "hospital", "appointment"})
    List<Token> findByDepartmentId(Long deptId);

    Integer countByDepartmentIdAndStatus(Long deptId, TokenStatus status);

    @EntityGraph(attributePaths = {"patient", "doctor", "department", "hospital", "appointment"})
    List<Token> findByPatientId(Long patientId);
    @EntityGraph(attributePaths = {"patient", "doctor", "department", "hospital", "appointment"})
    Optional<Token> findByAppointmentId(Long appointmentId);
    boolean existsByAppointmentId(Long appointmentId);

    List<Token> findByHospitalId(Long hospitalId);

    @Query("SELECT COALESCE(MAX(t.tokenNumber), 0) FROM Token t WHERE t.department.id = :deptId")
    Integer findMaxTokenNumberByDepartmentId(@Param("deptId") Long deptId);


}