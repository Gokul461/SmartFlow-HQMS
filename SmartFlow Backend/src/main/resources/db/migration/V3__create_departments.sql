CREATE TABLE departments (
                             id          BIGINT AUTO_INCREMENT PRIMARY KEY,
                             name        VARCHAR(100) NOT NULL,
                             hospital_id BIGINT       NOT NULL,
                             created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

                             CONSTRAINT fk_dept_hospital
                                 FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
                                     ON DELETE CASCADE
);