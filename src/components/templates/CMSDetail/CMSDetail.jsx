"use client";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input/Input";
import QuillInput from "@/components/atoms/QuillInput";
import RenderToast from "@/components/atoms/RenderToast";
import SpinnerLoading from "@/components/atoms/SpinnerLoading/SpinnerLoading";
import { TextArea } from "@/components/atoms/TextArea/TextArea";
import UploadImageBox from "@/components/atoms/UploadImageBox";
import UploadVideoBox from "@/components/atoms/UploadVideoBox";
import useAxios from "@/interceptor/axios-functions";
import {
  getFilteredObjectRemove,
  getFormattedParams,
  returnKeyEmptyAsPerType,
  unWantedKeys,
} from "@/resources/utils/helper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Removed Bootstrap imports - using custom divs instead
import Tabs from "@/components/molecules/Tabs/Tabs";
import axios from "axios";
import clsx from "clsx";
import { MdDelete } from "react-icons/md";
import styles from "./styles.module.css";

// Field type constants - must be defined before component
const imageFields = ["icon", "photo", "image", "backgroundImage"];
const videoFields = ["video"];
const descriptionFields = ["description", "bulletPoints", "introduction"];
const htmlDescription = ["htmlDescription"];
const multilingualFieldKeys = ["en", "th"];
const languageTabs = [
  {
    value: "en",
    label: "English",
  },
  {
    value: "th",
    label: "Thai",
  },
];

// API Routes constants
const API_ROUTES = {
  GET_PAGE_DATA: "admin/cms/page/all",
  UPDATE_PAGE_DATA: "admin/cms/page/update/homePage",
  DELETE_MEDIA: "media/delete",
  UPLOAD_MEDIA: "media/upload",
  UPLOAD_VIDEO: "media/upload",
};

// check if the data is a string or number
const isStringOrNumber = (data) => {
  return typeof data === "string" || typeof data === "number";
};

// check if the data is an Multilingual object
const isMultilingualObject = (data) => {
  const keys = Object.keys(data).filter((key) => !unWantedKeys.includes(key));

  // Check if it's a multilingual object (only contains 'en', 'th')
  const isMultilingual =
    keys.length > 0 && keys.every((key) => multilingualFieldKeys.includes(key));

  return isMultilingual;
};

export default function CMSDetail({ pageName = "homePage" }) {
  const [loading, setLoading] = useState({
    get: false,
    submit: false,
  });
  const { Get, Post, Patch } = useAxios();
  const router = useRouter();
  const [pageData, setPageData] = useState({});
  const [hideActions, setHideActions] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(
    languageTabs[0]?.value || "en"
  );

  async function getData() {
    setLoading((prev) => ({ ...prev, get: true }));
    const { response } = await Get({
      route: API_ROUTES.GET_PAGE_DATA,
    });
    if (response?.status === "success") {
      let clone = structuredClone(response?.data?.homePage);
      clone = getFilteredObjectRemove(clone, unWantedKeys);
      setPageData(clone);
    } else {
      router.push("/cms");
      RenderToast({
        type: "error",
        message: "Page not found",
      });
    }
    setLoading((prev) => ({ ...prev, get: false }));
  }

  useEffect(() => {
    getData();
  }, []);

  console.log(pageData);

  //   handleSubmit
  const handleSubmit = async () => {
    setHideActions(true);
    setLoading((prev) => ({ ...prev, submit: true }));
    const { response } = await Patch({
      route: API_ROUTES.UPDATE_PAGE_DATA,
      data: pageData,
    });
    setLoading((prev) => ({ ...prev, submit: false }));
    setHideActions(false);
    if (response?.status === "success") {
      RenderToast({
        message: "Data saved successfully",
        type: "success",
      });
      getData();
    }
  };

  /**
   * Recursive helper to update nested data structure
   */
  const updateNestedData = (data, pathArray, value) => {
    if (pathArray.length === 1) {
      return { ...data, [pathArray[0]]: value };
    }
    const [first, ...rest] = pathArray;
    return {
      ...data,
      [first]: updateNestedData(data[first] || {}, rest, value),
    };
  };

  /**
   * Recursive helper to get nested value from path
   */
  const getNestedValue = (data, pathArray) => {
    return pathArray.reduce((obj, key) => obj?.[key], data);
  };

  return (
    <div className={styles.main}>
      {loading.get ? (
        <SpinnerLoading />
      ) : (
        <div className={styles.mainContainer}>
          {/* Top Level Language Switcher */}
          <div className={styles.languageTabs}>
            <Tabs
              tabs={languageTabs}
              activeTab={activeLanguage}
              onTabChange={(tab) => setActiveLanguage(tab)}
              variant="underline"
            />
          </div>

          <DynamicCMSRenderer
            data={pageData}
            onUpdate={setPageData}
            pageName={pageName}
            hideActions={hideActions}
            loading={loading}
            Post={Post}
            Patch={Patch}
            setLoading={setLoading}
            activeLanguage={activeLanguage}
          />
          <Button
            rounded
            fullWidth
            variant="primary"
            label="Save"
            loading={loading.submit}
            showSpinner
            onClick={handleSubmit}
            disabled={loading.submit || loading.get}
          />
        </div>
      )}
    </div>
  );
}

