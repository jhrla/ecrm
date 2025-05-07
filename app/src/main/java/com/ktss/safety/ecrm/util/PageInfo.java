package com.ktss.safety.ecrm.util;

import lombok.Data;

import java.util.List;

@Data
public class PageInfo<T> {
    private List<T> content;
    private int currentPage;
    private int totalPages;
    private long totalItems;
    private int pageSize;

    public PageInfo(List<T> content, int currentPage, int totalPages, long totalItems, int pageSize) {
        this.content = content;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.totalItems = totalItems;
        this.pageSize = pageSize;
    }

    public boolean hasNext() {
        return currentPage < totalPages - 1;
    }

    public boolean hasPrevious() {
        return currentPage > 0;
    }
}