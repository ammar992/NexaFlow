import { mediaURL } from "@/resources/utils/helper";
import Image from "next/image";
import React, { useState } from "react";

/**
 * DynamicImage component displays an image with dynamic object-fit based on aspect ratio.
 *
 * @param {Object} props
 * @param {string} props.src - Image source (URL or path).
 * @param {string} [props.alt="Image"] - Alt text for the image.
 * @param {string} [props.containerClass=""] - Additional class for the container.
 * @param {React.CSSProperties} [props.containerStyles={}] - Additional styles for the container.
 * @returns {JSX.Element}
 */
export default function DynamicImage({
  src,
  alt = "Image",
  containerClass = "",
  containerStyles = {},
  ...props
}) {
  const [value, setValue] = useState("contain");
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...containerStyles,
      }}
      className={containerClass}
    >
      <Image
        onLoad={(e) => {
          const width = e.target.naturalWidth;
          const height = e.target.naturalHeight;
          const aspectRatio = height / width;
          if (aspectRatio <= 0.85 || aspectRatio >= 2) {
            setValue("contain");
          } else if (0.85 < aspectRatio <= 1) {
            setValue("fill");
          } else {
            setValue("cover");
          }
        }}
        src={mediaURL(src)}
        alt={alt}
        fill
        style={{ objectFit: value }}
        {...props}
        placeholder="blur"
        blurDataURL="/app-images/image-placeholder.png"
      />
    </div>
  );
}
