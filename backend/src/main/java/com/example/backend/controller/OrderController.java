package com.example.backend.controller;

import com.example.backend.model.Order;
import com.example.backend.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) { this.orderService = orderService; }

    @GetMapping
    public List<Order> getUserOrders() {
        return orderService.getCurrentUserOrders();
    }

    @GetMapping("/all")
    public Page<Order> getAllOrders(@RequestParam(defaultValue = "0") int page, 
                                   @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrdersByAdmin(@PathVariable Long userId) { return orderService.getUserOrdersByAdmin(userId); }

    @PutMapping("/{orderId}/status")
    public String updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        return orderService.updateOrderStatus(orderId, status);
    }

    // Admin filters
    @GetMapping("/all/status")
    public Page<Order> getOrdersByStatus(@RequestParam String status,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderService.getOrdersByStatus(status, pageable);
    }
}
