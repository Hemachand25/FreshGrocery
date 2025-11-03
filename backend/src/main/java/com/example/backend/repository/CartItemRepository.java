
package com.example.backend.repository;

import com.example.backend.model.CartItem;
import com.example.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    long countByProduct(Product product);
    void deleteByProduct(Product product);
}