const theInputComponent = (key) => {
  if (descriptionFields.includes(key)) {
    return TextArea;
  } else if (htmlDescription.includes(key)) {
    return QuillInput;
  } else if (imageFields.includes(key)) {
    return UploadImageBox;
  } else if (videoFields.includes(key)) {
    return UploadVideoBox;
  } else {
    return Input;
  }
};

/**
 * Progressive Heading Component
 * Returns heading element with decreasing font size based on level
 */
function Heading({ level = 0, children, className = "" }) {
  const headingClasses = [
    styles.headingLevel0, // Level 0 - largest
    styles.headingLevel1, // Level 1
    styles.headingLevel2, // Level 2
    styles.headingLevel3, // Level 3
    styles.headingLevel4, // Level 4+
  ];

  const HeadingTag =
    level === 0 ? "h3" : level === 1 ? "h4" : level === 2 ? "h5" : "h6";
  const headingClass = headingClasses[Math.min(level, 4)] || headingClasses[4];

  return (
    <HeadingTag className={clsx(headingClass, className)}>
      {children}
    </HeadingTag>
  );
}

// ============================================
// FULLY DYNAMIC RECURSIVE CMS RENDERER
// ============================================

/**
 * Dynamic CMS Renderer - Recursively handles any nested structure
 * Uses theInputComponent and existing value/setValue logic
 */
