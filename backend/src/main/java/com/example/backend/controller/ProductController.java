
package com.example.backend.controller;

import com.example.backend.model.Product;
import com.example.backend.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;
    
    public ProductController(ProductService productService){ 
        this.productService = productService;
    }

    @GetMapping
    public List<Product> all(){ return productService.getAll(); }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id){ return productService.getById(id); }

    @PostMapping
    public Product create(@RequestBody Product p){ 
        return productService.create(p); 
    }

    // Get products owned by currently authenticated vendor (or admin can view all)
    @GetMapping("/vendor")
    public List<Product> myProducts(){
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) throw new RuntimeException("Unauthorized");
        String email = auth.getName();
        var userOpt = productService.getUserRepository().findByEmail(email);
        if (userOpt.isEmpty()) throw new RuntimeException("User not found");
        var user = userOpt.get();
        if ("ROLE_ADMIN".equals(user.getRole())) return productService.getAll();
        if (!"ROLE_VENDOR".equals(user.getRole())) throw new RuntimeException("Unauthorized - Vendor access required");
        return productService.getByVendorId(user.getId());
    }

    // Public: get products by vendor id (browsing a vendor's storefront)
    @GetMapping("/vendor/{vendorId}")
    public List<Product> productsByVendor(@PathVariable Long vendorId){
        return productService.getByVendorId(vendorId);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product p){
        return productService.update(id, p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){ productService.delete(id); }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String q){ return productService.search(q); }

    @GetMapping("/category/{categoryId}")
    public List<Product> getByCategory(@PathVariable Long categoryId){ return productService.getByCategory(categoryId); }
}
