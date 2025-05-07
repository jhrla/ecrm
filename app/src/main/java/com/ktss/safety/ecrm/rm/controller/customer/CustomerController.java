package com.ktss.safety.ecrm.rm.controller.customer;

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

import com.ktss.safety.ecrm.rm.service.customer.CustomerService;
import com.ktss.safety.ecrm.util.ExcelDownUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CustomerController {
    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);

    @Autowired
    private CustomerService customerService;

    @PostMapping("/api/customerList")
    public ResponseEntity<Map<String, Object>> getCustomerList(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(customerService.getCustomerList(paramMap));
    }

    @PostMapping("/api/setTransferCustomer")
    public ResponseEntity<String> transferCustomerList(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(customerService.setTransferCustomer(paramMap));
    }

    @PostMapping("/api/deleteTransferCustomer")
    public ResponseEntity<String> deleteTransferCustomer(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(customerService.deleteTransferCustomer(paramMap));
    }

    @GetMapping("/api/downloadCustomerExcel")
    public ResponseEntity<byte[]> downloadCustomerExcel(@RequestParam Map<String, Object> params,
            HttpServletRequest request) {
        List<Map<String, Object>> customerList = customerService.getCustomerExcel(params);
        String fileName = "고객목록"; // 파일명에서 공백 제거
        String[] headers = {
                "계약번호",
                "시",
                "군",
                "고객명",
                "대표자",
                "계약일시",
                "주소",
                "관리자",
                "연락처",
                "관할소방서",
                "관할경찰서",
                "건물유형" };

        List<String> fields = Arrays.asList(
                "contract_code",
                "region",
                "sub_region",
                "client_name",
                "ceo_name",
                "contract_date",
                "address",
                "manager_name",
                "manager_tel",
                "fire_tel",
                "police_tel",
                "building_type");

        ResponseEntity<byte[]> excelFile = ExcelDownUtil.createExcelFile(fileName, customerList, headers, fields);
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
