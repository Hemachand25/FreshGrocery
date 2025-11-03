package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import com.example.backend.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ Register new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) { return authService.register(body); }

    // ✅ Login existing user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) { return authService.login(body); }

    // ✅ Get current user info
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return authService.getCurrentUser();
    }

    // ✅ Update user profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        return authService.updateProfile(body);
    }
}
