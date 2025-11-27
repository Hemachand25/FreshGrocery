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
    private final com.example.backend.repository.VendorOrderRepository vendorOrderRepository;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        com.example.backend.repository.VendorOrderRepository vendorOrderRepository,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.vendorOrderRepository = vendorOrderRepository;
        this.notificationService = notificationService;
    }

    public List<Order> getCurrentUserOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Order> getOrdersForVendor() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!"ROLE_VENDOR".equals(user.getRole()) && !"ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized - Vendor or Admin access required");
        }
        // admin may pass through; for vendor return only orders that include their products
        if ("ROLE_ADMIN".equals(user.getRole())) {
            return orderRepository.findAllByOrderByCreatedAtDesc(Pageable.unpaged()).getContent();
        } else {
            // fetch vendor-specific suborders and return parent orders (deduped)
            var parts = vendorOrderRepository.findByVendorId(user.getId());
            java.util.Set<Order> orders = new java.util.LinkedHashSet<>();
            for (var p : parts) orders.add(p.getOrder());
            return new java.util.ArrayList<>(orders);
        }
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

    public String updateOrderStatusByVendor(Long orderId, String status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!"ROLE_VENDOR".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized - Vendor access required");
        }
        Order order = orderRepository.findById(orderId).orElseThrow();
        // Check that at least one item in the order belongs to this vendor
        boolean contains = order.getItems().stream().anyMatch(oi -> oi.getProduct().getVendor() != null && oi.getProduct().getVendor().getId().equals(user.getId()));
        if (!contains) throw new RuntimeException("Unauthorized - cannot modify orders not related to your products");
        order.setStatus(status);
        orderRepository.save(order);
        return "Order status updated to " + status;
    }

    // Customer marks order as delivered: set parent to COMPLETED and vendor parts to DELIVERED
    public String markDeliveredByCustomer(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized - not your order");
        }

        order.setStatus("COMPLETED");
        orderRepository.save(order);

        var parts = vendorOrderRepository.findByOrderId(order.getId());
        for (var vo : parts) {
            vo.setStatus("DELIVERED");
            vendorOrderRepository.save(vo);
            if (vo.getVendor() != null) {
                notificationService.publish("vendor:" + vo.getVendor().getId(), "order:update", vo);
            }
        }
        // Notify admin and customer
        notificationService.publish("user:" + user.getId(), "order:completed", order);
        notificationService.publishToMany(java.util.List.of("admin"), "order:completed", order);
        return "Order marked as delivered";
    }
}


