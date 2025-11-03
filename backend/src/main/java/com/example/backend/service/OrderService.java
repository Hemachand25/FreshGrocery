package com.example.backend.service;

import com.example.backend.model.Order;
import com.example.backend.model.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public List<Order> getCurrentUserOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Page<Order> getAllOrders(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!user.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<Order> getUserOrdersByAdmin(Long userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElseThrow();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }
        User user = userRepository.findById(userId).orElseThrow();
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Page<Order> getOrdersByStatus(String status, Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElseThrow();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }
        return orderRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);
    }

    public String updateOrderStatus(Long orderId, String status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElseThrow();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized - Admin access required");
        }
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        orderRepository.save(order);
        return "Order status updated to " + status;
    }
}


