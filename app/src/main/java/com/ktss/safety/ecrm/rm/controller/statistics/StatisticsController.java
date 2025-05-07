package com.ktss.safety.ecrm.rm.controller.statistics;

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

import com.ktss.safety.ecrm.rm.service.statistics.StatisticsService;
import com.ktss.safety.ecrm.util.ExcelDownUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class StatisticsController {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsController.class);
    @Autowired
    private StatisticsService statisticsService;

    @PostMapping("/api/getPeriodicReport")
    public ResponseEntity<Map<String, Object>> getPeriodicReport(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(statisticsService.getPeriodicReport(paramMap));
    }

    @GetMapping("/api/downloadPeriodicReportExcel")
    public ResponseEntity<byte[]> downloadPeriodicReportExcel(@RequestParam Map<String, Object> params,
            HttpServletRequest request) {
        List<Map<String, Object>> periodicReportList = statisticsService.getPeriodicReportExcel(params);
        String fileName = "이벤트목록"; // 파일명에서 공백 제거
        String[] headers = {
                "계약번호",
                "지역",
                "고객명",
                "건물유형",
                "장비명",
                "설치위치",
                "장비ID",
                "수집시간",
                "온도",
                "연기",
                "습도",
                "일산화탄소",
                "이벤트" };

        List<String> fields = Arrays.asList(
                "contract_code",
                "city_name",
                "customer_name",
                "building_type",
                "device_name",
                "install_address",
                "device_id",
                "event_time",
                "temp",
                "smoke_density",
                "humidity",
                "co",
                "fire_event");

        ResponseEntity<byte[]> excelFile = ExcelDownUtil.createExcelFile(fileName, periodicReportList, headers, fields);
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
