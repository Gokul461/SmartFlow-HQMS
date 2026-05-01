package com.example.SmartFlow.repository;

import com.example.SmartFlow.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"hospital", "department"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"hospital", "department"})
    List<User> findByHospitalId(Long hospitalId);

    @EntityGraph(attributePaths = {"hospital", "department"})
    List<User> findByHospitalIdAndRole(Long hospitalId, User.Role role);

    @EntityGraph(attributePaths = {"hospital", "department"})
    List<User> findByHospitalIdAndDepartmentId(Long hospitalId, Long departmentId);

    Integer countByHospitalIdAndRole(Long hospitalId, User.Role role);

    boolean existsByEmail(String email);

    // Search + filter scoped to a hospital (Admin)
    @EntityGraph(attributePaths = {"hospital", "department"})
    @Query("""
        SELECT u FROM User u
        WHERE u.hospital.id = :hospitalId
          AND (:role   IS NULL OR u.role = :role)
          AND (:search IS NULL
               OR LOWER(u.name)  LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    List<User> searchStaff(
            @Param("hospitalId") Long hospitalId,
            @Param("role")       User.Role role,
            @Param("search")     String search);

    // Search + filter across all hospitals (SuperAdmin) 
    @EntityGraph(attributePaths = {"hospital", "department"})
    @Query("""
        SELECT u FROM User u
        WHERE (:role   IS NULL OR u.role = :role)
          AND (:search IS NULL
               OR LOWER(u.name)  LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    List<User> searchAllUsers(
            @Param("role")   User.Role role,
            @Param("search") String search);

    // Role counts per hospital (Admin dashboard cards) 
    @Query("""
        SELECT u.role, COUNT(u)
        FROM User u
        WHERE u.hospital.id = :hospitalId
        GROUP BY u.role
    """)
    List<Object[]> countByRoleForHospital(@Param("hospitalId") Long hospitalId);

    // Role counts across all hospitals (SuperAdmin dashboard cards) 
    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countByRoleAll();
}