package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "vendor_orders")
public class VendorOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"items"})
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    private User vendor;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_order_id")
    private List<OrderItem> items = new ArrayList<>();

    private String status = "PLACED"; // PLACED, ACCEPTED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    private LocalDateTime updatedAt = LocalDateTime.now();

    public VendorOrder() {}

    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public Order getOrder(){ return order; }
    public void setOrder(Order order){ this.order = order; }
    public User getVendor(){ return vendor; }
    public void setVendor(User vendor){ this.vendor = vendor; }
    public List<OrderItem> getItems(){ return items; }
    public void setItems(List<OrderItem> items){ this.items = items; }
    public String getStatus(){ return status; }
    public void setStatus(String status){ this.status = status; this.updatedAt = LocalDateTime.now(); }
    public LocalDateTime getUpdatedAt(){ return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt){ this.updatedAt = updatedAt; }
}
