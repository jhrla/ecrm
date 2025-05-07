package com.ktss.safety.ecrm.util;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ExcelDownUtil {
    private static final Logger logger = LoggerFactory.getLogger(ExcelDownUtil.class);

    public static ResponseEntity<byte[]> createExcelFile(String sheetName, List<Map<String, Object>> data,
            String[] headers, List<String> fields) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);

            // 폰더 생성 (한글)
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                sheet.setColumnWidth(i, 256 * 15);
            }

            // 데이터 추가 (Map의 키값 직접 사용)
            for (int i = 0; i < data.size(); i++) {
                Row row = sheet.createRow(i + 1);
                Map<String, Object> rowData = data.get(i);
                for (int j = 0; j < headers.length; j++) {
                    Cell cell = row.createCell(j);
                    Object value = rowData.get(fields.get(j));
                    cell.setCellValue(value != null ? value.toString() : "");
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return new ResponseEntity<>(outputStream.toByteArray(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("엑셀 파일 생성 에러: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}