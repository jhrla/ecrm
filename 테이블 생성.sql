CREATE TABLE ecrm_customer_info (
    client_code varchar(50) NOT NULL,  -- Primary Key
    contract_code VARCHAR(50) NOT NULL,  -- Contract Number
    customer_name VARCHAR(255),  -- Customer Name
    city_code VARCHAR(5),  -- City Code
    city_name VARCHAR(50),  -- City Name
    district_code VARCHAR(5),  -- District Code
    district_name VARCHAR(50),  -- District Name
    address VARCHAR(255),  -- Address
    building_type VARCHAR(10),  -- Building Type
    service_type VARCHAR(10),  -- Service Type
    contract_qty INT,  -- Contract Quantity    
    gps_position VARCHAR(50),  -- Building GPS Coordinates
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data Received Time
    create_id varchar(50),
    update_time TIMESTAMP,
    update_id varchar(50),
    PRIMARY KEY (client_code, contract_code)  -- Composite Primary Key
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ecrm_floor_plan (    
    client_code varchar(50) NOT NULL,  -- Foreign Key from ecrm_customer_info (client_code)
    contract_code VARCHAR(50) NOT NULL,  -- Foreign Key from ecrm_customer_info (contract_code)
    floor_no INT,  -- Floor Number
    floor_name varchar(50),  -- Floor Name
    file_path VARCHAR(255),  -- File Path of the Drawing
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data Received Time
    create_id varchar(50),
    update_time TIMESTAMP,
    update_id varchar(50),
    PRIMARY KEY (client_code, contract_code, floor_no),
    FOREIGN KEY (client_code, contract_code) 
        REFERENCES ecrm_customer_info(client_code, contract_code)  -- Composite Foreign Key
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ecrm_device_info (    
    client_code VARCHAR(50) NOT NULL,                    -- Foreign Key from CustomerInfo (client_code)
    contract_code VARCHAR(50) NOT NULL,            -- Foreign Key from CustomerInfo (contract_code)
    com_id varchar(50),
    device_id VARCHAR(50),                          -- COMID    
    device_type VARCHAR(50),                  -- Equipment Type
    parent_device_id VARCHAR(50),                        -- Upper ID
    install_address VARCHAR(50),          -- Installation Location
    install_floor INT,                      -- Installation Floor
    install_date DATE,                      -- Installation Date
    install_position VARCHAR(50),            -- Drawing Coordinates
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data Received Time
    create_id   varchar(50),
    update_time TIMESTAMP,
    update_id   varchar(50),
    PRIMARY KEY (client_code,contract_code,device_id),
    FOREIGN KEY (client_code, contract_code) 
        REFERENCES ecrm_customer_info(client_code, contract_code)  -- Composite Foreign Key
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ecrm_event_log (
    log_id INT NOT NULL AUTO_INCREMENT,            -- Primary Key    
    client_code VARCHAR(50) NOT NULL,                      -- Foreign Key from CustomerInfo (client_code)
    contract_code VARCHAR(50) NOT NULL,              -- Foreign Key from CustomerInfo (contract_code)
    device_id VARCHAR(50),                            -- COMID    
    device_type VARCHAR(50),                    -- Equipment Type
    event_level INT,                               -- Event Level: 0=Normal, 1=Warning, 2=Critical, 3=Fire
    fire_stauts INT,
    low_battery INT,                            -- Battery Status: 0=Normal, 1=Low Battery
    fire_sensor_error INT,                     -- Fire Detection: 0=Normal, 1=Error
    tempIc_error INT,                      -- Temperature Abnormality: 0=Normal, 1=Error
    co_error INT,                    -- Smoke Detection: 0=Normal, 1=Error    
    flash_error INT,                               -- Flash Error: 0=Normal, 1=Error
    alarm_output INT,                               -- CO Detection: 0=Normal, 1=Error
    fire_now_status INT,                        -- Battery LED Output: 0=Normal, 1=Error    
    smoke_density INT,                           -- Smoke Density (%)
    temp INT,                             -- Temperature (°C)
    humidity INT,                                -- Humidity (%)
    batt_capacity INT,                        -- Battery Capacity (%)
    temp_rise INT,                        -- Temperature Rise (°C)
    co_density INT,                              -- CO Density (ppm)
    alarm_condition INT,                   -- Fire Judgment Condition
    received_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data Received Time
    PRIMARY KEY (log_id),
    FOREIGN KEY (client_code, contract_code,device_id) 
        REFERENCES ecrm_device_info(client_code, contract_code,device_id)  -- Composite Foreign Key Reference to contract_code in CustomerInfo
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;