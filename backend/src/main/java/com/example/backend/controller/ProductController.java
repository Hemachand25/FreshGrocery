
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

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product p){
        return productService.update(id, p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){ productService.delete(id); }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String q){ return productService.search(q); }
}
