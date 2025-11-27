package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {
    // Map vendorId -> list of emitters
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String key) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        emitters.put(key, emitter);
        emitter.onCompletion(() -> emitters.remove(key));
        emitter.onTimeout(() -> emitters.remove(key));
        return emitter;
    }

    public void publish(String key, String event, Object data){
        SseEmitter emitter = emitters.get(key);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(event).data(data));
            } catch (IOException e) {
                emitters.remove(key);
            }
        }
    }

    // convenience: publish to multiple keys
    public void publishToMany(List<String> keys, String event, Object data){
        for (String k : keys) publish(k, event, data);
    }
}
