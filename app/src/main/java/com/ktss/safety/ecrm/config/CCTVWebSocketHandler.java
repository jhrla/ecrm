package com.ktss.safety.ecrm.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class CCTVWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        log.info("Dahua CCTV WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("Received message from client: {}", payload);

        Map<String, Object> request = objectMapper.readValue(payload, Map.class);
        String method = (String) request.get("method");

        switch (method) {
            case "global.login":
                handleLogin(session, request);
                break;
            case "realTime.startVideo":
                handleStartVideo(session, request);
                break;
            case "global.logout":
                handleLogout(session);
                break;
            default:
                log.warn("Unknown method: {}", method);
        }
    }

    private void handleLogin(WebSocketSession session, Map<String, Object> request) throws Exception {
        Map<String, Object> response = Map.of(
                "method", "global.login",
                "result", true,
                "id", request.get("id"));
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        log.info("Login response sent for session: {}", session.getId());
    }

    private void handleStartVideo(WebSocketSession session, Map<String, Object> request) throws Exception {
        Map<String, Object> response = Map.of(
                "method", "realTime.startVideo",
                "result", true,
                "id", request.get("id"));
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        log.info("Start video response sent for session: {}", session.getId());
    }

    private void handleLogout(WebSocketSession session) throws Exception {
        Map<String, Object> response = Map.of(
                "method", "global.logout",
                "result", true);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        log.info("Logout response sent for session: {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        log.info("Dahua CCTV WebSocket disconnected: {}", session.getId());
    }
}