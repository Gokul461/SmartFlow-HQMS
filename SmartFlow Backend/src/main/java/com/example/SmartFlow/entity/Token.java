package com.example.SmartFlow.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tokens")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = true)  // nullable for walk-ins
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = true)      // nullable for unregistered walk-ins
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false) //  matches DB
    private User doctor;

    @Column(name = "token_number", nullable = false)
    private Integer tokenNumber;

    @Column(name = "walk_in")
    private Boolean walkIn = false;                        // true for walk-in tokens

    @Column(name = "walk_in_name")
    private String walkInName;                             // name for unregistered walk-ins

    private Boolean priority = false;

    @Enumerated(EnumType.STRING)
    private TokenStatus status = TokenStatus.WAITING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TokenStatus {
        WAITING, IN_PROGRESS, COMPLETED, CANCELLED
    }
}