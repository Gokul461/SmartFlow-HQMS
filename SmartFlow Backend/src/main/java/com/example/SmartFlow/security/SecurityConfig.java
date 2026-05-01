package com.example.SmartFlow.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers("/error").permitAll()  //  allow Spring error path
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/superadmin/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/patient/signup").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/hospitals/search").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/hospitals/*/departments").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/departments/*/doctors").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/queue/*/live").permitAll()

                        // SUPER ADMIN 
                        .requestMatchers("/api/superadmin/**").hasRole("SUPER_ADMIN")

                        // ADMIN 
                        .requestMatchers(HttpMethod.GET, "/api/admin/departments").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/patients").hasRole("ADMIN") 
                        .requestMatchers(HttpMethod.GET, "/api/admin/patients/count").hasRole("ADMIN")

                        // RECEPTIONIST 
                        .requestMatchers(HttpMethod.GET,  "/api/queue/*/today").hasRole("RECEPTIONIST")
                        .requestMatchers(HttpMethod.PUT,  "/api/queue/tokens/*/status").hasRole("RECEPTIONIST")
                        .requestMatchers(HttpMethod.PUT,  "/api/queue/tokens/*/priority").hasRole("RECEPTIONIST")
                        .requestMatchers(HttpMethod.POST, "/api/queue/walkin").hasRole("RECEPTIONIST")

                        // PATIENT 
                        .requestMatchers(HttpMethod.POST, "/api/appointments/book").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.GET,  "/api/appointments/my").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/slots").hasRole("PATIENT")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(8);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // covers /error too
        return source;
    }
}