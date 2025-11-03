
package com.example.backend;

import com.example.backend.model.Category;
import com.example.backend.model.Product;
import com.example.backend.model.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner init(UserRepository userRepository, CategoryRepository categoryRepository, ProductRepository productRepository, PasswordEncoder passwordEncoder){
        return args->{
            if(userRepository.count()==0){
                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setFullName("Admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);

                User customer = new User();
                customer.setEmail("customer@example.com");
                customer.setFullName("Customer");
                customer.setPassword(passwordEncoder.encode("customer123"));
                customer.setRole("ROLE_CUSTOMER");
                userRepository.save(customer);
            }

            if(categoryRepository.count()==0){
                Category fruits = new Category("Fruits");
                Category veg = new Category("Vegetables");
                Category dairy = new Category("Dairy");
                Category bev = new Category("Beverages");
                categoryRepository.saveAll(List.of(fruits, veg, dairy, bev));
            }

            if(productRepository.count()==0){
                var cats = categoryRepository.findAll();
                Product p1 = new Product();
                p1.setName("Apple"); p1.setDescription("Fresh red apples"); p1.setPrice(100); p1.setStock(100); p1.setCategory(cats.get(0));
                Product p2 = new Product();
                p2.setName("Banana"); p2.setDescription("Sweet bananas"); p2.setPrice(50); p2.setStock(200); p2.setCategory(cats.get(0));
                Product p3 = new Product();
                p3.setName("Carrot"); p3.setDescription("Organic carrots"); p3.setPrice(40); p3.setStock(150); p3.setCategory(cats.get(1));
                Product p4 = new Product();
                p4.setName("Milk"); p4.setDescription("Fresh milk 1L"); p4.setPrice(60); p4.setStock(80); p4.setCategory(cats.get(2));
                Product p5 = new Product();
                p5.setName("Orange Juice"); p5.setDescription("100% orange juice"); p5.setPrice(120); p5.setStock(60); p5.setCategory(cats.get(3));
                productRepository.saveAll(List.of(p1,p2,p3,p4,p5));
            }
        };
    }
}
