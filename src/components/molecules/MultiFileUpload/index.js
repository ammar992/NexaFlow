"use client";

import LottieLoader from "@/components/atoms/LottieLoader/LottieLoader";
import RenderToast from "@/components/atoms/RenderToast";
import useAxios from "@/interceptor/axios-functions";
import { mediaURL } from "@/resources/utils/helper";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaFileAudio, FaFileContract } from "react-icons/fa";
import { IoArrowUpCircleOutline, IoCloseOutline } from "react-icons/io5";
import classes from "./MultiFileUpload.module.css";
import {
  getMediaType,
  getSupportedImageTypes,
} from "@/resources/utils/mediaUpload";
import clsx from "clsx";

const MultiFileUpload = ({
  label,
  uploadText = "an Image",
  files,
  setFiles,
  errorText,
  className,
  extraStyles = {},
  acceptedFiles = getSupportedImageTypes(["all"]),
  maxFileCount = 5,
  loading = false,
  hideDeleteIcon = false,
  disabled = false,
  itemType,
  containerClass,
  onDelete,
}) => {
  const { Patch } = useAxios();
  let isSingleFileUpload = maxFileCount === 1;
  const [isDeleteApiCalling, setIsDeleteApiCalling] = useState(false);
  let containerStyleObject = {
    ...(errorText && { border: "1px solid red" }),
    ...extraStyles,
  };

  // onDrop
  const onDrop = (_acceptedFiles) => {
    // validate
    if (_acceptedFiles.length > maxFileCount) {
      return RenderToast({
        message: `You can upload maximum ${maxFileCount} file${
          maxFileCount > 1 ? "s" : ""
        } at a time`,
        type: "error",
      });
    }

    setFiles([...files, ..._acceptedFiles], true);
  };

  // removeFile
  const removeFile = async (key) => {
    if (typeof key === "object") {
      setFiles(
        files.filter((file) => file.name !== key.name),
        false
      );
    } else {
      setIsDeleteApiCalling(true);
      const { response } = await Patch({
        route: "media/delete",
        data: {
          key,
          ...(itemType && { itemType }),
        },
      });
      if (response) {
        let updatedFiles = files.filter((file) => file?.key !== key);
        setFiles(updatedFiles, false);
        RenderToast({
          message: "File deleted successfully",
          type: "success",
        });
      }
      setIsDeleteApiCalling(false);
    }
  };

  const renderFileComponent = (file) => {
    const isLocalFile = file?.name ? true : false;
    const fileType = getMediaType(
      isLocalFile ? file?.type : file?.key?.split(".").pop()
    );

    let iconComponent = ["images", "photo"].includes(fileType) ? (
      <div className={classes?.imageContainer}>
        <img
          src={isLocalFile ? URL.createObjectURL(file) : mediaURL(file?.key)}
          alt={file?.name || file?.fileName || "Image"}
        />
      </div>
    ) : fileType === "docs" ? (
      <FaFileContract
        title="View File"
        size={35}
        className={classes.file}
        onClick={() =>
          window.open(
            isLocalFile ? URL.createObjectURL(file) : mediaURL(file?.key),
            "_blank"
          )
        }
      />
    ) : fileType === "audio" ? (
      <FaFileAudio title="View Audio" size={35} className={classes.file} />
    ) : undefined;

    return (
      <div className={classes.filePreview}>
        {iconComponent}
        {isSingleFileUpload && !hideDeleteIcon && (
          <div
            className={clsx(classes?.removeFile, disabled && classes.disabled)}
            onClick={() => {
              disabled
                ? null
                : onDelete
                ? onDelete(file?.key)
                : removeFile(file?.key);
            }}
          >
            <IoCloseOutline className={classes.deleteDiv} />
          </div>
        )}
      </div>
    );
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: disabled ? () => {} : onDrop,
    accept: acceptedFiles,
    multiple: Object.keys(acceptedFiles)?.includes("text/csv") ? false : true,
    maxFiles: maxFileCount,
    disabled: disabled,
    onDropRejected: (files) => {
      if (files?.length > maxFileCount) {
        return RenderToast({
          message: `You can upload maximum ${maxFileCount} file${
            maxFileCount > 1 ? "s" : ""
          } at a time`,
          type: "error",
        });
      }
    },
  });

  return (
    <div>
      <div className={clsx(classes.mainDiv, containerClass)}>
        {label && <p className={`fs-13 ${classes.labelStyle}`}>{label}</p>}
        <div
          className={clsx(classes.fileInputDiv, className)}
          style={{
            ...(containerStyleObject && { ...containerStyleObject }),
          }}
        >
          <div className={classes.inputContainer} {...getRootProps()}>
            <input
              className={classes.input}
              {...getInputProps()}
              disabled={disabled}
            />

            <div className={classes.fileDesc}>
              <IoArrowUpCircleOutline className={classes.icon} />
              <p className={classes.desc}>Upload {uploadText}</p>
            </div>
          </div>
        </div>

        {(isDeleteApiCalling || loading) && <LottieLoader />}
      </div>
      {errorText && <p className={`errorText`}>{errorText}</p>}
      {files?.length > 0 && (
        <div className={classes.filePreviewList}>
          {files?.map((file, index) => (
            <div
              key={`${index}-multi-file-upload-file-item`}
              className={classes.fileItem}
            >
              <span
                className={clsx(
                  classes.removeFile,
                  disabled && classes.disabled
                )}
                onClick={() => {
                  disabled
                    ? null
                    : onDelete
                    ? onDelete(file?.key)
                    : removeFile(file?.key);
                }}
              >
                <IoCloseOutline className={classes.deleteDiv} />
              </span>
              {renderFileComponent(file)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;
