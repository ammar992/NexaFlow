"use client";
import React, { useEffect, useRef, useState } from "react";
import classes from "./DatePicker.module.css";
import DatePickerInput from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import "react-multi-date-picker/styles/colors/purple.css";
import clsx from "clsx";

/**
 * DatePicker component for selecting single or multiple dates.
 *
 * @param {Object} props
 * @param {string} [props.dir="ltr"] - Direction of the container.
 * @param {string} [props.dateFormat="DD/MM/YYYY"] - Date format for the picker.
 * @param {string} [props.label=""] - Main label for the date picker.
 * @param {string} [props.label2=""] - Sub label for the date picker.
 * @param {Date|Date[]|null} [props.value=null] - Selected date value(s).
 * @param {function} [props.setValue=()=>{}] - Function to update date value(s).
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
 * @param {string} [props.variant=""] - Variant for styling.
 * @param {boolean} [props.multi=false] - If true, enables multi-date selection.
 * @param {string|Date} [props.minDate] - Minimum selectable date.
 * @param {string|Date} [props.maxDate] - Maximum selectable date.
 * @param {boolean} [props.portal=false] - If true, renders the date picker in a portal.
 * @param {Object} [props.props] - Additional props to pass to the date picker.
 * @param {string} [props.dateSeparator=" , "] - Separator for multiple dates display.
 * @returns {JSX.Element}
 */
export default function DatePicker({
  dir = "ltr",
  dateFormat = "DD/MM/YYYY",
  label = "",
  label2 = "",
  value = null,
  setValue = () => {},
  placeholder = "",
  disabled = false,
  customStyle = {},
  inputStyle = {},
  labelStyle = {},
  error = "",
  leftIcon = null,
  rightIcon = null,
  inputRef = null,
  inputClassName = "",
  onEnterClick = () => {},
  className = "",
  containerStyles = {},
  containerClass = "",
  variant = "",
  portal = false,
  multi = false,
  minDate,
  maxDate,
  dateSeparator = " , ",
  ...props
}) {
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Handle click outside to close the date picker
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (!datePickerRef.current || !containerRef.current) return;
      if (!isOpen) return;

      const target = event.target;

      // Check if click is inside the container (input field)
      if (containerRef.current.contains(target)) {
        return; // Click is on input, don't close
      }

      // Check if click is on the calendar (rendered in portal)
      // Check all parent elements of the target for rmdp classes
      let element = target;
      let isCalendarClick = false;

      while (
        element &&
        element !== document.body &&
        element !== document &&
        element !== document.documentElement
      ) {
        if (element.classList && element.classList.length > 0) {
          const classList = Array.from(element.classList);
          // Check for calendar classes (exclude input class)
          if (
            classList.some(
              (className) =>
                className.includes("rmdp") && !className.includes("rmdp-input")
            )
          ) {
            isCalendarClick = true;
            break;
          }
        }
        element = element.parentElement;
      }

      // If click is truly outside, close the calendar
      if (!isCalendarClick && datePickerRef.current) {
        // Use setTimeout to allow calendar's click handlers to execute first
        setTimeout(() => {
          if (!datePickerRef.current || !isOpen) return;

          // Try multiple methods to close the calendar
          if (typeof datePickerRef.current.closeCalendar === "function") {
            try {
              datePickerRef.current.closeCalendar();
            } catch (error) {
              console.error("Error closing calendar:", error);
            }
          } else if (typeof datePickerRef.current.close === "function") {
            try {
              datePickerRef.current.close();
            } catch (error) {
              console.error("Error closing calendar:", error);
            }
          }
        }, 0);
      }
    };

    // Use mousedown instead of click to catch the event earlier
    // Attach listener when calendar opens
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      dir={dir}
      className={clsx(classes.container, className)}
      data-variant={variant}
      style={containerStyles}
    >
      <label
        hidden={!label} // hide label if label is empty
        htmlFor={`datepicker-${label}`}
        className={clsx(classes.labelText, disabled && classes.disabled)}
        style={labelStyle}
      >
        {label}
        <span hidden={!label2}>{label2}</span>
      </label>

      <div
        className={clsx(classes.inputContainer, containerClass)}
        style={customStyle}
      >
        <div
          hidden={!leftIcon}
          className={classes.leftIconBox}
          onClick={() => {
            datePickerRef.current?.openCalendar();
          }}
        >
          {leftIcon}
        </div>

        <DatePickerInput
          id={`datepicker-${label}`}
          ref={(ref) => {
            datePickerRef.current = ref;
            if (inputRef) {
              if (typeof inputRef === "function") {
                inputRef(ref);
              } else {
                inputRef.current = ref;
              }
            }
          }}
          plugins={multi ? [<DatePanel key="date-panel" />] : []}
          dateSeparator={dateSeparator}
          multiple={multi}
          value={value}
          onChange={(value) => {
            const newValue = new Date(value);
            setValue(multi ? value : newValue);
          }}
          placeholder={placeholder}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          format={dateFormat}
          inputClass={clsx(classes.inputClass, inputClassName)}
          style={{ ...inputStyle, ...(leftIcon && { paddingLeft: 36 }) }}
          onOpen={() => setIsOpen(true)}
          portal={portal}
          onClose={() => setIsOpen(false)}
          onKeyDownCapture={(e) => {
            ["Enter", "NumpadEnter"].includes(e.code) &&
              onEnterClick &&
              onEnterClick();
          }}
          {...props}
        />
        <div
          hidden={!rightIcon}
          className={classes.rightIconBox}
          onClick={() => {
            datePickerRef.current?.openCalendar();
          }}
        >
          {rightIcon}
        </div>
      </div>

      <p hidden={!error} className={classes.error}>
        *{error}
      </p>
    </div>
  );
}
