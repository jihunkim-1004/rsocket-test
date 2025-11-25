package com.example.rsocketchat.controller;

import com.example.rsocketchat.model.ChatMessage;
import com.example.rsocketchat.service.ChatService;
import com.example.rsocketchat.service.WebFluxChatService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/chat")
public class WebFluxChatController {

    private final ChatService chatService;

    public WebFluxChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // 메시지 전송 (POST)
    @PostMapping("/send")
    public Mono<ResponseEntity<Void>> sendMessage(@RequestBody ChatMessage message) {
        chatService.sendMessage(message);
        return Mono.just(ResponseEntity.ok().build());
    }

    // Server-Sent Events로 메시지 스트림 구독
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatMessage> streamMessages() {
        return chatService.getMessages();
    }

    // 사용자 입장
    @PostMapping("/join")
    public Mono<ResponseEntity<Void>> joinChat(@RequestBody ChatMessage message) {
        chatService.userJoined(message.getUsername());
        return Mono.just(ResponseEntity.ok().build());
    }

    // 사용자 퇴장
    @PostMapping("/leave")
    public Mono<ResponseEntity<Void>> leaveChat(@RequestBody ChatMessage message) {
        chatService.userLeft(message.getUsername());
        return Mono.just(ResponseEntity.ok().build());
    }

    // 접속 중인 사용자 목록 조회
    @GetMapping("/users")
    public Mono<ResponseEntity<java.util.Set<String>>> getConnectedUsers() {
        return Mono.just(ResponseEntity.ok(chatService.getConnectedUsers()));
    }
}

