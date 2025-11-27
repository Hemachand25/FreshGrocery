package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Autowired
    public UserService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // ✅ Get all non-deleted vendors (public)
    public List<User> getVendorsPublic() {
        List<User> vendors = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (!u.isDeleted() && "ROLE_VENDOR".equals(u.getRole())) {
                vendors.add(u);
            }
        }
        return vendors;
    }

    // ✅ Search vendors by product name (uses ProductRepository)
    public List<User> searchVendorsByProductName(String q) {
        if (productRepository == null) return List.of();
        var ids = productRepository.findDistinctVendorIdsByProductNameLike(q);
        List<User> out = new ArrayList<>();
        for (Long id : ids) {
            userRepository.findById(id).ifPresent(u -> {
                if (!u.isDeleted() && "ROLE_VENDOR".equals(u.getRole())) out.add(u);
            });
        }
        return out;
    }

    // ✅ For admin dashboard – get all users
    public List<User> getAllUsersForAdmin() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }

        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow();

        if (!"ROLE_ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }

        return userRepository.findAll();
    }

    // ✅ Get current logged-in user profile
    public User getCurrentUserProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    // ✅ Soft-delete user (mark as deleted & block account)
    public String deleteUserSoft(Long userId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }

        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        if (!"ROLE_ADMIN".equals(currentUser.getRole()) && !currentUser.getId().equals(userId)) {
            throw new RuntimeException("Unauthorized - You can only delete your own account");
        }

        User userToDelete = userRepository.findById(userId).orElseThrow();
        userToDelete.setDeleted(true);
        userToDelete.setStatus("BLOCKED");
        userRepository.save(userToDelete);

        return "User account has been blocked";
    }

    // ✅ Unblock user (admin only)
    public String unblockUser(Long userId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }

        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow();

        if (!"ROLE_ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }

        User user = userRepository.findById(userId).orElseThrow();
        user.setDeleted(false);
        user.setStatus("ACTIVE");
        userRepository.save(user);

        return "User account has been unblocked";
    }

    // Admin search: search vendors and users by name/email
    public java.util.Map<String, Object> searchVendorsAndUsers(String q) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow();
        if (!"ROLE_ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }

        String searchTerm = q.toLowerCase();
        List<User> vendors = new ArrayList<>();
        List<User> users = new ArrayList<>();

        for (User u : userRepository.findAll()) {
            boolean matches = (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchTerm)) ||
                              (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchTerm));
            if (matches) {
                if ("ROLE_VENDOR".equals(u.getRole())) {
                    vendors.add(u);
                } else if ("ROLE_CUSTOMER".equals(u.getRole())) {
                    users.add(u);
                }
            }
        }

        return java.util.Map.of(
            "vendors", vendors,
            "users", users
        );
    }
}
