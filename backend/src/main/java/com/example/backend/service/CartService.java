package com.example.backend.service;

import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final com.example.backend.repository.VendorOrderRepository vendorOrderRepository;
    private final com.example.backend.service.NotificationService notificationService;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository,
                       OrderRepository orderRepository,
                       com.example.backend.repository.VendorOrderRepository vendorOrderRepository,
                       com.example.backend.service.NotificationService notificationService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.vendorOrderRepository = vendorOrderRepository;
        this.notificationService = notificationService;
    }

    public List<CartItemResponse> getCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart == null) {
            return new ArrayList<>();
        }

        List<CartItemResponse> response = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            CartItemResponse itemResponse = new CartItemResponse();
            itemResponse.setId(item.getId());
            itemResponse.setName(item.getProduct().getName());
            itemResponse.setPrice(item.getProduct().getPrice());
            itemResponse.setQuantity(item.getQuantity());
            response.add(itemResponse);
        }
        return response;
    }

    public String addToCart(Long productId, int qty) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();

        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart = cartRepository.save(cart);
        }

        cart = cartRepository.findByUser(user).orElseThrow();

        // Enforce single-vendor cart: if cart has items from a different vendor, reject
        Long incomingVendorId = product.getVendor() != null ? product.getVendor().getId() : 0L;
        Long currentVendorId = null;
        for (CartItem it : cart.getItems()) {
            Long vid = it.getProduct().getVendor() != null ? it.getProduct().getVendor().getId() : 0L;
            if (currentVendorId == null && cart.getItems().size() > 0) currentVendorId = vid;
            if (currentVendorId != null && !vid.equals(currentVendorId)) currentVendorId = vid; // normalize
        }
        if (currentVendorId != null && !cart.getItems().isEmpty()) {
            Long existing = cart.getItems().get(0).getProduct().getVendor() != null ? cart.getItems().get(0).getProduct().getVendor().getId() : 0L;
            if (!existing.equals(incomingVendorId)) {
                return "Your cart contains items from another vendor. Please checkout or clear your cart first.";
            }
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + qty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(qty);
            newItem.setCart(cart);
            cartItemRepository.save(newItem);
        }

        return "Item added to cart";
    }

    public String updateQuantity(Long itemId, int quantity) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        CartItem item = cartItemRepository.findById(itemId).orElseThrow();
        Cart cart = item.getCart();

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (quantity < 1) {
            // If quantity is 0 or less, remove the item
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            cartRepository.save(cart);
            return "Item removed from cart";
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return "Quantity updated";
    }

    public String removeItem(Long itemId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        CartItem item = cartItemRepository.findById(itemId).orElseThrow();
        Cart cart = item.getCart();

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Remove item from cart's items list
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cartRepository.save(cart); // Save cart to ensure changes are persisted
        
        return "Item removed from cart";
    }

    public Order checkout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getProduct().getPrice());
            orderItems.add(orderItem);
            total += orderItem.getQuantity() * orderItem.getPriceAtPurchase();
        }

        Order order = new Order();
        order.setUser(user);
        order.setItems(orderItems);
        order.setTotal(total);

        Order savedOrder = orderRepository.save(order);

        // Split items into vendor-specific VendorOrder entries
        // Group by vendor id (null vendor -> platform vendor with id 0)
        java.util.Map<Long, java.util.List<OrderItem>> grouped = new java.util.HashMap<>();
        for (OrderItem oi : orderItems) {
            Long vid = 0L;
            if (oi.getProduct().getVendor() != null) vid = oi.getProduct().getVendor().getId();
            grouped.computeIfAbsent(vid, k -> new java.util.ArrayList<>()).add(oi);
        }

        for (var entry : grouped.entrySet()){
            Long vendorId = entry.getKey();
            var items = entry.getValue();
            com.example.backend.model.VendorOrder vo = new com.example.backend.model.VendorOrder();
            vo.setOrder(savedOrder);
            if (vendorId != 0L) vo.setVendor(userRepository.findById(vendorId).orElse(null));
            vo.setItems(items);
            // set back-reference on items
            for (OrderItem oi : items) oi.setVendorOrder(vo);
            vendorOrderRepository.save(vo);

            // notify vendor if present
            if (vendorId != 0L) {
                notificationService.publish("vendor:" + vendorId, "order:new", vo);
            }
        }

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);

        // Refresh the saved order to ensure it has the ID
        savedOrder = orderRepository.findById(savedOrder.getId()).orElse(savedOrder);
        return savedOrder;
    }

    public static class CartItemResponse {
        private Long id;
        private String name;
        private double price;
        private int quantity;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}


