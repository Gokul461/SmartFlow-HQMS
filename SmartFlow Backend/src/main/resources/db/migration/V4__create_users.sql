CREATE TABLE users (
                       id            BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name          VARCHAR(100)  NOT NULL,
                       email         VARCHAR(100)  NOT NULL UNIQUE,
                       password      VARCHAR(255)  NOT NULL,
                       phone         VARCHAR(20),
                       role          ENUM('ADMIN','RECEPTIONIST','DOCTOR','PATIENT') NOT NULL,
                       hospital_id   BIGINT        NULL,
                       department_id BIGINT        NULL,
                       is_active     BOOLEAN       DEFAULT TRUE,
                       created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

                       CONSTRAINT fk_user_hospital
                           FOREIGN KEY (hospital_id)   REFERENCES hospitals(id)
                               ON DELETE SET NULL,
                       CONSTRAINT fk_user_department
                           FOREIGN KEY (department_id) REFERENCES departments(id)
                               ON DELETE SET NULL
);