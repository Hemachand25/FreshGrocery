package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter){ this.jwtAuthenticationFilter = jwtAuthenticationFilter; }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(auth -> auth
            // allow public read access to products (read-only), categories and vendor discovery
            .requestMatchers(HttpMethod.GET, "/products", "/products/**", "/categories", "/categories/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/users/vendors", "/users/vendors/**").permitAll()
            .requestMatchers("/auth/login", "/auth/register").permitAll()
            // product management only for vendor
            .requestMatchers(HttpMethod.POST, "/products").hasAuthority("ROLE_VENDOR")
            .requestMatchers(HttpMethod.PUT, "/products/**").hasAuthority("ROLE_VENDOR")
            .requestMatchers(HttpMethod.DELETE, "/products/**").hasAuthority("ROLE_VENDOR")
            // vendor endpoints
            .requestMatchers("/vendor/**").hasAnyAuthority("ROLE_VENDOR", "ROLE_ADMIN")
            // admin endpoints
            .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
            .requestMatchers("/users/all").hasAuthority("ROLE_ADMIN")
            .requestMatchers("/users/admin/search").hasAuthority("ROLE_ADMIN")
            .anyRequest().authenticated()
        )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // ✅ Allow all origins, methods, and headers
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOriginPatterns(List.of("*")); // allows ALL origins
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){ 
        return new BCryptPasswordEncoder(); 
    }
}
