
package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminController(UserRepository userRepository, OrderRepository orderRepository){
        this.userRepository = userRepository; this.orderRepository = orderRepository;
    }

    @GetMapping("/users")
    public List<User> users(){ return userRepository.findAll(); }

    @GetMapping("/orders")
    public List<?> orders(){ return orderRepository.findAll(); }
}
