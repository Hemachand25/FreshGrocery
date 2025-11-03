
package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name="cart_items")
public class CartItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Product product;
    
    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;
    
    private int quantity;

    public CartItem(){}
    
    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    
    public Product getProduct(){ return product; }
    public void setProduct(Product product){ this.product = product; }
    
    public Cart getCart(){ return cart; }
    public void setCart(Cart cart){ this.cart = cart; }
    
    public int getQuantity(){ return quantity; }
    public void setQuantity(int quantity){ this.quantity = quantity; }
}
