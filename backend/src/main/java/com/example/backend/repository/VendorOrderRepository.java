package com.example.backend.repository;

import com.example.backend.model.VendorOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface VendorOrderRepository extends JpaRepository<VendorOrder, Long> {
    @Query("SELECT DISTINCT vo FROM VendorOrder vo " +
           "LEFT JOIN FETCH vo.order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH vo.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH p.category " +
           "WHERE vo.vendor.id = :vendorId ORDER BY vo.updatedAt DESC")
    List<VendorOrder> findByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT DISTINCT vo FROM VendorOrder vo " +
           "LEFT JOIN FETCH vo.order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH vo.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH p.category " +
           "WHERE vo.order.id = :orderId")
    List<VendorOrder> findByOrderId(@Param("orderId") Long orderId);
}
