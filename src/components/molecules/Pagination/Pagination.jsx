import React from "react";
import classes from "./Pagination.module.css";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";

/**
 * Pagination Component - A flexible and accessible pagination component
 * 
 * Features:
 * - Smart page number display with ellipsis for large page counts
 * - Responsive design that adapts to mobile screens
 * - Full accessibility support with ARIA labels and keyboard navigation
 * - Configurable number of visible page buttons
 * - Optional results text display
 * - Input validation and error handling
 * - Smooth hover and focus transitions
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page number (default: 1)
 * @param {number} props.limit - Number of items per page (default: 10)
 * @param {number} props.totalRecords - Total number of records to paginate (default: 0)
 * @param {Function} props.onPageChange - Callback function called when page changes (required)
 * @param {boolean} props.showResultsText - Whether to show "Showing X - Y of Z Results" text (default: true)
 * @param {number} props.maxVisiblePages - Maximum number of page buttons to show (default: 5)
 * @returns {JSX.Element|null} Pagination component or null if no records
 * 
 * @example
 * // Basic usage
 * <Pagination
 *   currentPage={1}
 *   limit={10}
 *   totalRecords={100}
 *   onPageChange={setCurrentPage}
 * />
 * 
 * @example
 * // Custom configuration
 * <Pagination
 *   currentPage={5}
 *   limit={20}
 *   totalRecords={500}
 *   onPageChange={setCurrentPage}
 *   maxVisiblePages={7}
 *   showResultsText={false}
 * />
 * 
 * @example
 * // Mobile-friendly
 * <Pagination
 *   currentPage={3}
 *   limit={5}
 *   totalRecords={50}
 *   onPageChange={setCurrentPage}
 *   maxVisiblePages={3}
 * />
 * 
 * @example
 * // Large dataset with many pages
 * <Pagination
 *   currentPage={25}
 *   limit={50}
 *   totalRecords={10000}
 *   onPageChange={setCurrentPage}
 *   maxVisiblePages={10}
 * />
 */
export default function Pagination({
  currentPage = 1,
  limit = 10,
  totalRecords = 0,
  onPageChange,
  showResultsText = true,
  maxVisiblePages = 5,
}) {
  // Input validation - ensure required props are provided
  if (!onPageChange || typeof onPageChange !== 'function') {
    console.error('Pagination: onPageChange is required and must be a function');
    return null;
  }

  // Don't render pagination if there are no records
  if (totalRecords <= 0) {
    return null;
  }

  const totalPages = Math.ceil(totalRecords / limit);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  /**
   * Renders the page number buttons and navigation arrows
   * @private
   * @returns {JSX.Element[]} Array of page button elements
   */
  const renderPageNumbers = () => {
    const pages = [];

    // Don't render pagination if only one page
    if (totalPages <= 1) {
      return pages;
    }

    // Previous arrow
    pages.push(
      <button
        key="prev"
        className={`${classes.arrowButton} ${classes.prevButton}`}
        onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
        disabled={safeCurrentPage === 1}
        aria-label="Previous page"
        type="button"
      >
        <IoArrowBackOutline size={22} />
      </button>
    );

    // Calculate page range to show
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, safeCurrentPage - halfVisible);
    let endPage = Math.min(totalPages, safeCurrentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    // First page (if not already included)
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={safeCurrentPage === 1 ? classes.activePage : classes.pageButton}
          onClick={() => onPageChange(1)}
          aria-label="Go to page 1"
          type="button"
        >
          1
        </button>
      );

      // Ellipsis after first page
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className={classes.ellipsis} aria-hidden="true">
            ...
          </span>
        );
      }
    }

    // Page numbers in range
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 || startPage === 1) { // Don't duplicate first page
        pages.push(
          <button
            key={i}
            className={i === safeCurrentPage ? classes.activePage : classes.pageButton}
            onClick={() => onPageChange(i)}
            aria-label={`Go to page ${i}`}
            aria-current={i === safeCurrentPage ? 'page' : undefined}
            type="button"
          >
            {i}
          </button>
        );
      }
    }

    // Last page (if not already included)
    if (endPage < totalPages) {
      // Ellipsis before last page
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className={classes.ellipsis} aria-hidden="true">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          className={safeCurrentPage === totalPages ? classes.activePage : classes.pageButton}
          onClick={() => onPageChange(totalPages)}
          aria-label={`Go to page ${totalPages}`}
          type="button"
        >
          {totalPages}
        </button>
      );
    }

    // Next arrow
    pages.push(
      <button
        key="next"
        className={`${classes.arrowButton} ${classes.nextButton}`}
        onClick={() => onPageChange(Math.min(safeCurrentPage + 1, totalPages))}
        disabled={safeCurrentPage === totalPages}
        aria-label="Next page"
        type="button"
      >
        <IoArrowForwardOutline size={22} />
      </button>
    );

    return pages;
  };

  // Calculate the range of results being displayed
  const startResult = (safeCurrentPage - 1) * limit + 1;
  const endResult = Math.min(safeCurrentPage * limit, totalRecords);

  return (
    <div className={classes.paginationContainer}>
      {showResultsText && (
        <span className={classes.resultsText}>
          Showing {startResult} - {endResult} of {totalRecords} Results
        </span>
      )}
      <div className={classes.paginationButtons} role="navigation" aria-label="Pagination">
        {renderPageNumbers()}
      </div>
    </div>
  );
}
