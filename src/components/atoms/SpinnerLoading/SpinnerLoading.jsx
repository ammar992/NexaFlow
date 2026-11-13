import React from "react";
import classes from "./SpinnerLoading.module.css";
import clsx from "clsx";

/**
 * SpinnerLoading component
 * @param {Object} param - Component props
 * @param {string} param.className - Additional class names
 * @param {React.CSSProperties} param.style - Inline styles
 * @returns {JSX.Element}
 */
export default function SpinnerLoading({ className, style }) {
  return (
    <div className={clsx(classes.spinnerContainer, className)} style={style}>
      <svg viewBox="25 25 50 50" className={classes.spinner}>
        <circle cx="50" cy="50" r="20" className={classes.spinnerCircle} />
      </svg>
    </div>
  );
}
