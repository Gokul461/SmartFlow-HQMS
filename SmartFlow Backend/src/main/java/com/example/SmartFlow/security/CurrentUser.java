package com.example.SmartFlow.security;

import com.example.SmartFlow.entity.User;
import com.example.SmartFlow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepo;

    public User get() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Long getUserId() {
        Object details = SecurityContextHolder.getContext()
                .getAuthentication().getDetails();
        return (Long) details;
    }
}