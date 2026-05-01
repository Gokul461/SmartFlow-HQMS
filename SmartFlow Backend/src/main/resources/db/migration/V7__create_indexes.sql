CREATE INDEX idx_users_hospital    ON users(hospital_id);
CREATE INDEX idx_users_department  ON users(department_id);
CREATE INDEX idx_users_role        ON users(role);
CREATE INDEX idx_dept_hospital     ON departments(hospital_id);
CREATE INDEX idx_appt_patient      ON appointments(patient_id);
CREATE INDEX idx_appt_doctor       ON appointments(doctor_id);
CREATE INDEX idx_appt_dept_date    ON appointments(department_id, scheduled_date);
CREATE INDEX idx_token_dept_status ON tokens(department_id, status);
CREATE INDEX idx_token_patient     ON tokens(patient_id);
CREATE INDEX idx_token_priority    ON tokens(priority, created_at);
CREATE INDEX idx_token_doctor      ON tokens(doctor_id);  -- new