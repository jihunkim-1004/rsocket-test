package com.example.rsocketchat.controller;

import com.example.rsocketchat.model.ChatMessage;
import com.example.rsocketchat.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("chat.send")
    public Mono<Void> sendMessage(ChatMessage message) {
        chatService.sendMessage(message);
        return Mono.empty();
    }

    @MessageMapping("chat.stream")
    public Flux<ChatMessage> streamMessages() {
        return chatService.getMessages();
    }

    @MessageMapping("chat.join")
    public Mono<Void> joinChat(ChatMessage message) {
        chatService.userJoined(message.getUsername());
        return Mono.empty();
    }

    @MessageMapping("chat.leave")
    public Mono<Void> leaveChat(ChatMessage message) {
        chatService.userLeft(message.getUsername());
        return Mono.empty();
    }
}
