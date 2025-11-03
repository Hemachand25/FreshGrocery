
package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    private double total;
    private String status = "ACTIVE"; // ACTIVE or COMPLETED
    private LocalDateTime createdAt = LocalDateTime.now();

    public Order(){}

    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public User getUser(){ return user; }
    public void setUser(User user){ this.user = user; }
    public List<OrderItem> getItems(){ return items; }
    public void setItems(List<OrderItem> items){ this.items = items; }
    public double getTotal(){ return total; }
    public void setTotal(double total){ this.total = total; }
    public String getStatus(){ return status; }
    public void setStatus(String status){ this.status = status; }
    public LocalDateTime getCreatedAt(){ return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt){ this.createdAt = createdAt; }
}
