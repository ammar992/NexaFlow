"use client";
import React, { memo } from "react";
import classes from "./Button.module.css";
import { Spinner } from "react-bootstrap";
import clsx from "clsx";

/**
 * Button component for various UI actions.
 *
 * @param {Object} props
 * @param {string} [props.label] - Text label for the button.
 * @param {boolean} [props.fullWidth] - Whether the button should take the full width.
 * @param {boolean} [props.rounded] - Whether the button should have rounded corners.
 * @param {React.CSSProperties} [props.buttonStyles={}] - Inline styles for the button.
 * @param {function} [props.onClick=()=>{}] - Click event handler.
 * @param {boolean} [props.disabled=false] - Disable the button.
 * @param {React.ReactNode} [props.children] - Children elements.
 * @param {React.ReactNode} [props.leftIcon=null] - Icon to display on the left.
 * @param {React.ReactNode} [props.rightIcon=null] - Icon to display on the right.
 * @param {string} [props.className=""] - Additional class names.
 * @param {string} [props.variant=""] - Variant for styling.
 * @param {string} [props.type="button"] - Button type.
 * @param {boolean} [props.loading=false] - Loading state.
 * @param {boolean} [props.showSpinner=false] - Show spinner when loading.
 * @param {React.CSSProperties} [props.spinnerStyles={}] - Inline styles for spinner.
 * @returns {JSX.Element}
 */
const Button = ({
  label,
  fullWidth = false,
  rounded = false,
  buttonStyles = {},
  onClick = () => {},
  disabled = false,
  children,
  leftIcon = null,
  rightIcon = null,
  className = "",
  variant = "",
  type = "button",
  loading = false,
  showSpinner = false,
  spinnerStyles = {},
  ...props
}) => {
  return (
    <>
      <button
        type={type}
        style={{
          ...buttonStyles,
          ...(fullWidth && { width: "100%" }),
          ...(rounded && { borderRadius: "50px" }),
        }}
        onClick={onClick}
        disabled={disabled}
        color-variant={variant}
        className={clsx(classes.btn, className)}
        {...props}
      >
        {leftIcon && leftIcon}
        {label && <label>{label}</label>}
        {children && { children }}
        {rightIcon && !(loading && showSpinner) && rightIcon}
        {showSpinner && loading && <Spinner size="sm" style={spinnerStyles} />}
      </button>
    </>
  );
};

export default memo(Button);
