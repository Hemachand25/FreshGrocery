package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Public list of vendors for customers to browse vendors
    @GetMapping("/vendors")
    public List<User> getVendors() {
        return userService.getVendorsPublic();
    }

    // Public: vendors that have products matching a search query
    @GetMapping("/vendors/search")
    public List<User> searchVendorsByProduct(@RequestParam String q) {
        return userService.searchVendorsByProductName(q);
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsersForAdmin();
    }

    @GetMapping("/profile")
    public User getUserProfile() {
        return userService.getCurrentUserProfile();
    }

    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable Long userId) {
        return userService.deleteUserSoft(userId);
    }

    @PutMapping("/{userId}/unblock")
    public String unblockUser(@PathVariable Long userId) {
        return userService.unblockUser(userId);
    }

    @GetMapping("/{userId}/orders")
    public List<Object> getUserOrders(@PathVariable Long userId) {
        // Only admins can view other users' orders
        User currentUser = userService.getCurrentUserProfile();
        
        if (!currentUser.getRole().equals("ROLE_ADMIN") && !currentUser.getId().equals(userId)) {
            throw new RuntimeException("Unauthorized - You can only view your own orders");
        }
        
        // This would need to be implemented with OrderRepository
        // For now, return empty list
        return List.of();
    }

    // Admin search: search vendors and users by name/email
    @GetMapping("/admin/search")
    public Map<String, Object> adminSearch(@RequestParam String q) {
        return userService.searchVendorsAndUsers(q);
    }
}
