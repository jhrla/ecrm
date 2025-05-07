package com.ktss.safety.ecrm.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping(value = { "/{path:[^\\.]*}" })
    public String handleError() {
        // React의 index.html로 리디렉션
        return "forward:/";
    }
}
