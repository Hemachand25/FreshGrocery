package com.example.backend.controller;

import com.example.backend.model.VendorOrder;
import com.example.backend.repository.VendorOrderRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendor")
public class VendorOrderController {
    private final VendorOrderRepository vendorOrderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final com.example.backend.repository.OrderRepository orderRepository;

    public VendorOrderController(VendorOrderRepository vendorOrderRepository, UserRepository userRepository, NotificationService notificationService, com.example.backend.repository.OrderRepository orderRepository){
        this.vendorOrderRepository = vendorOrderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders")
    public List<VendorOrder> myOrders(){
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        var user = userRepository.findByEmail(email).orElseThrow();
        if (!"ROLE_VENDOR".equals(user.getRole())) throw new RuntimeException("Unauthorized - Vendor only");
        return vendorOrderRepository.findByVendorId(user.getId());
    }

    @PutMapping("/orders/{id}/status")
    public Object updateStatus(@PathVariable Long id, @RequestParam String status){
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        var user = userRepository.findByEmail(email).orElseThrow();
        if (!"ROLE_VENDOR".equals(user.getRole())) throw new RuntimeException("Unauthorized - Vendor only");

        VendorOrder vo = vendorOrderRepository.findById(id).orElseThrow();
        if (vo.getVendor() == null || !vo.getVendor().getId().equals(user.getId())) throw new RuntimeException("Unauthorized - not your order");
        vo.setStatus(status);
        vendorOrderRepository.save(vo);

        // notify parties: vendor channel and admin/customer channels
        notificationService.publish("vendor:" + user.getId(), "order:update", vo);
        if (vo.getOrder() != null && vo.getOrder().getUser() != null)
            notificationService.publish("user:" + vo.getOrder().getUser().getId(), "order:update", vo);

        // Aggregate parent order status
        // - if all vendor parts are DELIVERED -> mark parent order COMPLETED
        // - if all vendor parts are CANCELLED -> mark parent order CANCELLED
        if (vo.getOrder() != null && vo.getOrder().getId() != null) {
            var parts = vendorOrderRepository.findByOrderId(vo.getOrder().getId());
            boolean allDelivered = true;
            boolean allCancelled = true;
            for (var p : parts) {
                if (!"DELIVERED".equals(p.getStatus())) { allDelivered = false; }
                if (!"CANCELLED".equals(p.getStatus())) { allCancelled = false; }
            }
            if (allDelivered) {
                var parent = vo.getOrder();
                parent.setStatus("COMPLETED");
                orderRepository.save(parent);
                // notify user and admin
                if (parent.getUser()!=null) notificationService.publish("user:"+parent.getUser().getId(), "order:completed", parent);
                notificationService.publishToMany(java.util.List.of("admin"), "order:completed", parent);
            } else if (allCancelled) {
                var parent = vo.getOrder();
                parent.setStatus("CANCELLED");
                orderRepository.save(parent);
                // notify user and admin
                if (parent.getUser()!=null) notificationService.publish("user:"+parent.getUser().getId(), "order:cancelled", parent);
                notificationService.publishToMany(java.util.List.of("admin"), "order:cancelled", parent);
            }
        }

        return vo;
    }

    @GetMapping("/sse")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter subscribe(){
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        var user = userRepository.findByEmail(email).orElseThrow();
        String key = "vendor:" + user.getId();
        return notificationService.subscribe(key);
    }
}
