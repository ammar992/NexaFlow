"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import styles from "./Modal.module.css";

const Modal = ({
  show = false,
  setShow,
  onClose,
  children,
  title,
  size = "medium",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
  overlayClassName = "",
  contentClassName = "",
  headerClassName = "",
  bodyClassName = "",
  footer,
  showHeader = true,
  showFooter = false,
  centered = true,
  scrollable = true,
  animation = "fade",
  ...props
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle close
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (setShow) {
      setShow(false);
    }
  }, [onClose, setShow]);

  // Handle escape key
  const handleEscape = useCallback(
    (event) => {
      if (closeOnEscape && event.key === "Escape") {
        handleClose();
      }
    },
    [closeOnEscape, handleClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event) => {
      if (closeOnOverlayClick && event.target === modalRef.current) {
        handleClose();
      }
    },
    [closeOnOverlayClick, handleClose]
  );

  // Focus management
  useEffect(() => {
    if (show) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [show]);

  // Event listeners
  useEffect(() => {
    if (show) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [show, handleEscape]);

  // Don't render if not open
  if (!show) return null;

  const modalContent = (
    <div
      ref={modalRef}
      className={`${styles.overlay} ${overlayClassName} ${
        animation === "fade" ? styles.fadeIn : ""
      }`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      tabIndex={-1}
    >
      <div
        className={`${styles.modal} ${styles[size]} ${className} ${
          animation === "slide" ? styles.slideIn : ""
        }`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {showHeader && (
          <div className={`${styles.header} ${headerClassName}`}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close modal"
              >
                <IoClose size={24} />
              </button>
            )}
          </div>
        )}

        <div
          className={`${styles.body} ${bodyClassName} ${
            scrollable ? styles.scrollable : ""
          }`}
        >
          {children}
        </div>

        {showFooter && footer && (
          <div className={`${styles.footer} ${contentClassName}`}>{footer}</div>
        )}
      </div>
    </div>
  );

  // Render in portal
  return createPortal(modalContent, document.body);
};

export default Modal;
