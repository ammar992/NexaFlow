"use client";
import React, { useId, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import classes from "./Input.module.css";
import clsx from "clsx";

/**
 * Input component for user text, password, or number entry.
 *
 * @param {Object} props
 * @param {string} [props.type="text"] - Input type ("text", "password", "number", etc.).
 * @param {string} [props.label=""] - Main label for the input.
 * @param {string} [props.label2=""] - Sub label for the input.
 * @param {string|number} [props.value=""] - Input value.
 * @param {function} [props.setValue=()=>{}] - Function to update input value.
 * @param {boolean} [props.noBorder=false] - If true, removes border from input.
 * @param {string} [props.placeholder=""] - Placeholder text.
 * @param {boolean} [props.disabled=false] - If true, disables the input.
 * @param {React.CSSProperties} [props.customStyle={}] - Inline style for input container.
 * @param {React.CSSProperties} [props.inputStyle={}] - Inline style for input element.
 * @param {React.CSSProperties} [props.labelStyle={}] - Inline style for label.
 * @param {string} [props.error=""] - Error text to display.
 * @param {React.ReactNode} [props.leftIcon=null] - Icon to display on the left.
 * @param {React.ReactNode} [props.rightIcon=null] - Icon to display on the right.
 * @param {React.Ref} [props.inputRef=null] - Ref for the input element.
 * @param {string} [props.inputClass=""] - Additional class for input element.
 * @param {function} [props.onEnterClick=()=>{}] - Callback for Enter key.
 * @param {string} [props.className=""] - Additional class for container.
 * @param {React.CSSProperties} [props.containerStyles={}] - Inline style for container.
 * @param {string} [props.containerClass=""] - Additional class for input container.
 * @returns {JSX.Element}
 */
export default function Input({
  id,
  type = "text",
  label = "",
  label2 = "", // sub label
  value = "", // input value
  setValue = () => {}, //setValue
  noBorder = false,
  placeholder = "",
  disabled = false,
  customStyle = {}, //Input container inline Style
  inputStyle = {}, //Input inline Style
  labelStyle = {}, //Label inline Style
  error = "", // Error Text
  leftIcon = null, // Icon For Input
  rightIcon = null,
  inputRef = null,
  inputClass = "",
  onEnterClick = () => {},
  className = "",
  containerStyles = {},
  containerClass = "",
  ...props
}) {
  const [show, setShow] = useState(false);
  const inputId = id || useId();

  return (
    <>
      <div
        className={clsx(classes.container, className)}
        style={containerStyles}
      >
        <label
          hidden={!label} // hide label if label is empty
          htmlFor={inputId}
          className={clsx(classes.labelText, disabled && classes.disabled)}
          style={labelStyle}
        >
          {label}

          <span hidden={!label2} className={classes.subLabel}>
            {label2}
          </span>
        </label>

        <div
          className={clsx(classes.inputContainer, containerClass)}
          style={customStyle}
        >
          <div hidden={!leftIcon} className={classes.leftIconBox}>
            {leftIcon}
          </div>

          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            disabled={disabled}
            placeholder={placeholder}
            type={show == true ? "text" : type}
            id={inputId}
            className={clsx(
              inputClass,
              classes.inputClassName,
              noBorder && classes.noBorder
            )}
            style={{ ...inputStyle, ...(leftIcon && { paddingLeft: 36 }) }}
            onKeyDownCapture={(e) => {
              ["Enter", "NumpadEnter"].includes(e.code) &&
                onEnterClick &&
                onEnterClick();
            }}
            onBlur={() => {
              if (
                typeof value === "string" &&
                (type === "text" || type === "") &&
                setValue
              ) {
                setValue(value?.trim());
              }
            }}
            ref={inputRef}
            {...props}
            onKeyDown={(e) => {
              if (type == "number") {
                return (
                  ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                );
              }
            }}
          />
          <div hidden={!rightIcon} className={classes.rightIconBox}>
            {rightIcon}
          </div>
          <FaEyeSlash
            hidden={!show || type !== "password"}
            className={classes.passwordIcon}
            onClick={() => setShow(!show)}
            size={20}
            color="var(--black)"
          />

          <FaEye
            hidden={show || type !== "password"}
            className={classes.passwordIcon}
            onClick={() => setShow(!show)}
            size={20}
            color="var(--black)"
          />
        </div>

        <p hidden={!error} className={classes.error}>
          *{error}
        </p>
      </div>
    </>
  );
}
