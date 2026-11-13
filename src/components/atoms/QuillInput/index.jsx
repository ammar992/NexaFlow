import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import classes from "./QuillInput.module.css";

function QuillInput({
  value,
  setValue,
  quillClass = "",
  placeholder = "",
  label,
  disabled = false,
  ...rest
}) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div className={classes.container}>
      {label && (
        <label
          className={`${classes.label} ${disabled ? classes.disabled : ""}`}
        >
          {label}
        </label>
      )}
      <div
        className={`${classes.quillInput} ${disabled ? classes.disabled : ""}`}
      >
        <ReactQuill
          className={`${classes.quill} ${quillClass}`}
          placeholder={placeholder}
          modules={modules}
          value={value}
          onChange={(e) => setValue(e)}
          readOnly={disabled}
          {...rest}
        />
      </div>
    </div>
  );
}

export default QuillInput;
