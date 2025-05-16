package com.ktss.safety.ecrm.fcm;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface FcmMapper {
    void upsertDeviceFcmToken(Map<String, Object> paramMap);

    void deleteDeviceFcmToken(Map<String, Object> paramMap);

    List<Map<String, Object>> getFcmTokensByContractCode(String contract_code);

    Map<String, Object> getFcmPhone(Map<String, Object> paramMap);

    Map<String, Object> getFcmUseYn(Map<String, Object> paramMap);
}