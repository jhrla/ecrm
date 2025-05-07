package com.ktss.safety.ecrm.rm.controller.device;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ktss.safety.ecrm.rm.service.device.DeviceService;
import com.ktss.safety.ecrm.util.FileUpload;

@RestController
public class DeviceController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private DeviceService deviceMgt;

    private final FileUpload fileUpload;

    @Autowired
    public DeviceController(FileUpload fileUpload) {
        this.fileUpload = fileUpload;
    }

    @PostMapping("/api/floorInfoList")
    public ResponseEntity<Map<String, Object>> floorInfoList(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(deviceMgt.getFloorInfoList(paramMap));
    }

    @PostMapping("/api/setFloorInfo")
    public ResponseEntity<Integer> setFloorInfo(
            @RequestParam("contract_code") String contract_code,
            @RequestParam("client_code") String client_code,
            @RequestParam(value = "floors", required = false) List<String> floors,
            @RequestParam(value = "floors_name", required = false) List<String> floorsNm,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "removeFiles", required = false) String removeFiles) {

        logger.info("setFloorInfo called with: contract_code={}, client_code={}", contract_code, client_code);
        logger.info("floors size: {}, floorsNm size: {}, files size: {}",
                floors != null ? floors.size() : 0,
                floorsNm != null ? floorsNm.size() : 0,
                files != null ? files.length : 0);

        Integer resultCnt = 0;
        try {
            if (removeFiles != null && !removeFiles.isEmpty()) {
                logger.info("Deleting floor info with removeFiles: {}", removeFiles);
                resultCnt = deviceMgt.deleteFloorInfo(removeFiles);
                if (resultCnt > 0) {
                    return ResponseEntity.ok(resultCnt);
                }
            }

            if (floors != null && !floors.isEmpty()) {
                Map<String, Object> clientData = new HashMap<>();
                clientData.put("contract_code", contract_code);
                clientData.put("client_code", client_code);
                clientData.put("floors", floors);
                clientData.put("floors_name", floorsNm);

                logger.info("Setting floor info with clientData: {}", clientData);
                resultCnt = deviceMgt.setFloorInfo(clientData, files);
            } else {
                logger.warn("No floors data provided");
            }

            logger.info("Operation completed with resultCnt: {}", resultCnt);
            return ResponseEntity.ok(resultCnt);
        } catch (Exception e) {
            logger.error("Error in setFloorInfo: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
        }
    }

    @PostMapping("/api/floorFileList")
    public ResponseEntity<List<Map<String, Object>>> floorFileList(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(deviceMgt.getFloorFileList(paramMap));
    }

    @PostMapping("/api/fromDevcieList")
    public ResponseEntity<List<Map<String, Object>>> fromDevcieList(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(deviceMgt.getDeviceInfo(paramMap));
    }

    @PostMapping("/api/setDevcieList")
    public ResponseEntity<Integer> setDevcieList(@RequestBody List<Map<String, Object>> deviceList) {
        return ResponseEntity.ok(deviceMgt.setDeviceInfo(deviceList));
    }

    @PostMapping("/api/getFloorPlanInfo")
    public ResponseEntity<Map<String, Object>> getFloorPlanInfo(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(deviceMgt.getFloorPlanInfo(paramMap));
    }

    @GetMapping("/api/getFloorImage")
    public ResponseEntity<Resource> getFloorImage(@RequestParam("imagePath") String imagePath) {
        try {
            Resource resource = fileUpload.getFloorImage(imagePath);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/updateFloorDevice")
    public ResponseEntity<Integer> setDevicePosition(@RequestBody List<Map<String, Object>> deviceList) {
        return ResponseEntity.ok(deviceMgt.setDevicePosition(deviceList));
    }

    @PostMapping("/api/getDevicesList")
    public ResponseEntity<Map<String, Object>> getDevicesList(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(deviceMgt.getDevicesList(paramMap));
    }

    @PostMapping("/api/getDeviceSetup")
    public ResponseEntity<Map<String, Object>> getDeviceSetup(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(deviceMgt.getDeviceSetup(paramMap));
    }

}
