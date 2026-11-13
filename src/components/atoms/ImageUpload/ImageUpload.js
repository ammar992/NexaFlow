"use client";
import { imageUrl } from "@/resources/utils/helper";
import Image from "next/image";
import { useRef } from "react";
import { Spinner } from "react-bootstrap";
import { FaUpload } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import classes from "./ImageUpload.module.css";
import clsx from "clsx";

/**
 * ImageUpload component for uploading and displaying an image.
 *
 * @param {Object} props
 * @param {File|string|null} [props.image=null] - The image file or URL to display.
 * @param {function} [props.setImage=() => {}] - Function to update the image value.
 * @param {string} [props.label=""] - Label text for the upload field.
 * @param {string} [props.error=""] - Error message to display.
 * @param {string} [props.accept="image/*"] - Accepted file types for upload.
 * @param {boolean} [props.rounded=false] - If true, applies rounded styling to the image.
 * @param {boolean} [props.loading=false] - Loading state to show a spinner.
 * @param {boolean} [props.readOnly=false] - If true, disables image upload functionality.
 * @param {string} [props.containerClass=""] - Additional CSS class for the container.
 * @returns {JSX.Element}
 */
export default function ImageUpload({
  image = null,
  setImage = () => {},
  label = "",
  error = "",
  containerClass = "",
  accept = "image/*",
  loading = false,
  readOnly = false,
  rounded = false,
}) {
  const refProp = useRef(null);

  const handleImageUpload = (e) => {
    if (readOnly) return;
    const file = e.target.files[0];
    if (file) {
      setImage(file); // set file object directly
    }
    refProp.current.value = null;
  };

  const handleRemoveImage = () => {
    setImage("");
    refProp.current.value = null;
  };

  const getImageSrc = (img) => {
    if (typeof img === "string") {
      return imageUrl(img);
    }
    return URL.createObjectURL(img);
  };

  return (
    <div className={clsx(classes.container, containerClass)}>
      <p className={classes.labelText}>{label}</p>
      <div className={clsx(classes.mainDiv, rounded ? classes.round : "")}>
        {loading && (
          <div className={classes.spinnerContainer}>
            <Spinner className={classes.spinner} />
          </div>
        )}
        {image ? (
          <Image
            src={getImageSrc(image)}
            alt="image"
            fill
            className={classes.image}
          />
        ) : (
          <div
            className={clsx(classes.upload, "pointer")}
            onClick={() => refProp.current.click()}
          >
            <FaUpload size={32} />
          </div>
        )}
        {image && !readOnly && !loading && (
          <div className={classes.btnDiv}>
            <IoCloseCircle
              className="pointer"
              size={36}
              onClick={handleRemoveImage}
              color="var(--error-v1)"
            />
          </div>
        )}
      </div>
      <input
        ref={refProp}
        type="file"
        style={{ display: "none" }}
        disabled={readOnly}
        accept={accept}
        onChange={handleImageUpload}
      />
      {error && <p className={`${classes.error}`}>*{error}</p>}
    </div>
  );
}
