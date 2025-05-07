import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number
  ) => {
    e.preventDefault();
    onPageChange(page);
  };

  return (
    <div>
      <ul className="pagination">
        <li
          className={`page-item icon_first ${
            currentPage === 1 ? "disabled" : ""
          }`}
        >
          <a
            className="page-link"
            href={`?page=1`}
            onClick={(e) => handleClick(e, 1)}
            role="button"
            aria-label="처음으로"
            tabIndex={currentPage === 1 ? -1 : 0}
          >
            처음으로
          </a>
        </li>
        <li
          className={`page-item previous ${
            currentPage === 1 ? "disabled" : ""
          }`}
        >
          <a
            className="page-link"
            href={`?page=${currentPage - 1}`}
            onClick={(e) => handleClick(e, currentPage - 1)}
            role="button"
            aria-label="이전"
            tabIndex={currentPage === 1 ? -1 : 0}
          >
            Previous
          </a>
        </li>
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "on" : ""}`}
          >
            <a
              className="page-link"
              href={`?page=${number}`}
              onClick={(e) => handleClick(e, number)}
              role="button"
              aria-current={currentPage === number ? "page" : undefined}
            >
              {number}
            </a>
          </li>
        ))}
        <li
          className={`page-item next ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <a
            className="page-link"
            href={`?page=${currentPage + 1}`}
            onClick={(e) => handleClick(e, currentPage + 1)}
            role="button"
            aria-label="다음"
            tabIndex={currentPage === totalPages ? -1 : 0}
          >
            Next
          </a>
        </li>
        <li
          className={`page-item icon_last ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <a
            className="page-link"
            href={`?page=${totalPages}`}
            onClick={(e) => handleClick(e, totalPages)}
            role="button"
            aria-label="마지막으로"
            tabIndex={currentPage === totalPages ? -1 : 0}
          >
            마지막으로
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
