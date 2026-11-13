"use client";
import { useEffect } from "react";
import PropTypes from "prop-types";

export default function ScrollToError({ formik }) {
  const submitting = formik?.isSubmitting;

  useEffect(() => {
    if (formik?.errors && submitting) {
      const firstErrorKey = Object.keys(formik.errors)[0];
      if (firstErrorKey) {
        // Find the corresponding input element by its name attribute
        const firstErrorElement = document.querySelector(
          `[name="${firstErrorKey}"]`,
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          firstErrorElement.focus(); // Optionally focus on the element
        }
      }
    }
  }, [formik, submitting]);

  return null; // This component doesn't render anything visually
}

ScrollToError.propTypes = {
  formik: PropTypes.object.isRequired,
};
