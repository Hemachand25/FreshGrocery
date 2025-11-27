package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public ResponseEntity<?> register(Map<String, String> body) {
        String email = body.get("email");
        String fullName = body.get("fullName");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }
        User u = new User();
        u.setEmail(email);
        u.setFullName(fullName != null ? fullName : email.split("@")[0]);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole("ROLE_CUSTOMER");
        userRepository.save(u);
        return ResponseEntity.ok("User registered successfully");
    }

    public ResponseEntity<?> login(Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            System.out.println("[AuthService] login attempt for email=" + email + " - user not found");
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        User user = opt.get();
        System.out.println("[AuthService] login attempt for email=" + email + " - user found with role=" + user.getRole());
        if (user.isDeleted()) {
            return ResponseEntity.status(403).body("Account is deactivated");
        }
        boolean matches = passwordEncoder.matches(password, user.getPassword());
        System.out.println("[AuthService] password match result=" + matches);
        if (!matches) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getEmail(), List.of(user.getRole()));
        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    public ResponseEntity<?> getCurrentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized - Missing authentication");
        }
        String email = authentication.getName();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        User user = opt.get();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole(),
                "deleted", user.isDeleted(),
                "status", user.getStatus(),
                "createdAt", user.getCreatedAt()
        ));
    }

    public ResponseEntity<?> updateProfile(Map<String, String> body) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized - Missing authentication");
        }
        String email = authentication.getName();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        User user = opt.get();
        String fullName = body.get("fullName");
        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName);
            userRepository.save(user);
        }
        return ResponseEntity.ok("Profile updated successfully");
    }
}


