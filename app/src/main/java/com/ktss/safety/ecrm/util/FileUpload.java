package com.ktss.safety.ecrm.util;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Component
public class FileUpload {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    private final String uploadDir;

    @Autowired
    public FileUpload(@Value("${file.upload.path}") String uploadDir) {
        this.uploadDir = uploadDir;
        logger.info("FileUpload 생성자: uploadDir = {}", uploadDir);
    }

    @PostConstruct
    public void init() {
        logger.info("Upload Directory 초기화 시작");
        logger.info("현재 Upload Directory 설정값: {}", uploadDir);

        try {
            if (uploadDir == null || uploadDir.trim().isEmpty()) {
                throw new IllegalStateException("file.upload.path 설정을 찾을 수 없습니다.");
            }

            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                logger.info("Upload Directory 생성 완료: {}", path);
            }

            logger.info("Upload Directory 초기화 완료: {}", uploadDir);
        } catch (IOException e) {
            logger.error("Upload Directory 초기화 실패: {}", e.getMessage());
            throw new RuntimeException("Upload directory initialization failed", e);
        }
    }

    public Map<String, Object> uploadFile(MultipartFile[] files,
            String contract_code, String client_code, List<String> floors) {
        Map<String, Object> resultMsg = new HashMap<String, Object>();

        if (files.length == 0) {
            resultMsg.put("resultCode", "999");
            resultMsg.put("resultMsg", "파일이 업로드되지 않았습니다.");
        }

        // 파일 처리 로직
        List<Path> uploadedFiles = new ArrayList<>(); // 성공적으로 업로드된 파일 경로 저장
        List<String> filePaths = new ArrayList<String>();
        // 파일 처리 로직

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            StringBuffer sb = new StringBuffer();
            sb.append(client_code)
                    .append("_")
                    .append(contract_code)
                    .append("_")
                    .append(floors.get(i));

            try {
                // 파일 이름을 저장할 수 있게 처리
                String fileName = StringUtils.cleanPath(file.getOriginalFilename());

                // 파일 확장자 추출
                String extension = "";
                int dotIndex = fileName.lastIndexOf('.');
                if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
                    extension = fileName.substring(dotIndex + 1).toLowerCase(); // 확장자 추출 (소문자로 변환)
                }

                // 이미지 확장자 검사
                List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "webp");
                if (!allowedExtensions.contains(extension)) {
                    throw new IOException("지원하지 않는 파일 형식입니다."); // 예외 발생
                }

                // 확장자를 포함해 StringBuffer에 추가
                sb.append(".").append(extension); // 파일 이름 끝에 확장자 추가

                filePaths.add(sb.toString());

                Path uploadPath = Paths.get(uploadDir);

                // 디렉토리가 존재하지 않으면 생성
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // 파일을 서버에 저장
                Path filePath = uploadPath.resolve(sb.toString());
                file.transferTo(filePath.toFile());

                // 업로드된 파일 경로 저장 (롤백 시 삭제용)
                uploadedFiles.add(filePath);

                resultMsg.put("resultCode", "0");
                resultMsg.put("resultMsg", "정상적으로 업로드 되었습니다.");

            } catch (Exception e) {
                e.printStackTrace();
                // 롤백: 업로드된 파일 삭제
                for (Path uploadedFile : uploadedFiles) {
                    try {
                        Files.deleteIfExists(uploadedFile);
                    } catch (IOException ioException) {
                        ioException.printStackTrace();
                    }
                }
                resultMsg.put("resultCode", "100");
                resultMsg.put("resultMsg", "파일 업로드 중 오류가 발생하였습니다. 모든 파일 롤백되었습니다.");
                return resultMsg; // 예외 발생 시 처리 종료
            }
        }

        resultMsg.put("filePaths", filePaths);
        return resultMsg;
    }

    public Resource getFloorImage(String imagePath) {
        try {
            logger.debug("getFloorImage 호출: uploadDir = {}, imagePath = {}", uploadDir, imagePath);

            if (uploadDir == null) {
                logger.error("uploadDir이 null입니다");
                throw new RuntimeException("Upload directory is not configured");
            }

            if (imagePath == null) {
                logger.error("imagePath가 null입니다");
                throw new RuntimeException("Image path is null");
            }

            String fullPath = uploadDir + File.separator + imagePath;
            logger.debug("이미지 파일 전체 경로: {}", fullPath);

            Path file = Paths.get(fullPath);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                logger.error("파일을 찾을 수 없습니다: {}", fullPath);
                throw new RuntimeException("파일을 찾을 수 없습니다: " + fullPath);
            }
        } catch (MalformedURLException e) {
            logger.error("URL 생성 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("URL이 잘못되었습니다.", e);
        }
    }

    public boolean deleteFile(String filePath) {
        File file = new File(uploadDir + filePath);

        // 파일이 존재하는지 확인
        if (file.exists()) {
            // 파일 삭제 시도
            if (file.delete()) {
                System.out.println("파일이 성공적으로 삭제되었습니다: " + filePath);
                return true;
            } else {
                System.out.println("파일을 삭제하는 데 실패했습니다: " + filePath);
                return false;
            }
        } else {
            System.out.println("파일이 존재하지 않습니다: " + filePath);
            return false;
        }
    }
}
