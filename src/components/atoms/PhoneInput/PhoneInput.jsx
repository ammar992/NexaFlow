"use client";

import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { useState } from "react";
import ReactPhoneInput from "react-phone-input-2";
import classes from "./PhoneInput.module.css";
import "react-phone-input-2/lib/bootstrap.css";
import clsx from "clsx";

/**
 * PhoneInput component for phone number input with country selector.
 *
 * @param {Object} props
 * @param {string} [props.label=""] - Main label for the input.
 * @param {string} [props.label2=""] - Sub label for the input.
 * @param {string|Object} [props.value=""] - Input value (international format string or object with callingCode and phoneNumber).
 * @param {function} [props.setValue=()=>{}] - Function to update input value.
 * @param {boolean} [props.disabled=false] - If true, disables the input.
 * @param {React.CSSProperties} [props.customStyle={}] - Inline style for input container.
 * @param {React.CSSProperties} [props.labelStyle={}] - Inline style for label.
 * @param {string} [props.error=""] - Error text to display.
 * @param {string} [props.className=""] - Additional class for container.
 * @param {React.CSSProperties} [props.containerStyles={}] - Inline style for container.
 * @param {string} [props.containerClass=""] - Additional class for input container.
 * @param {string} [props.defaultCountry="us"] - Default country code.
 * @param {boolean} [props.showDropdown=false] - If true, shows country dropdown.
 * @param {boolean} [props.required=false] - If true, displays required indicator.
 * @returns {JSX.Element}
 */
export default function PhoneInput({
  label = "",
  label2 = "",
  value = "",
  setValue = () => {},
  customStyle = {},
  labelStyle = {},
  error = "",
  className = "",
  containerStyles = {},
  containerClass = "",
  defaultCountry = "us",
  showDropdown = false,
  required = false,
  disabled = false,
  ...props
}) {
  const [internalError, setInternalError] = useState("");
  const showError = error || internalError;

  // Convert value to string format expected by react-phone-input-2
  // react-phone-input-2 expects international format string or empty string
  const getPhoneValue = () => {
    if (!value) return "";
    // If value is a string, return it (should be in international format or empty)
    if (typeof value === "string") {
      return value;
    }
    // If value is an object, try to construct the phone number
    if (typeof value === "object" && value !== null) {
      if (value.phoneNumber) {
        const callingCode = value.callingCode || "";
        const phoneNumber = value.phoneNumber || "";
        return callingCode && phoneNumber
          ? `+${callingCode}${phoneNumber}`
          : "";
      }
    }
    return "";
  };

  const handlePhoneChange = (phone) => {
    // Ensure phone is a string
    const phoneString = typeof phone === "string" ? phone : String(phone || "");
    const phoneNumberObj = parsePhoneNumberFromString(`+${phoneString}`);

    if (phoneNumberObj !== undefined && phoneNumberObj?.country) {
      const isValid = isValidPhoneNumber(
        phoneNumberObj.nationalNumber,
        phoneNumberObj?.country
      );
      setValue({
        callingCode: phoneNumberObj.countryCallingCode,
        phoneNumber: phoneNumberObj.nationalNumber,
        isValid: isValid,
      });
      if (!isValid) {
        setInternalError("Invalid phone number");
      } else {
        setInternalError("");
      }
    } else {
      setInternalError("");
      // Still update value even if parsing fails
      if (phoneString) {
        // Try to extract calling code from the phone string
        const match = phoneString.match(/^(\d{1,4})(.+)$/);
        if (match) {
          setValue({
            callingCode: match[1],
            phoneNumber: match[2],
          });
        }
      }
    }
  };

  return (
    <div
      className={clsx(
        classes.container,
        className,
        disabled && classes.disabled
      )}
      style={containerStyles}
    >
      <label
        hidden={!label} // hide label if label is empty
        htmlFor={`phoneInput${label}`}
        className={clsx(classes.labelText)}
        style={labelStyle}
      >
        {label}
        <span
          hidden={!label2} // hide label2 if label2 is empty
          className={classes.label2}
        >
          {label2}
        </span>
        <span
          hidden={!required} // show asterisk if required is true
          className={classes.required}
        >
          *
        </span>
      </label>
      <ReactPhoneInput
        country={defaultCountry}
        value={getPhoneValue()}
        onChange={handlePhoneChange}
        containerClass={clsx(classes.inputContainer, containerClass)}
        disabled={disabled}
        specialLabel=""
        countryCodeEditable={false}
        showDropdown={showDropdown}
        {...props}
      />
      <p
        hidden={!showError} // hide error if showError is false
        className={classes.error}
      >
        *{showError}
      </p>
    </div>
  );
}
