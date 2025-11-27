package com.example.backend.service;

import com.example.backend.model.Category;
import com.example.backend.model.Product;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, CartItemRepository cartItemRepository, OrderRepository orderRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
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
        // If current authenticated user is a vendor, set them as product vendor
        // If admin assigns a vendor, use that instead
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                var email = auth.getName();
                var optUser = userRepository.findByEmail(email);
                if (optUser.isPresent()) {
                    User u = optUser.get();
                    if ("ROLE_VENDOR".equals(u.getRole())) {
                        p.setVendor(u);
                    } else if ("ROLE_ADMIN".equals(u.getRole()) && p.getVendor() != null) {
                        // Admin can assign vendor - validate vendor exists
                        var vendorOpt = userRepository.findById(p.getVendor().getId());
                        if (vendorOpt.isPresent() && "ROLE_VENDOR".equals(vendorOpt.get().getRole())) {
                            p.setVendor(vendorOpt.get());
                        } else {
                            p.setVendor(null);
                        }
                    }
                }
            }
        } catch (Exception ignored) {}

        return productRepository.save(p);
    }

    public Product update(Long id, Product p) {
        Product existingProduct = productRepository.findById(id).orElseThrow();
        // Only vendor owning the product or admin can update
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                var email = auth.getName();
                var optUser = userRepository.findByEmail(email);
                if (optUser.isPresent()) {
                    User u = optUser.get();
                    if ("ROLE_VENDOR".equals(u.getRole())) {
                        if (existingProduct.getVendor() == null || !existingProduct.getVendor().getId().equals(u.getId())) {
                            throw new RuntimeException("Unauthorized - can only modify own products");
                        }
                    }
                }
            }
        } catch (RuntimeException re) { throw re; } catch (Exception ignored) {}

        existingProduct.setName(p.getName());
        existingProduct.setDescription(p.getDescription());
        existingProduct.setPrice(p.getPrice());
        existingProduct.setStock(p.getStock());
        if (p.getCategory() != null) {
            existingProduct.setCategory(p.getCategory());
        }
        // Admin can assign/change vendor, vendor cannot change their own product's vendor
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                var email = auth.getName();
                var optUser = userRepository.findByEmail(email);
                if (optUser.isPresent()) {
                    User u = optUser.get();
                    if ("ROLE_ADMIN".equals(u.getRole())) {
                        // Admin can assign/change vendor
                        if (p.getVendor() != null) {
                            var vendorOpt = userRepository.findById(p.getVendor().getId());
                            if (vendorOpt.isPresent() && "ROLE_VENDOR".equals(vendorOpt.get().getRole())) {
                                existingProduct.setVendor(vendorOpt.get());
                            } else {
                                existingProduct.setVendor(null);
                            }
                        } else {
                            existingProduct.setVendor(null);
                        }
                    }
                    // Vendor cannot change vendor assignment
                }
            }
        } catch (Exception ignored) {}
        return productRepository.save(existingProduct);
    }

    public void delete(Long id) {
        var product = productRepository.findById(id).orElseThrow();
        // Only vendor owning the product or admin can delete
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                var email = auth.getName();
                var optUser = userRepository.findByEmail(email);
                if (optUser.isPresent()) {
                    User u = optUser.get();
                    if ("ROLE_VENDOR".equals(u.getRole())) {
                        if (product.getVendor() == null || !product.getVendor().getId().equals(u.getId())) {
                            throw new RuntimeException("Unauthorized - can only delete own products");
                        }
                    }
                }
            }
        } catch (RuntimeException re) { throw re; } catch (Exception ignored) {}

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

    // helper for vendor controller
    public List<Product> getByVendorId(Long vendorId){ return productRepository.findByVendorId(vendorId); }

    public List<Product> getByCategory(Long categoryId){ return productRepository.findByCategoryId(categoryId); }

    public com.example.backend.repository.UserRepository getUserRepository(){ return this.userRepository; }
}


