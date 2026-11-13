"use client";
import React from "react";
import classes from "./LoadingSkeleton.module.css";
import clsx from "clsx";

/**
 * LoadingSkeleton displays a skeleton placeholder for loading content.
 *
 * @param {Object} props
 * @param {React.CSSProperties} [props.style={}] - Inline style for the skeleton container.
 * @param {string} [props.className=""] - Additional class for the skeleton.
 * @param {string|number} [props.height="50px"] - Minimum height for the skeleton.
 * @returns {JSX.Element}
 */
export default function LoadingSkeleton({
  style = {},
  className = "",
  height = "50px",
}) {
  return (
    <div
      style={{ ...style, minHeight: height }}
      className={clsx(classes.main, className)}
    />
  );
}
