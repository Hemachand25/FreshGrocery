
package com.example.backend.repository;

import com.example.backend.model.Order;
import com.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByIdAsc(User user);
    Page<Order> findAll(Pageable pageable);

    // New helpers for latest-first and status filters
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Order> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<Order> findByStatus(String status);

    // Orders that contain items from products owned by given vendor
    @Query("select distinct o from Order o join o.items i where i.product.vendor.id = :vendorId order by o.createdAt desc")
    List<Order> findOrdersByVendorId(@Param("vendorId") Long vendorId);
}
