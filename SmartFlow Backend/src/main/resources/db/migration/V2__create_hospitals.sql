CREATE TABLE hospitals (
                           id         BIGINT AUTO_INCREMENT PRIMARY KEY,
                           name       VARCHAR(150)  NOT NULL,
                           address    TEXT,
                           city       VARCHAR(100)  NOT NULL,
                           phone      VARCHAR(20),
                           status     ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
                           created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);