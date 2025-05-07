FROM tomcat10-java17:latest

# Step 2: 업로드 폴더 생성 및 권한 설정
RUN mkdir -p /usr/local/tomcat/webapps/ROOT/uploads \
    && chown -R root:root /usr/local/tomcat/webapps/ROOT/uploads \
    && chmod -R 777 /usr/local/tomcat/webapps/ROOT/uploads

# Step 3: custom web.xml 설정을 위한 폴더 복사
COPY ./web.xml /usr/local/tomcat/conf/web.xml

# Step 4: 포트 노출 (8080)
EXPOSE 8080

# Step 5: Tomcat 시작 명령어
CMD ["/usr/local/tomcat/bin/catalina.sh", "run"]