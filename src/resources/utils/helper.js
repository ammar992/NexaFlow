import React from "react";
import config from "@/config";
import { formRegEx, formRegExReplacer } from "./regex";
import { lookup } from "mime-types";

// Formatters
/**
 * @typedef {Object} FormatPriceParams
 * @property {number} [amount]
 * @property {boolean} [showSign=false]
 * @property {string} [currency="THB"] - ISO 4217 currency code
 * @property {"en-US" | "th-TH" | "ja-JP" | "ko-KR" | "zh-CN" | "zh-TW"} [locale="th-TH"]
 * @property {"standard" | "compact"} [notation="standard"]
 */

/**
 * @param {FormatPriceParams} params
 * @returns {string}
 */
export const getFormattedPrice = ({
  amount,
  showSign = false,
  currency = "USD",
  locale = "en-US",
  notation = "standard",
} = {}) => {
  const formatterOptions = {
    style: "currency",
    currency,
    notation,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...(showSign && { signDisplay: "always" }),
  };

  const formatter = new Intl.NumberFormat(locale, formatterOptions);

  // Get symbol once
  const symbol =
    formatter.formatToParts(1).find((x) => x.type === "currency")?.value ??
    currency;

  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return symbol;
  }

  return formatter.format(amount);
};

export const capitalizeEachWord = (str) => {
  return str?.replace(/\w\S*/g, (w) =>
    w.replace(/^\w/, (c) => c.toUpperCase())
  );
};

// API/URL Helpers
/**
 * Sets query parameters in the URL without reloading the page.
 * @param {Object} params - The query parameters to set.
 * @returns {void}
 * @example
 * setParamsWithoutReload({ category: "123", subcategory: "456" });
 */
export const setParamsWithoutReload = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  window.history.pushState(null, "", `?${queryParams}`);
};

export const baseURL = (link) => `${config.apiBaseUrl}/api/v1/${link}`;

export const mediaURL = (url, defaultUrl = null) => {
  if (!url) return defaultUrl || "/app-images/default-fallback-image.png";

  if (url.startsWith("/")) return url;

  const match = url.match(/\/d\/([^/]+)\//); // Remove this, Just for showing the image from google drive
  if (!(!match || match.length < 2)) {
    // Remove this
    const fileId = match[1]; // Remove this
    return `https://drive.google.com/uc?export=view&id=${fileId}`; // Remove this
  } // Remove this

  const result = url.indexOf("http");

  const imageRenderUrl = result === -1 ? `${config.awsBaseUrl}/${url}` : url;

  return imageRenderUrl;
};

export const createFormData = (data) => {
  const formData = new FormData();
  for (let key in data) {
    if (Array.isArray(data[key])) {
      for (let d in data[key]) {
        if (typeof data[key][d] == "string") {
          formData.append(key, data[key][d]);
        } else if (
          data[key][d] instanceof File ||
          data[key][d] instanceof Date
        ) {
          formData.append(key, data[key][d]);
        } else {
          formData.append(key, JSON.stringify(data[key][d]));
        }
      }
    } else if (typeof data[key] == "object") {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, JSON.stringify(data[key]));
      }
    } else {
      formData.append(key, data[key]);
    }
  }

  return formData;
};

export const apiHeader = (token, isFormData) => {
  if (token && !isFormData) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }

  if (token && isFormData) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
  }
  if (!token && !isFormData) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  if (!token && isFormData) {
    return {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
  }
};

// Media Helpers
/**
 * Fetches a file from a given key (URL or path) and converts it into a File object.
 * Optionally sets a React/Formik value or callback with the file.
 *
 * @async
 * @function getFileFromKey
 * @param {Object} params - The parameters object.
 * @param {string} params.key - The file key or URL path (e.g., "images/photo.png").
 * @param {string} [params.fileName="file"] - The desired file name (without extension).
 * @param {Function} [params.setValue=() => {}] - A callback function that receives the created File object.
 * @param {BlobType} [params.blobType="application/octet-stream"] - The MIME type of the file.
 * @returns {Promise<File|undefined>} A Promise that resolves to the created File, or undefined if key is missing.
 *
 * @typedef {(
 *   // 🖼️ Images
 *   "image/jpeg" |
 *   "image/png" |
 *   "image/gif" |
 *   "image/webp" |
 *   "image/svg+xml" |
 *   "image/bmp" |
 *
 *   // 📄 Documents
 *   "application/pdf" |
 *   "application/vnd.openxmlformats-officedocument.wordprocessingml.document" |
 *   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" |
 *   "application/vnd.openxmlformats-officedocument.presentationml.presentation" |
 *   "text/plain" |
 *   "text/html" |
 *   "application/json" |
 *   "application/xml" |
 *   "text/csv" |
 *
 *   // 🎧 Audio
 *   "audio/mpeg" |
 *   "audio/wav" |
 *   "audio/ogg" |
 *   "audio/aac" |
 *
 *   // 🎬 Video
 *   "video/mp4" |
 *   "video/webm" |
 *   "video/ogg" |
 *   "video/quicktime" |
 *
 *   // 💾 Archives / Other
 *   "application/zip" |
 *   "application/gzip" |
 *   "application/x-tar" |
 *   "application/octet-stream"
 * )} BlobType - The MIME type representing the file's format.
 *
 * @example
 * // Example: Fetch and create a PDF file
 * const file = await getFileFromKey({
 *   key: "reports/summary.pdf",
 *   fileName: "Summary_Report",
 *   blobType: "application/pdf",
 *   setValue: (file) => console.log("Created file:", file),
 * });
 */
