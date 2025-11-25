package com.example.rsocketchat.service;

import com.example.rsocketchat.model.ChatMessage;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebFluxChatService {

    private final Sinks.Many<ChatMessage> chatSink;
    private final Set<String> connectedUsers;

    public WebFluxChatService() {
        // directBestEffort: 구독자가 없어도 메시지 전송 가능
        this.chatSink = Sinks.many().multicast().directBestEffort();
        this.connectedUsers = ConcurrentHashMap.newKeySet();
    }

    public void sendMessage(ChatMessage message) {
        chatSink.tryEmitNext(message);
    }

    public Flux<ChatMessage> getMessages() {
        // 매번 새로운 Flux를 반환하여 구독자가 없다가 다시 들어와도 작동
        return chatSink.asFlux();
    }

    public void userJoined(String username) {
        if (connectedUsers.add(username)) {
            ChatMessage joinMessage = new ChatMessage(
                username,
                username + "님이 입장하셨습니다.",
                ChatMessage.MessageType.JOIN
            );
            chatSink.tryEmitNext(joinMessage);
        }
    }

    public void userLeft(String username) {
        if (connectedUsers.remove(username)) {
            ChatMessage leaveMessage = new ChatMessage(
                username,
                username + "님이 퇴장하셨습니다.",
                ChatMessage.MessageType.LEAVE
            );
            chatSink.tryEmitNext(leaveMessage);
        }
    }

    public Set<String> getConnectedUsers() {
        return Set.copyOf(connectedUsers);
    }
}

