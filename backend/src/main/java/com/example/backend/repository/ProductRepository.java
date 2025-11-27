
package com.example.backend.repository;

import com.example.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String q);
    List<Product> findByVendorId(Long vendorId);
    List<Product> findByCategoryId(Long categoryId);
    @org.springframework.data.jpa.repository.Query("select distinct p.vendor.id from Product p where lower(p.name) like lower(concat('%', :q, '%')) and p.vendor is not null")
    java.util.List<Long> findDistinctVendorIdsByProductNameLike(@org.springframework.data.repository.query.Param("q") String q);
}
