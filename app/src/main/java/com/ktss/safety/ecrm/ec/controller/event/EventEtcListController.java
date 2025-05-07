package com.ktss.safety.ecrm.ec.controller.event;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ktss.safety.ecrm.ec.service.event.EventEctListService;
import com.ktss.safety.ecrm.util.ExcelDownUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class EventEtcListController {
    private static final Logger logger = LoggerFactory.getLogger(EventEtcListController.class);

    @Autowired
    private EventEctListService eventEctListService;

    @PostMapping("/api/getEventEtcList")
    public ResponseEntity<Map<String, Object>> getEventEtcList(@RequestBody Map<String, Object> areaInfo) {
        return ResponseEntity.ok(eventEctListService.getEventEtcList(areaInfo));
    }

    @GetMapping("/api/downloadEventEtcList")
    public ResponseEntity<byte[]> downloadEventEtcList(@RequestParam Map<String, Object> params,
            HttpServletRequest request) {
        List<Map<String, Object>> eventEtcList = eventEctListService.getEventEtcListExcel(params);
        String fileName = "이벤트목록"; // 파일명에서 공백 제거
        String[] headers = {
                "서비스",
                "계약번호",
                "고객명",
                "발생위치",
                "장비",
                "장치ID",
                "발생시간",
                "이벤트구분" };

        List<String> fields = Arrays.asList(
                "service_type",
                "contract_code",
                "customer_name",
                "event_msg",
                "device_name",
                "device_id",
                "event_time",
                "event_name");

        ResponseEntity<byte[]> excelFile = ExcelDownUtil.createExcelFile(fileName, eventEtcList, headers, fields);
        if (excelFile.getStatusCode() != HttpStatus.OK) {
            return excelFile;
        }

        try {
            String browser = request.getHeader("User-Agent");
            String encodedFileName;

            if (browser.contains("MSIE") || browser.contains("Trident") || browser.contains("Edge")) {
                encodedFileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
            } else {
                encodedFileName = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
            }

            return ResponseEntity.ok()
                    .headers(excelFile.getHeaders())
                    .header("Content-Disposition", "attachment; filename=\"" + encodedFileName + ".xlsx\"")
                    .body(excelFile.getBody());
        } catch (UnsupportedEncodingException e) {
            logger.error("파일명 인코딩 에러: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
