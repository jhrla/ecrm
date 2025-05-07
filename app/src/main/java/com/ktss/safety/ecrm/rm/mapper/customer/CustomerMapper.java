package com.ktss.safety.ecrm.rm.mapper.customer;

import org.apache.ibatis.annotations.Mapper;

import java.util.Map;
import java.util.List;

@Mapper
public interface CustomerMapper {
    List<Map<String, Object>> getCustomerList(Map<String, Object> paramMap);

    int getCustomerListCount(Map<String, Object> paramMap);

    int setTransferCustomer(Map<String, Object> paramMap);

    int deleteTransferCustomer(Map<String, Object> paramMap);

    List<Map<String, Object>> getCustomerExcel(Map<String, Object> paramMap);
}
