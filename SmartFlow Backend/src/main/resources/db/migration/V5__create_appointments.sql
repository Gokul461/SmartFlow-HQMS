CREATE TABLE appointments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id       BIGINT  NOT NULL,
    doctor_id        BIGINT  NOT NULL,
    department_id    BIGINT  NOT NULL,
    hospital_id      BIGINT  NOT NULL,
    scheduled_date   DATE    NOT NULL,
    appointment_time TIME    NOT NULL,    -- ✅ added
    status           ENUM('BOOKED','CANCELLED','COMPLETED') DEFAULT 'BOOKED',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appt_patient
        FOREIGN KEY (patient_id)    REFERENCES users(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor
        FOREIGN KEY (doctor_id)     REFERENCES users(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_appt_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_appt_hospital
        FOREIGN KEY (hospital_id)   REFERENCES hospitals(id)
            ON DELETE CASCADE
);