
package com.example.backend.controller;

import com.example.backend.model.*;
import com.example.backend.service.CartService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/cart")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService){ this.cartService = cartService; }

    @GetMapping
    public List<CartService.CartItemResponse> getCart() { return cartService.getCart(); }

    @PostMapping("/add")
    public String addToCart(@RequestParam Long productId, @RequestParam int qty) { return cartService.addToCart(productId, qty); }

    @PutMapping("/{itemId}")
    public String updateQuantity(@PathVariable Long itemId, @RequestParam int quantity) { return cartService.updateQuantity(itemId, quantity); }

    @DeleteMapping("/{itemId}")
    public String removeItem(@PathVariable Long itemId) { return cartService.removeItem(itemId); }

    @PostMapping("/checkout")
    public Order checkout() { return cartService.checkout(); }

    // Response DTO for cart items
    public static class CartItemResponse extends CartService.CartItemResponse {}
}
