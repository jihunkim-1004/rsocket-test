package com.example.rsocketchat.model;

import java.time.LocalDateTime;

public class ChatMessage {
    public enum MessageType {
        MESSAGE, JOIN, LEAVE
    }

    private String username;
    private String message;
    private LocalDateTime timestamp;
    private MessageType type;

    public ChatMessage() {
        this.type = MessageType.MESSAGE;
    }

    public ChatMessage(String username, String message) {
        this.username = username;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.type = MessageType.MESSAGE;
    }

    public ChatMessage(String username, String message, MessageType type) {
        this.username = username;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }
}

