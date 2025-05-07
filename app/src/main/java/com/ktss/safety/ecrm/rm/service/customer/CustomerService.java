package com.ktss.safety.ecrm.rm.service.customer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ktss.safety.ecrm.rm.mapper.customer.CustomerMapper;
import com.ktss.safety.ecrm.util.HttpsClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerMapper customerMapper;

    public Map<String, Object> getCustomerList(Map<String, Object> paramMap) {
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

        List<Map<String, Object>> resultList = customerMapper.getCustomerList(paramMap);

        int count = customerMapper.getCustomerListCount(paramMap);
        int totalPages = (int) Math.ceil((double) count / pageSize);

        // Add results to the resultMap
        resultMap.put("customerList", resultList);
        resultMap.put("totalPages", totalPages);
        resultMap.put("totalCount", count);

        return resultMap;
    }

    public String setTransferCustomer(Map<String, Object> paramMap) {
        String gps_position = getGpsPosition(String.valueOf(paramMap.get("service_address")));
        paramMap.put("gps_position", gps_position);
        if (null == gps_position) {
            return "GPS 확인이 불가능한 지역입니다. 주소를 수정해주세요.";
        }

        int result = customerMapper.setTransferCustomer(paramMap);
        if (result > 0) {
            return "정상 처리 되었습니다.";
        }
        return "고객 이관에 실패하였습니다.";
    }

    public String deleteTransferCustomer(Map<String, Object> paramMap) {
        int result = customerMapper.deleteTransferCustomer(paramMap);
        if (result > 0) {
            return "정상 처리 되었습니다.";
        }
        return "고객 이관 해제에 실패하였습니다.";
    }

    private String getGpsPosition(String address) {
        return new HttpsClient().sendAddress(address);
    }

    public List<Map<String, Object>> getCustomerExcel(Map<String, Object> paramMap) {
        return customerMapper.getCustomerExcel(paramMap);
    }
}
