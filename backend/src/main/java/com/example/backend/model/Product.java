
package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name="products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(length=1000)
    private String description;
    private double price;
    private int stock;
    @ManyToOne(fetch = FetchType.EAGER)
    private Category category;
    @ManyToOne(fetch = FetchType.EAGER)
    private User vendor;

    public Product(){}

    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public String getName(){ return name; }
    public void setName(String name){ this.name = name; }
    public String getDescription(){ return description; }
    public void setDescription(String description){ this.description = description; }
    public double getPrice(){ return price; }
    public void setPrice(double price){ this.price = price; }
    public int getStock(){ return stock; }
    public void setStock(int stock){ this.stock = stock; }
    public Category getCategory(){ return category; }
    public void setCategory(Category category){ this.category = category; }
    public User getVendor(){ return vendor; }
    public void setVendor(User vendor){ this.vendor = vendor; }
}
