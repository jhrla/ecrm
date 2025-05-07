package com.ktss.safety.ecrm.ec.controller.dashboard;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {
    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @MessageMapping("/sendMessage")
    @SendTo("/event/messages") // 클라이언트가 구독 중인 경로로 전송
    public String noticeEvent(String message) throws Exception {
        logger.info("Received message: " + message);
        // JSON 형식으로 반환
        return message;
    }

    @MessageMapping("/testMessage")
    @SendTo("/event/testlog") // 클라이언트가 구독 중인 경로로 전송
    public String testMessage(String message) throws Exception {
        logger.info("Received message: " + message);
        // JSON 형식으로 반환
        return message;
    }

}