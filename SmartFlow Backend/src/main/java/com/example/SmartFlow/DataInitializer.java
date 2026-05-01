package com.example.SmartFlow;

import com.example.SmartFlow.entity.SuperAdmin;
import com.example.SmartFlow.repository.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final SuperAdminRepository superAdminRepo;
    private final PasswordEncoder passwordEncoder;

    private static final String SUPER_ADMIN_EMAIL    = "superadmin@hospitalqms.com";
    private static final String SUPER_ADMIN_PASSWORD = "Admin@123";

    @Override
    public void run(ApplicationArguments args) {
        superAdminRepo.findByEmail(SUPER_ADMIN_EMAIL).ifPresentOrElse(
            admin -> {
                // Fix the placeholder hash left by V8 migration
                if (admin.getPassword().contains("CHANGE_THIS")) {
                    admin.setPassword(passwordEncoder.encode(SUPER_ADMIN_PASSWORD));
                    superAdminRepo.save(admin);
                    System.out.println("[DataInitializer] Super admin password fixed.");
                }
            },
            () -> {
                SuperAdmin admin = new SuperAdmin();
                admin.setName("Super Admin");
                admin.setEmail(SUPER_ADMIN_EMAIL);
                admin.setPassword(passwordEncoder.encode(SUPER_ADMIN_PASSWORD));
                superAdminRepo.save(admin);
                System.out.println("[DataInitializer] Super admin created.");
            }
        );
    }
}
