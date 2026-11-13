"use client";
import Select from "react-select";
import classes from "./DropDown.module.css";
import clsx from "clsx";

/**
 * DropDown component using react-select library.
 *
 * @param {Object} props
 * @param {string} [props.label=""] - Label for the dropdown.
 * @param {string} [props.label2=""] - Sub label for the dropdown.
 * @param {Object|Object[]|null} [props.value=null] - Selected value(s).
 * @param {function} [props.setValue=()=>{}] - Function to update value(s).
 * @param {Array} [props.options=[]] - Array of options {label, value}.
 * @param {boolean} [props.multi=false] - If true, enables multi-select.
 * @param {boolean} [props.isSearchable=true] - If true, enables search.
 * @param {boolean} [props.isClearable=false] - If true, shows clear button.
 * @param {boolean} [props.disabled=false] - If true, disables the dropdown.
 * @param {boolean} [props.isLoading=false] - If true, shows loading state.
 * @param {string} [props.placeholder="Select..."] - Placeholder text.
 * @param {string} [props.error=""] - Error text to display.
 * @param {React.CSSProperties} [props.labelStyle={}] - Inline style for label.
 * @param {React.CSSProperties} [props.containerStyles={}] - Inline style for container.
 * @param {string} [props.className=""] - Additional class for container.
 * @param {string} [props.labelClassName=""] - Additional class for label.
 * @param {function} [props.onMenuOpen] - Callback when menu opens.
 * @param {function} [props.onMenuClose] - Callback when menu closes.
 * @returns {JSX.Element}
 */
export default function DropDown({
  label = "",
  label2 = "",
  value = null,
  setValue = () => {},
  options = [],
  multi = false,
  isSearchable = true,
  isClearable = false,
  disabled = false,
  isLoading = false,
  placeholder = "Select...",
  error = "",
  labelStyle = {},
  containerStyles = {},
  className = "",
  labelClassName = "",
  onMenuOpen,
  onMenuClose,
  isPortal = false,
  ...props
}) {
  const handleChange = (selectedOption) => {
    setValue(selectedOption);
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "6px",
      borderColor: state.isFocused ? "var(--primary)" : "var(--border)",
      boxShadow: state.isFocused ? "0 0 0 1px var(--primary)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "var(--primary)" : "var(--border)",
      },
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: disabled ? "rgba(220, 220, 220, 0.348)" : "var(--white)",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 16px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: "var(--black)",
      fontFamily: "var(--font-inter)",
      fontSize: "14px",
      fontWeight: 500,
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--gray-v1)",
      fontSize: "14px",
      fontFamily: "var(--font-inter)",
      fontWeight: 500,
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--black)",
      fontSize: "14px",
      fontFamily: "var(--font-inter)",
      fontWeight: 500,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--primary)",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--white)",
      fontFamily: "var(--font-inter)",
      fontSize: "14px",
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--white)",
      "&:hover": {
        backgroundColor: "var(--primary)",
        color: "var(--white)",
        cursor: "pointer",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "6px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--primary)"
        : state.isFocused
        ? "rgba(0, 116, 217, 0.1)"
        : "transparent",
      color: state.isSelected ? "var(--white)" : "var(--black)",
      cursor: "pointer",
      fontFamily: "var(--font-inter)",
      fontSize: "14px",
      fontWeight: 500,
      "&:active": {
        backgroundColor: "var(--primary)",
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "var(--gray-v1)",
      fontFamily: "var(--font-inter)",
      fontSize: "14px",
    }),
    loadingMessage: (base) => ({
      ...base,
      color: "var(--gray-v1)",
      fontFamily: "var(--font-inter)",
      fontSize: "14px",
    }),
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
      {label && (
        <label
          className={clsx(
            classes.labelText,
            disabled && classes.disabled,
            labelClassName
          )}
          style={labelStyle}
        >
          {label} {label2 && label2}
        </label>
      )}

      <Select
        value={value}
        onChange={handleChange}
        options={options}
        isMulti={multi}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={disabled}
        isLoading={isLoading}
        placeholder={placeholder}
        styles={customStyles}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        menuPortalTarget={
          isPortal
            ? typeof document !== "undefined"
              ? document.body
              : null
            : null
        }
        noOptionsMessage={() => "No options found"}
        loadingMessage={() => "Loading..."}
        classNamePrefix="react-select"
        {...props}
      />

      {error && <p className={classes.error}>*{error}</p>}
    </div>
  );
}
