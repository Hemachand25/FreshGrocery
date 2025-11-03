package com.example.backend.service;

import com.example.backend.model.Category;
import com.example.backend.model.Product;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, CartItemRepository cartItemRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
    }

    public List<Product> getAll() { return productRepository.findAll(); }

    public Product getById(Long id) { return productRepository.findById(id).orElseThrow(); }

    public Product create(Product p) {
        if (p.getCategory() == null) {
            Category defaultCategory = categoryRepository.findById(1L).orElse(null);
            if (defaultCategory != null) {
                p.setCategory(defaultCategory);
            }
        }
        return productRepository.save(p);
    }

    public Product update(Long id, Product p) {
        Product existingProduct = productRepository.findById(id).orElseThrow();
        existingProduct.setName(p.getName());
        existingProduct.setDescription(p.getDescription());
        existingProduct.setPrice(p.getPrice());
        existingProduct.setStock(p.getStock());
        return productRepository.save(existingProduct);
    }

    public void delete(Long id) {
        var product = productRepository.findById(id).orElseThrow();
        long refs = cartItemRepository.countByProduct(product);
        if (refs > 0) {
            // Remove cart references before deleting the product to avoid FK constraint errors
            cartItemRepository.deleteByProduct(product);
        }
        // Check if product exists in any ACTIVE orders; if yes block deletion
        var activeOrders = orderRepository.findByStatus("ACTIVE");
        boolean inActiveOrders = activeOrders.stream().anyMatch(o -> o.getItems().stream().anyMatch(oi -> oi.getProduct().getId().equals(product.getId())));
        if (inActiveOrders) {
            throw new RuntimeException("Cannot delete product present in active orders");
        }
        productRepository.delete(product);
    }

    public List<Product> search(String q) { return productRepository.findByNameContainingIgnoreCase(q); }
}


