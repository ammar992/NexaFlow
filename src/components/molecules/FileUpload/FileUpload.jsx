"use client";
import React, { useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";
import classes from "./FileUpload.module.css";

/**
 * FileUpload component for uploading files via drag-and-drop or file picker.
 *
 * @param {Object} props
 * @param {File|File[]} props.value - Single file (when single=true) or array of files (when single=false).
 * @param {Function} props.setValue - Function to update file(s). Receives single file or array based on single prop.
 * @param {React.RefObject} [props.fileInputRef] - Optional ref for file input.
 * @param {string} [props.error] - Error message to display.
 * @param {string} [props.label] - Label for the upload area.
 * @param {boolean} [props.single=false] - If true, only one file can be uploaded and value will be a single File object.
 * @param {boolean} [props.disabled=false] - If true, disables upload.
 * @param {boolean} [props.readonly=false] - If true, makes upload read-only.
 * @param {number} [props.maxFiles=5] - Maximum number of files allowed (only applies when single=false).
 * @param {Function} [props.onRemove=null] - Callback for removing files.
 * @param {boolean} [props.showOpen=true] - If true, shows "Open" button for uploaded files.
 * @param {string} [props.accept="*"] - File types accepted. Use "*" for any file type, or a comma-separated list (e.g. "image/\*,application/pdf").
 *
 * @example
 * // Single file mode
 * <FileUpload
 *   single
 *   value={file}
 *   setValue={setFile}
 *   accept="image/*"
 * />
 *
 * // Multiple files mode
 * <FileUpload
 *   value={files}
 *   setValue={setFiles}
 *   accept="image/*,application/pdf"
 * />
 */
export default function FileUpload({
  value,
  setValue = () => {},
  fileInputRef = null,
  error = "",
  label = "",
  single = false,
  disabled = false,
  readonly = false,
  maxFiles = 5,
  onRemove = null,
  showOpen = true,
  accept = "*",
}) {
  // Use internal ref if not provided
  const internalFileInputRef = useRef();
  const inputRef = fileInputRef || internalFileInputRef;
  const [dragActive, setDragActive] = useState(false);

  // Convert value to internal array format for consistent handling
  const internalFiles = single ? (value ? [value] : []) : value || [];

  const handleFileChange = (e) => {
    if (disabled || readonly) return;
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles?.length > 0) {
      if (single) {
        setValue(selectedFiles[0]);
      } else {
        const availableSlots = maxFiles - internalFiles.length;
        const filesToAdd = selectedFiles.slice(0, availableSlots);
        setValue([...internalFiles, ...filesToAdd]);
      }
    }
    inputRef.current.value = null;
  };

  const handleDrop = (e) => {
    if (disabled || readonly) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const filesArray = Array.from(droppedFiles);

      if (single) {
        setValue(filesArray[0]);
      } else {
        const availableSlots = maxFiles - internalFiles.length;
        const filesToAdd = filesArray.slice(0, availableSlots);
        setValue([...internalFiles, ...filesToAdd]);
      }
      inputRef.current.value = null;
    }
  };

  const handleDragOver = (e) => {
    if (disabled || readonly) return;
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) {
      setDragActive(true);
    }
  };

  const handleDragEnter = (e) => {
    if (disabled || readonly) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    if (disabled || readonly) return;
    e.preventDefault();
    e.stopPropagation();
    // Only set dragActive to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  };

  // Disable upload if maxFiles reached (for multi mode)
  const reachedMaxFiles = !single && internalFiles.length >= maxFiles;

  const handleClickUpload = () => {
    if (disabled || readonly || reachedMaxFiles) return;
    inputRef.current && inputRef.current.click();
  };

  const handleRemoveFile = (idx) => {
    if (disabled || readonly) return;
    if (single) {
      onRemove ? onRemove(internalFiles[0]) : setValue(null);
    } else {
      const newFiles = internalFiles.filter((_, i) => i !== idx);
      onRemove ? onRemove(internalFiles, idx) : setValue(newFiles);
    }
  };

  return (
    <div className={classes.uploadContainer}>
      <p hidden={!label} className={classes.label}>
        {label}
      </p>
      <div className={classes.main}>
        <div
          className={`${classes.dragAndDropContainer} ${
            dragActive ? classes.dragActive : ""
          } ${disabled ? classes.disabled : ""} ${
            reachedMaxFiles ? classes.disabled : ""
          }`}
          onClick={handleClickUpload}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            cursor:
              disabled || reachedMaxFiles
                ? "not-allowed"
                : readonly
                ? "default"
                : "pointer",
            opacity: disabled || reachedMaxFiles ? 0.6 : 1,
          }}
        >
          {single && internalFiles.length > 0 ? (
            <div className={classes.imagePreviewWrapper}>
              {internalFiles[0]?.type?.startsWith("image/") ? (
                <img
                  src={
                    internalFiles[0]
                      ? URL.createObjectURL(internalFiles[0])
                      : ""
                  }
                  alt="Uploaded"
                  className={classes.previewImage}
                />
              ) : (
                <div
                  className={`${classes.fileInfo} ${classes.previewFileInfo}`}
                >
                  <span className={classes.previewFileName}>
                    {internalFiles[0]?.name}
                  </span>
                  <span className={classes.previewFileSize}>
                    {(internalFiles[0]?.size / 1024)?.toFixed(2)} KB
                  </span>
                </div>
              )}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  hidden={!showOpen}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (internalFiles[0]) {
                      const url = URL.createObjectURL(internalFiles[0]);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = internalFiles[0].name || "download";
                      a.target = "_blank";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  }}
                  disabled={disabled}
                  className={classes.openFileButton}
                >
                  Open
                </button>
                <button
                  hidden={readonly || disabled}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(0);
                  }}
                  className={classes.removeFileButton}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className={classes.dragAndDropMessage}>
              <BiUpload color="var(--primary)" size={43} />
              <p>Upload your files here</p>
              <p>Browse</p>
            </div>
          )}

          <input
            type="file"
            hidden
            multiple={!single}
            ref={inputRef}
            onChange={handleFileChange}
            disabled={disabled || readonly || reachedMaxFiles}
            readOnly={readonly}
            accept={accept === "*" ? undefined : accept}
          />
        </div>
      </div>
      {!single && internalFiles.length > 0 && (
        <div className={classes.filePreview}>
          {internalFiles.map((file, idx) => (
            <div key={idx} className={classes.fileItem} data-single={single}>
              {file?.type?.startsWith("image/") ? (
                <img
                  src={file ? URL.createObjectURL(file) : ""}
                  alt={file?.name}
                  className={classes.previewImage}
                />
              ) : (
                <div className={classes.previewFileInfo}>
                  <span className={classes.previewFileName}>{file?.name}</span>
                  <span className={classes.previewFileSize}>
                    {(file?.size / 1024)?.toFixed(2)} KB
                  </span>
                </div>
              )}
              <div className={classes.btnWrapper}>
                <button
                  hidden={!showOpen}
                  type="button"
                  onClick={() => {
                    if (file) {
                      const url = URL.createObjectURL(file);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = file.name || "download";
                      a.target = "_blank";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className={classes.openFileButton}
                  disabled={disabled}
                >
                  Open
                </button>
                <button
                  hidden={readonly || disabled}
                  type="button"
                  onClick={(e) => {
                    handleRemoveFile(idx);
                  }}
                  className={classes.removeFileButton}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p hidden={!reachedMaxFiles} className={classes.error}>
        Maximum {maxFiles} files allowed.
      </p>

      <p hidden={!error} className={classes.error}>
        *{error}
      </p>
    </div>
  );
}