export async function getFileFromKey({
  key,
  fileName = "file",
  blobType = "application/pdf",
  setValue = () => {},
}) {
  if (key) {
    const fileType = key.split(".").pop();
    const response = await fetch(imageUrl(key));
    const blob = await response.blob();
    const file = new File([blob], `${fileName}.${fileType}`, {
      type: lookup(fileType) || blobType || blob.type,
    });
    setValue(file);
    return file;
  }
}

export const uploadImages = async (images, token) => {
  if (!images.length) return null;
  const formData = new FormData();
  images.forEach((image) => {
    formData.append("photos", image);
  });

  const res = await Post(
    baseURL("media/upload"),
    formData,
    apiHeader(token, true)
  );

  if (res) {
    return res.data?.data?.photos?.map((item) => item?.key);
  }
  return null;
};

export const uploadImagesHelper = async ({
  images,
  setIsLoading,
  setImages,
  token,
}) => {
  if (images.length === 0) return;
  setIsLoading(true);
  uploadImages(images, token)
    .then((res) => {
      if (res) {
        setImages((prev) => [...prev, ...res]);
      }
      setIsLoading(false);
    })
    .finally(() => {
      setIsLoading(false);
    });
};

export const deleteMedia = async ({
  slug,
  key,
  setIsLoading,
  token,
  setImages,
  entity,
}) => {
  const url = baseURL("media/delete");
  const params = { slug: slug, key, type: "image", entity };
  setIsLoading(true);
  const res = await Patch(url, params, apiHeader(token));
  if (res) {
    setImages((prev) => prev.filter((item) => item !== key));
  }
  setIsLoading(false);
};

// Browser Helpers
export const getUniqueBrowserId = () => {
  const uniqueBrowserId = localStorage?.getItem("uniqueBrowserId");
  if (uniqueBrowserId) {
    return uniqueBrowserId;
  }

  if (window.navigator) {
    var navigator_info = window.navigator;
    var screen_info = window.screen;
    var uid = navigator_info.mimeTypes.length;
    uid += navigator_info.userAgent.replace(/\D+/g, "");
    uid += navigator_info.plugins.length;
    uid += screen_info.height || "";
    uid += screen_info.width || "";
    uid += screen_info.pixelDepth || "";

    localStorage.setItem("uniqueBrowserId", uid);
    return uid;
  } else {
    const theId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("uniqueBrowserId", theId);
    return theId;
  }
};

export function splitTextIntoTags(text, tag, wordsPerLine) {
  const words = text.split(" ");
  const lines = [];

  for (let i = 0; i < words.length; i += wordsPerLine) {
    const line = words.slice(i, i + wordsPerLine).join(" ");
    lines.push(line);
  }

  return lines?.map((line, index) =>
    React.createElement(tag, { key: index }, line)
  );
}

// CMS helpers
export const unWantedKeys = [
  "key",
  "_id",
  "__v",
  "updatedAt",
  "createdAt",
  "__comment",
  "_comment",
  "updatedAt",
];

export const returnKeyEmptyAsPerType = (input) => {
  // If input is an array, recurse for each item
  if (Array.isArray(input)) {
    return input.map((item) => returnKeyEmptyAsPerType(item));
  }

  // If input is an object, recurse for each key
  if (typeof input === "object" && input !== null) {
    let emptyObject = {};
    for (let key in input) {
      if (unWantedKeys.includes(key)) continue; // Skip unwanted keys
      emptyObject[key] = returnKeyEmptyAsPerType(input[key]);
    }
    return emptyObject;
  }

  // If it's a string, return an empty string
  if (typeof input === "string") {
    return "";
  }

  // If it's anything else, return the input as is (or handle as needed)
  return input;
};

export const getFilteredObjectRemove = (object, keys) => {
  let filteredObject = { ...object };
  keys.forEach((key) => {
    delete filteredObject[key];
  });
  return filteredObject;
};

export const getFormattedParams = (label) => {
  if (typeof label !== "string" || !label) return "";
  return capitalizeEachWord(label.replace(formRegEx, formRegExReplacer));
};
