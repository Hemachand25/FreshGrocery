
package com.example.backend.repository;

import com.example.backend.model.Order;
import com.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByIdAsc(User user);
    Page<Order> findAll(Pageable pageable);

    // New helpers for latest-first and status filters
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Order> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<Order> findByStatus(String status);
}
