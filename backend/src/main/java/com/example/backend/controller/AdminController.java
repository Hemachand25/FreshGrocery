
package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, OrderRepository orderRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder){
        this.userRepository = userRepository; this.orderRepository = orderRepository; this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public List<User> users(){ return userRepository.findAll(); }

    // Admin creates a vendor
    @PostMapping("/vendor")
    public Object createVendor(@RequestBody Map<String, String> body){
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return "Unauthorized";
        var current = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ROLE_ADMIN".equals(current.getRole())) return "Unauthorized - Admin only";

        String email = body.get("email");
        String fullName = body.get("fullName");
        String password = body.get("password");
        if (email == null || password == null) return "email and password required";
        if (userRepository.findByEmail(email).isPresent()) return "User already exists";
        User v = new User();
        v.setEmail(email); v.setFullName(fullName != null ? fullName : email.split("@")[0]);
        v.setPassword(this.passwordEncoder.encode(password));
        v.setRole("ROLE_VENDOR");
        userRepository.save(v);
        return Map.of("email", v.getEmail(), "fullName", v.getFullName(), "role", v.getRole());
    }

    @GetMapping("/orders")
    public List<?> orders(){ return orderRepository.findAll(); }
}
