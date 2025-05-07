package com.ktss.safety.ecrm.rm.service.device;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.ktss.safety.ecrm.rm.mapper.device.DeviceMapper;
import com.ktss.safety.ecrm.util.FileUpload;
import com.ktss.safety.ecrm.util.HttpsClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeviceService {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final FileUpload fileUpload;
    private final DeviceMapper deviceMapper;

    public Map<String, Object> getFloorInfoList(Map<String, Object> paramMap) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        logger.debug("############################################################");
        logger.debug("getFloorInfoList called with: {}", paramMap);
        logger.debug("#############################################################");

        // 안전한 타입 캐스팅을 위한 처리
        int page = 1; // 기본값 설정
        int pageSize = 10; // 기본값 설정

        if (paramMap.get("page") instanceof Integer) {
            page = (Integer) paramMap.get("page");
        } else if (paramMap.get("page") instanceof String) {
            page = Integer.parseInt((String) paramMap.get("page"));
        }

        if (paramMap.get("pageSize") instanceof Integer) {
            pageSize = (Integer) paramMap.get("pageSize");
        } else if (paramMap.get("pageSize") instanceof String) {
            pageSize = Integer.parseInt((String) paramMap.get("pageSize"));
        }

        int offset = (page - 1) * pageSize;
        paramMap.put("offset", offset);
        paramMap.put("pageSize", pageSize);

        List<Map<String, Object>> resultList = deviceMapper.getFloorInfoList(paramMap);

        int count = deviceMapper.getFloorInfoListCount(paramMap);
        int totalPages = (int) Math.ceil((double) count / pageSize);

        // Add results to the resultMap
        resultMap.put("floorInfoList", resultList);
        resultMap.put("totalPages", totalPages);
        resultMap.put("totalCount", count);

        return resultMap;
    }

    public List<Map<String, Object>> getFloorFileList(Map<String, Object> paramMap) {
        return deviceMapper.getFloorFileList(paramMap);
    }

    @Transactional
    public int setFloorInfo(Map<String, Object> clientData, MultipartFile[] files) {
        int result = 0;
        try {
            String contract_code = (String) clientData.get("contract_code");
            String client_code = (String) clientData.get("client_code");
            @SuppressWarnings("unchecked")
            List<String> floors = (List<String>) clientData.get("floors");
            @SuppressWarnings("unchecked")
            List<String> floorsNm = (List<String>) clientData.get("floors_name");

            logger.debug("Processing floor info - contract_code: {}, client_code: {}", contract_code, client_code);
            logger.debug("Floors: {}, FloorNames: {}", floors, floorsNm);
            logger.debug("Files length: {}", files != null ? files.length : 0);

            List<String> filePaths = new ArrayList<>();

            // 파일이 있는 경우 파일 업로드 처리
            if (files != null && files.length > 0) {
                Map<String, Object> resultMsg = fileUpload.uploadFile(files, contract_code, client_code, floors);
                if (!resultMsg.get("resultCode").equals("0")) {
                    logger.error("File upload failed with result code: {}", resultMsg.get("resultCode"));
                    throw new RuntimeException("File upload failed");
                }
                @SuppressWarnings("unchecked")
                List<String> uploadedPaths = (List<String>) resultMsg.get("filePaths");
                filePaths = uploadedPaths;
                logger.debug("File upload successful. File paths: {}", filePaths);
            }

            // 데이터 저장/수정
            for (int i = 0; i < floors.size(); i++) {
                Map<String, String> floorData = new HashMap<>();
                floorData.put("floor_no", floors.get(i));
                floorData.put("floor_name", floorsNm.get(i));
                floorData.put("contract_code", contract_code);
                floorData.put("client_code", client_code);

                if (files != null && files.length > 0) {
                    if (i < filePaths.size()) {
                        floorData.put("file_path", filePaths.get(i));
                    } else {
                        logger.warn("No file path available for floor index: {}", i);
                    }
                }

                // 기존 데이터 확인
                Map<String, Object> existingData = deviceMapper.getFloorFileInfo(floorData);

                if (existingData != null) {
                    // 기존 데이터가 있는 경우
                    if (files != null && files.length > 0) {
                        // 새 파일이 있다면 기존 파일 삭제 후 새 파일 경로 설정
                        String oldFilePath = (String) existingData.get("file_path");
                        if (oldFilePath != null) {
                            fileUpload.deleteFile(oldFilePath);
                        }
                        if (i < filePaths.size()) {
                            floorData.put("file_path", filePaths.get(i));
                        } else {
                            logger.warn("No file path available for floor index: {}", i);
                        }
                    } else {
                        // 새 파일이 없다면 기존 파일 경로 유지
                        floorData.put("file_path", (String) existingData.get("file_path"));
                    }

                    // 데이터 업데이트
                    logger.debug("Updating floor data: {}", floorData);
                    result += deviceMapper.updateFloorInfo(floorData);
                } else {
                    // 새로운 데이터 추가
                    if (files != null && files.length > 0) {
                        if (i < filePaths.size()) {
                            floorData.put("file_path", filePaths.get(i));
                        } else {
                            logger.warn("No file path available for floor index: {}", i);
                        }
                    }
                    logger.debug("Inserting new floor data: {}", floorData);
                    result += deviceMapper.setFloorUpload(floorData);
                }
            }

            logger.debug("Final result count: {}", result);
            return result;
        } catch (Exception e) {
            logger.error("Error in setFloorInfo: ", e);
            throw e;
        }
    }

    @Transactional
    public int deleteFloorInfo(String floorData) {
        int result = 0;
        try {
            List<Map<String, String>> removeFiles = new Gson().fromJson(floorData,
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());

            logger.debug("Deleting floor info - files to remove: {}", removeFiles);

            for (Map<String, String> removeFile : removeFiles) {
                // 파일 삭제
                boolean fileDeleted = fileUpload.deleteFile(removeFile.get("file_path"));
                logger.debug("File deletion result for {}: {}", removeFile.get("file_path"), fileDeleted);

                // DB 데이터 삭제
                int deleteDeviceLogsResult = deviceMapper.deleteDeviceLogs(removeFile);
                int deleteFloorDevicesResult = deviceMapper.deleteFloorDevices(removeFile);
                int deleteFloorInfoResult = deviceMapper.deleteFloorInfo(removeFile);
                int deleteEventLogResult = deviceMapper.deleteEventLogs(removeFile);
                logger.debug("DB deletion result for floor {}: {} {} {} {}", removeFile.get("floor_no"),
                        deleteDeviceLogsResult, deleteFloorDevicesResult, deleteFloorInfoResult, deleteEventLogResult);

                // 삭제된 레코드 수 누적
                result += deleteDeviceLogsResult + deleteFloorDevicesResult + deleteFloorInfoResult
                        + deleteEventLogResult;
            }

            logger.debug("Total deleted records: {}", result);
            return result;
        } catch (Exception e) {
            logger.error("Error in deleteFloorInfo: ", e);
            throw e;
        }
    }

    public List<Map<String, Object>> getDeviceInfo(Map<String, Object> paramMap) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        try {
            JsonObject jobj = new JsonObject();
            jobj.addProperty("MeasuredTime", formatter.format(new Date()));
            jobj.addProperty("ContractInfo", String.valueOf(paramMap.get("contract_code")));
            HttpsClient https = new HttpsClient();

            JsonObject resultObj = https.sendDeviceInfo("http://211.233.16.207:33311/infra", jobj);
            logger.debug("API Response: {}", resultObj);

            if (resultObj != null && resultObj.has("ContractInfoList")) {
                JsonObject contractInfoList = resultObj.getAsJsonObject("ContractInfoList");
                if (contractInfoList.has("DeviceInfo")) {
                    JsonArray deviceArray = contractInfoList.getAsJsonArray("DeviceInfo");
                    String client_code = String.valueOf(paramMap.get("client_code"));
                    String contract_code = String.valueOf(paramMap.get("contract_code"));

                    for (JsonElement deviceElement : deviceArray) {
                        processDevice(deviceElement.getAsJsonObject(), resultList, contract_code, client_code);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error in getDeviceInfo: ", e);
        }
        return resultList;
    }

    private void processDevice(JsonObject device, List<Map<String, Object>> resultList,
            String contract_code, String client_code) {
        String comId = device.get("ComId").getAsString();

        // 수신기 정보 처리
        Map<String, Object> deviceMap = new HashMap<>();
        deviceMap.put("contract_code", contract_code);
        deviceMap.put("client_code", client_code);
        deviceMap.put("device_id", device.get("DeviceId").getAsString());
        deviceMap.put("device_type", device.get("Type").getAsString());
        deviceMap.put("device_name", getDeviceType(device.get("Type").getAsString()));
        deviceMap.put("install_address", device.get("InstallAddress").getAsString());
        deviceMap.put("floor_no", device.get("InstallFloor").getAsString());
        deviceMap.put("install_date", device.get("InstallDate").getAsString());
        deviceMap.put("com_id", comId);
        resultList.add(deviceMap);

        // 중계기와 단말기 처리 시 ComId 전달
        if (device.has("RepeaterInfo")) {
            JsonArray repeaterArray = device.getAsJsonArray("RepeaterInfo");
            for (JsonElement repeaterElement : repeaterArray) {
                JsonObject repeater = repeaterElement.getAsJsonObject();
                processRepeater(repeater, resultList, contract_code, client_code, device.get("DeviceId").getAsString(),
                        comId);
            }
        }

        if (device.has("TerminalInfo")) {
            JsonArray terminalArray = device.getAsJsonArray("TerminalInfo");
            for (JsonElement terminalElement : terminalArray) {
                JsonObject terminal = terminalElement.getAsJsonObject();
                processTerminal(terminal, resultList, contract_code, client_code, device.get("DeviceId").getAsString(),
                        comId, "terminal");
            }
        }
    }

    private void processRepeater(JsonObject repeater, List<Map<String, Object>> resultList,
            String contract_code, String client_code, String parentId, String comId) {
        Map<String, Object> repeaterMap = new HashMap<>();
        repeaterMap.put("contract_code", contract_code);
        repeaterMap.put("client_code", client_code);
        repeaterMap.put("parent_device_id", parentId);
        repeaterMap.put("device_id", parentId + "-" + repeater.get("DeviceId").getAsString());
        repeaterMap.put("device_type", repeater.get("Type").getAsString());
        repeaterMap.put("device_name", getDeviceType(repeater.get("Type").getAsString()));
        repeaterMap.put("install_address", repeater.get("InstallAddress").getAsString());
        repeaterMap.put("floor_no", repeater.get("InstallFloor").getAsString());
        repeaterMap.put("install_date", repeater.get("InstallDate").getAsString());
        repeaterMap.put("com_id", comId);
        resultList.add(repeaterMap);

        if (repeater.has("TerminalInfo")) {
            JsonArray terminalArray = repeater.getAsJsonArray("TerminalInfo");
            for (JsonElement terminalElement : terminalArray) {
                JsonObject terminal = terminalElement.getAsJsonObject();
                processTerminal(terminal, resultList, contract_code, client_code,
                        parentId, comId, "repeater");
            }
        }
    }

    private void processTerminal(JsonObject terminal, List<Map<String, Object>> resultList,
            String contract_code, String client_code, String parentId, String comId, String type) {
        Map<String, Object> terminalMap = new HashMap<>();
        terminalMap.put("contract_code", contract_code);
        terminalMap.put("client_code", client_code);
        terminalMap.put("parent_device_id", parentId);
        if (type.equals("terminal")) {
            terminalMap.put("device_id", terminal.get("DeviceId").getAsString());
        } else {
            terminalMap.put("device_id", parentId + "-" + terminal.get("DeviceId").getAsString());
        }
        terminalMap.put("device_type", terminal.get("Type").getAsString());
        terminalMap.put("device_name", getDeviceType(terminal.get("Type").getAsString()));
        terminalMap.put("install_address", terminal.get("InstallAddress").getAsString());
        terminalMap.put("floor_no", terminal.get("InstallFloor").getAsString());
        terminalMap.put("install_date", terminal.get("InstallDate").getAsString());
        terminalMap.put("com_id", comId);
        resultList.add(terminalMap);
    }

    public int setDeviceInfo(List<Map<String, Object>> deviceList) {
        // 기존정보 불러오기
        int result = 0;
        // 고객번호 , 계약번호 가져오기 위해
        Map<String, Object> deviceInfo = deviceList.get(0);
        for (Map<String, Object> device : deviceList) {
            logger.debug("device Info : {}", device.toString());
            deviceMapper.setDeviceInfo(device);
            result++;
        }
        deviceInfo.put("contract_qty", deviceList.size());

        deviceMapper.setDeviceQty(deviceInfo);

        return result;
    }

    public Map<String, Object> getFloorPlanInfo(Map<String, Object> paramMap) {
        Map<String, Object> floorInfo = new HashMap<String, Object>();
        List<Map<String, String>> floorList = deviceMapper.getFloorList(paramMap);
        List<Map<String, Object>> floorDeviceList = deviceMapper.getFloorDeviceList(paramMap);
        floorInfo.put("floorList", floorList);
        floorInfo.put("floorDeviceList", floorDeviceList);

        return floorInfo;
    }

    public int setDevicePosition(List<Map<String, Object>> deviceList) {
        int result = 0;
        for (Map<String, Object> device : deviceList) {
            deviceMapper.setDevicePosition(device);
        }
        return result;
    }

    private String getDeviceType(String deviceType) {
        String typeName = null;
        switch (deviceType) {
            case "160":
                typeName = "수신기";
                break;
            case "176":
                typeName = "중계기";
                break;
            case "128":
                typeName = "화재감지기";
                break;
            case "129":
                typeName = "화재감지기";
                break;
            case "148":
                typeName = "발신기";
                break;

            default:
                break;
        }
        return typeName;
    }

    public Map<String, Object> getDevicesList(Map<String, Object> paramMap) {
        Map<String, Object> resultMap = new HashMap<String, Object>();

        // 안전한 타입 캐스팅을 위한 처리
        int page = 1; // 기본값 설정
        int pageSize = 10; // 기본값 설정

        if (paramMap.get("page") instanceof Integer) {
            page = (Integer) paramMap.get("page");
        } else if (paramMap.get("page") instanceof String) {
            page = Integer.parseInt((String) paramMap.get("page"));
        }

        if (paramMap.get("pageSize") instanceof Integer) {
            pageSize = (Integer) paramMap.get("pageSize");
        } else if (paramMap.get("pageSize") instanceof String) {
            pageSize = Integer.parseInt((String) paramMap.get("pageSize"));
        }

        int offset = (page - 1) * pageSize;

        paramMap.put("offset", offset);
        paramMap.put("pageSize", pageSize);

        int count = deviceMapper.getDevicesListCount(paramMap);
        int totalPages = (int) Math.ceil((double) count / pageSize);

        List<Map<String, Object>> resultList = deviceMapper.getDevicesList(paramMap);
        resultMap.put("totalPages", totalPages);
        resultMap.put("totalCount", count);
        resultMap.put("devicesList", resultList);
        return resultMap;
    }

    public Map<String, Object> getDeviceSetup(Map<String, Object> paramMap) {
        Map<String, Object> resultMap = new HashMap<String, Object>();

        try {
            // 필수 파라미터 검증
            if (paramMap.get("MeasuredTime") == null || paramMap.get("ComId") == null
                    || paramMap.get("DeviceId") == null) {
                logger.error("Required parameters are missing");
                resultMap.put("error", "필수 파라미터가 누락되었습니다.");
                return resultMap;
            }

            JsonObject jobj = new JsonObject();
            jobj.addProperty("MeasuredTime", String.valueOf(paramMap.get("MeasuredTime")));
            jobj.addProperty("ComId", String.valueOf(paramMap.get("ComId")));
            jobj.addProperty("DeviceId", String.valueOf(paramMap.get("DeviceId")));

            HttpsClient https = new HttpsClient();
            JsonObject resultObj = https.sendDeviceInfo("http://211.233.16.207:33311/setup", jobj);

            if (resultObj != null) {
                // JSON 응답을 Map으로 변환
                Gson gson = new Gson();
                Map<String, Object> responseMap = gson.fromJson(resultObj, new TypeToken<Map<String, Object>>() {
                }.getType());

                resultMap.put("data", responseMap); // 전체 데이터를 'data' 키로 저장
                resultMap.put("success", true);
                resultMap.put("errorCode", responseMap.get("ErrorCode"));

                logger.debug("Device setup response: {}", responseMap);
            } else {
                resultMap.put("error", "장치 설정 정보를 가져오는데 실패했습니다.");
                resultMap.put("success", false);
            }

        } catch (Exception e) {
            logger.error("Error in getDeviceSetup: ", e);
            resultMap.put("error", "장치 설정 조회 중 오류가 발생했습니다.");
            resultMap.put("success", false);
        }

        return resultMap;
    }

}