function DynamicCMSRenderer({
  data,
  onUpdate,
  pageName,
  hideActions = false,
  Post,
  loading,
  Patch,
  setLoading,
  path = "",
  level = 0,
  parentKey = "",
  activeLanguage = "en",
}) {
  if (
    (!data && typeof data !== "string") ||
    (typeof data === "object" && Object.keys(data).length === 0)
  ) {
    return <div className={styles.emptyState}>No data available</div>;
  }

  // Handle strings - render as input
  if (typeof data === "string") {
    const fieldKey = parentKey || path.split(".").pop() || "";
    const InputComponent = theInputComponent(fieldKey);

    return (
      <div className={styles.fieldWrapper}>
        <InputComponent
          label={getFormattedParams(fieldKey)}
          placeholder={`Enter ${fieldKey}`}
          value={data}
          className={styles.inputField}
          state={data}
          disabled={hideActions || loading?.[`${fieldKey}${data}`]}
          setValue={async (value) => {
            if (value === data) return;
            let newValue = value;

            // Handle image upload
            if (
              ["icon", "photo", "image", "backgroundImage"].includes(fieldKey)
            ) {
              const loadingKey = `${fieldKey}${data}`;
              setLoading((prev) => ({ ...prev, [loadingKey]: true }));
              if (data) {
                await Patch({
                  route: API_ROUTES.DELETE_MEDIA,
                  data: {
                    key: data,
                  },
                });
              }

              const formData = new FormData();
              formData.append("images", value);

              const { response } = await Post({
                route: API_ROUTES.UPLOAD_MEDIA,
                data: formData,
                isFormData: true,
              });
              setLoading((prev) => ({ ...prev, [loadingKey]: false }));
              if (response?.status === "success") {
                newValue = response?.data?.images[0]?.key;
              } else {
                RenderToast({
                  type: "error",
                  message: response?.message || "Failed to upload image",
                });
                newValue = "";
              }
            }

            // Handle video upload
            if (["video"].includes(fieldKey)) {
              const loadingKey = `${fieldKey}${data}`;
              setLoading((prev) => ({ ...prev, [loadingKey]: true }));
              if (data) {
                await Patch({
                  route: API_ROUTES.DELETE_MEDIA,
                  data: {
                    key: data,
                  },
                });
              }

              const { response } = await Post({
                route: API_ROUTES.UPLOAD_MEDIA,
                data: { videoCount: 1 },
              });
              if (response?.status === "success") {
                const file = value;
                const presignedUrl = response?.data?.urls[0];
                await axios.put(presignedUrl, file, {
                  headers: {
                    "Content-Type": "video/mp4",
                    "Content-Disposition": `inline`,
                  },
                });
              }
              setLoading((prev) => ({ ...prev, [loadingKey]: false }));
              newValue =
                response?.data?.keys[0]?.split("/").pop() || response?.data;
            }

            onUpdate(newValue);
          }}
        />
      </div>
    );
  }

  // Handle arrays
  if (Array.isArray(data)) {
    const handleAddItem = () => {
      if (data.length === 0) return;
      const itemToAdd = returnKeyEmptyAsPerType(data[0]);
      onUpdate([...data, itemToAdd]);
    };

    const handleDeleteItem = (index) => {
      if (data.length <= 1) return;
      const newData = data.filter((_, i) => i !== index);
      onUpdate(newData);
    };

    const handleUpdateItem = (index, value) => {
      const newData = [...data];
      newData[index] = value;
      onUpdate(newData);
    };

    // Check if array contains strings or objects
    const isStringArray = data.length > 0 && typeof data[0] === "string";
    const isObjectArray =
      data.length > 0 && typeof data[0] === "object" && !Array.isArray(data[0]);

    return (
      <div className={styles.arrayWrapper}>
        <div className={styles.arrayHeader}>
          <Heading level={level} className={styles.arrayHeading}>
            {getFormattedParams(parentKey)}
          </Heading>
          {/* Add More Button */}
          {!hideActions && (
            <Button
              rounded
              label="Add More"
              variant="black"
              onClick={handleAddItem}
            />
          )}
        </div>

        {/* Array Items */}
        <div className={styles.arrayGrid}>
          {data.map((item, index) => {
            if (unWantedKeys.includes(item)) return null;

            return (
              <div
                key={index}
                className={clsx(styles.arrayItem, {
                  [styles.arrayItemObject]: isObjectArray,
                })}
              >
                {/* Delete Button */}
                {data.length > 1 && !hideActions && (
                  <Button
                    leftIcon={<MdDelete size={24} color="var(--error)" />}
                    className={styles.deleteButton}
                    onClick={() => handleDeleteItem(index)}
                  />
                )}

                {/* Item Heading */}
                <Heading level={level + 1} className={styles.arrayItemHeading}>
                  Item {index + 1}
                </Heading>

                {/* Render array item - recursively */}
                {isStringArray ? (
                  <DynamicCMSRenderer
                    data={item}
                    onUpdate={(value) => handleUpdateItem(index, value)}
                    pageName={pageName}
                    hideActions={hideActions}
                    Post={Post}
                    Patch={Patch}
                    loading={loading}
                    setLoading={setLoading}
                    path={`${path}[${index}]`}
                    level={level + 1}
                    parentKey={parentKey}
                    activeLanguage={activeLanguage}
                  />
                ) : (
                  <div className={styles.arrayItemContent}>
                    <DynamicCMSRenderer
                      data={item}
                      onUpdate={(value) => handleUpdateItem(index, value)}
                      pageName={pageName}
                      hideActions={hideActions}
                      Post={Post}
                      Patch={Patch}
                      loading={loading}
                      setLoading={setLoading}
                      path={`${path}[${index}]`}
                      level={level + 1}
                      activeLanguage={activeLanguage}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Handle objects
  if (typeof data === "object") {
    const keys = Object.keys(data).filter((key) => !unWantedKeys.includes(key));

    // Check if it's a multilingual object (only contains 'en', 'th')
    const isMultilingual = isMultilingualObject(data);

    if (isMultilingual) {
      // Render as single input using top-level language switcher
      return (
        <MultilingualInput
          data={data}
          onUpdate={onUpdate}
          parentKey={parentKey}
          activeLanguage={activeLanguage}
          level={level}
        />
      );
    }

    // Regular object - render all keys recursively
    return (
      <div
        className={clsx({
          [styles.cmsRenderer]: level === 0,
          [styles.objectContainer]: level !== 0,
        })}
      >
        {keys.map((key) => {
          // Determine input component based on field arrays
          // If key doesn't match any field array, use Input
          // const InputComponentForKey = theInputComponent(key);

          return (
            <div key={key} className={styles.sectionContainer}>
              {/* Section Heading with progressive sizing */}
              {!isStringOrNumber(data[key]) &&
                !isMultilingualObject(data[key]) &&
                !Array.isArray(data[key]) && (
                  <Heading level={level} className={styles.sectionTitle}>
                    {getFormattedParams(key)}
                  </Heading>
                )}

              {/* Recursively render nested structure */}
              <div className={styles.sectionContent}>
                <DynamicCMSRenderer
                  data={data[key]}
                  onUpdate={(value) => {
                    onUpdate({
                      ...data,
                      [key]: value,
                    });
                  }}
                  pageName={pageName}
                  hideActions={hideActions}
                  Post={Post}
                  Patch={Patch}
                  setLoading={setLoading}
                  path={`${path ? `${path}.` : ""}${key}`}
                  level={level + 1}
                  parentKey={key}
                  activeLanguage={activeLanguage}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback
  return <div className={styles.fieldContainer}>{String(data)}</div>;
}

/**
 * Multilingual Input Component
 * Renders a single text input (multilingual fields can only be text)
 */
function MultilingualInput({
  data,
  onUpdate,
  parentKey,
  activeLanguage,
  level,
}) {
  const keys = Object.keys(data).filter((key) =>
    multilingualFieldKeys.includes(key)
  );

  if (keys.length === 0) return null;

  // Multilingual fields are always text - use Input, TextArea, or QuillInput based on parentKey
  const InputComponent = descriptionFields.includes(parentKey || "")
    ? TextArea
    : htmlDescription.includes(parentKey || "")
    ? QuillInput
    : Input;

  const currentValue = data[activeLanguage] || "";

  const handleValueChange = (value) => {
    if (value === currentValue) return;
    onUpdate({
      ...data,
      [activeLanguage]: value,
    });
  };

  return (
    <div className={styles.multilingualInputContainer}>
      {/* Input for Active Language (uses top-level language switcher) */}
      <div className={styles.multilingualInputWrapper}>
        <InputComponent
          label={getFormattedParams(parentKey || "")}
          placeholder={`Enter ${
            parentKey || "value"
          } (${activeLanguage.toUpperCase()})`}
          value={currentValue}
          className={styles.inputField}
          state={currentValue}
          setValue={handleValueChange}
        />
      </div>
    </div>
  );
}
