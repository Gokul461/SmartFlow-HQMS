CREATE TABLE tokens (
                        id             BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- nullable for walk-ins
                        appointment_id BIGINT        NULL UNIQUE,
                        patient_id     BIGINT        NULL,

    -- always required
                        department_id  BIGINT        NOT NULL,
                        hospital_id    BIGINT        NOT NULL,
                        doctor_id      BIGINT        NOT NULL,

                        token_number   BIGINT        NOT NULL,
                        priority       BOOLEAN       DEFAULT FALSE,
                        walk_in        BOOLEAN       NOT NULL DEFAULT FALSE,
                        walk_in_name   VARCHAR(255)  NULL,

                        status         ENUM('WAITING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'WAITING',
                        created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

                        CONSTRAINT fk_token_appointment
                            FOREIGN KEY (appointment_id) REFERENCES appointments(id)
                                ON DELETE SET NULL,

                        CONSTRAINT fk_token_patient
                            FOREIGN KEY (patient_id)     REFERENCES users(id)
                                ON DELETE SET NULL,

                        CONSTRAINT fk_token_department
                            FOREIGN KEY (department_id)  REFERENCES departments(id)
                                ON DELETE CASCADE,

                        CONSTRAINT fk_token_hospital
                            FOREIGN KEY (hospital_id)    REFERENCES hospitals(id)
                                ON DELETE CASCADE,

                        CONSTRAINT fk_token_doctor
                            FOREIGN KEY (doctor_id)      REFERENCES users(id)
                                ON DELETE CASCADE

    -- ✅ CHECK constraint removed — MySQL doesn't allow CHECK on FK columns
    --    with ON DELETE SET NULL. Validation is handled in TokenService instead.
);