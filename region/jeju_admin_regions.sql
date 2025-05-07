
-- 제주특별자치도 및 구 데이터
INSERT INTO administrative_regions (id, name, gps_latitude, gps_longitude, parent_id, level) VALUES
('50000', '제주특별자치도', 33.4890, 126.4983, NULL, 1),
('50110', '제주시', 33.4996, 126.5312, '50000', 2),
('50130', '서귀포시', 33.2539, 126.5585, '50000', 2);
