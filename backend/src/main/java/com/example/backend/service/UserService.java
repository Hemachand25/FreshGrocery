package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsersForAdmin() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }
        return userRepository.findAll();
    }

    public User getCurrentUserProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public String deleteUserSoft(Long userId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        if (!currentUser.getRole().equals("ROLE_ADMIN") && !currentUser.getId().equals(userId)) {
            throw new RuntimeException("Unauthorized - You can only delete your own account");
        }
        User userToDelete = userRepository.findById(userId).orElseThrow();
        userToDelete.setDeleted(true);
        userToDelete.setStatus("BLOCKED");
        userRepository.save(userToDelete);
        return "User account has been blocked";
    }

    public String unblockUser(Long userId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized - Missing authentication");
        }
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }
        User user = userRepository.findById(userId).orElseThrow();
        user.setDeleted(false);
        user.setStatus("ACTIVE");
        userRepository.save(user);
        return "User account has been unblocked";
    }
}


