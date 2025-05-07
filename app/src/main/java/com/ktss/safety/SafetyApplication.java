package com.ktss.safety;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.ConfigurableApplicationContext;
import java.util.Arrays;

@MapperScan("com.ktss.safety.ecrm")
@SpringBootApplication
@PropertySource("classpath:application.properties")
public class SafetyApplication extends SpringBootServletInitializer {

	@Autowired
	private DataSource dataSource;

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(SafetyApplication.class); // YourApplication은 메인 애플리케이션 클래스입니다.
	}

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(SafetyApplication.class, args);

		// 활성화된 프로필 출력
		String[] activeProfiles = context.getEnvironment().getActiveProfiles();
		System.out.println("Active profiles: " + Arrays.toString(activeProfiles));

		System.out.println(java.time.ZonedDateTime.now());

		// property 값 확인
		String uploadPath = context.getEnvironment().getProperty("file.upload.path");
		System.out.println("Upload path: " + uploadPath);
	}

	@PreDestroy
	public void onShutdown() {
		if (dataSource instanceof HikariDataSource) {
			HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
			if (!hikariDataSource.isClosed()) {
				hikariDataSource.close();
			}
		}
	}

}
