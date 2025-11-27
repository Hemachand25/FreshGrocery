package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/vendors")
public class VendorAdminController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public VendorAdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void requireAdmin() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) throw new RuntimeException("Unauthorized");
        var current = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ROLE_ADMIN".equals(current.getRole())) throw new RuntimeException("Unauthorized - Admin only");
    }

    @GetMapping
    public List<User> listVendors() {
        requireAdmin();
        var all = userRepository.findAll();
        java.util.List<User> vendors = new java.util.ArrayList<>();
        for (var u : all) if ("ROLE_VENDOR".equals(u.getRole())) vendors.add(u);
        return vendors;
    }

    @PostMapping
    public User createVendor(@RequestBody Map<String, String> body) {
        requireAdmin();
        String email = body.get("email");
        String fullName = body.get("fullName");
        String password = body.get("password");
        if (email == null || password == null) throw new RuntimeException("email and password required");
        if (userRepository.findByEmail(email).isPresent()) throw new RuntimeException("User already exists");
        User v = new User();
        v.setEmail(email);
        v.setFullName(fullName != null ? fullName : email);
        v.setPassword(passwordEncoder.encode(password));
        v.setRole("ROLE_VENDOR");
        userRepository.save(v);
        return v;
    }

    @PutMapping("/{id}")
    public User updateVendor(@PathVariable Long id, @RequestBody Map<String, String> body) {
        requireAdmin();
        User v = userRepository.findById(id).orElseThrow();
        if (!"ROLE_VENDOR".equals(v.getRole())) throw new RuntimeException("Not a vendor");
        if (body.containsKey("fullName")) v.setFullName(body.get("fullName"));
        if (body.containsKey("email")) v.setEmail(body.get("email"));
        if (body.containsKey("password") && body.get("password") != null && !body.get("password").isBlank()) {
            v.setPassword(passwordEncoder.encode(body.get("password")));
        }
        if (body.containsKey("deleted")) v.setDeleted(Boolean.parseBoolean(body.get("deleted")));
        userRepository.save(v);
        return v;
    }

    @DeleteMapping("/{id}")
    public String deleteVendor(@PathVariable Long id) {
        requireAdmin();
        User v = userRepository.findById(id).orElseThrow();
        if (!"ROLE_VENDOR".equals(v.getRole())) throw new RuntimeException("Not a vendor");
        v.setDeleted(true);
        v.setStatus("BLOCKED");
        userRepository.save(v);
        return "Vendor blocked";
    }
}


