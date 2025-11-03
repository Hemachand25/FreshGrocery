
package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name="order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Product product;
    private int quantity;
    private double priceAtPurchase;

    public OrderItem(){}
    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public Product getProduct(){ return product; }
    public void setProduct(Product product){ this.product = product; }
    public int getQuantity(){ return quantity; }
    public void setQuantity(int quantity){ this.quantity = quantity; }
    public double getPriceAtPurchase(){ return priceAtPurchase; }
    public void setPriceAtPurchase(double priceAtPurchase){ this.priceAtPurchase = priceAtPurchase; }
}
