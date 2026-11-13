export const getSupportedImageTypes = (type = ["all"]) => {
  let supportedTypes = {};
  if (type.includes("all")) {
    supportedTypes = {
      ...supportedTypes,
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/tiff": [".tif", ".tiff"],
      // "application/dicom": [".dcm"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      // "application/vnd.ms-powerpoint": [".ppt"],
      // "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      //   [".pptx"],
      "application/zip": [".zip"],
      "audio/mp3": [".mp3"],
      "audio/wav": [".wav"],
    };
  }

  if (type.includes("images")) {
    supportedTypes = {
      ...supportedTypes,
      "image/*": [],
    };
  }

  if (type.includes("docs")) {
    supportedTypes = {
      ...supportedTypes,
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "text/plain": [],
    };
  }

  if (type.includes("pdf")) {
    supportedTypes = {
      ...supportedTypes,
      "application/pdf": [],
    };
  }

  if (type.includes("csv")) {
    supportedTypes = {
      ...supportedTypes,
      "text/csv": [],
    };
  }

  if (type.includes("audio")) {
    supportedTypes = {
      ...supportedTypes,
      "audio/*": [],
    };
  }

  return supportedTypes;
};

export const getMediaType = (file) => {
  // types: images: all images, docs: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, other: all other files
  const imageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/svg+xml",
    "image/webp",
    "jpeg",
    "png",
    "jpg",
    "svg+xml",
    "webp",
  ];
  const docTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ];
  const audioTypes = ["audio/mp3", "audio/wav", "audio/mpeg", "mp3", "wav"];

  if (imageTypes.includes(file?.type || file)) {
    return "images";
  }
  if (docTypes.includes(file?.type || file)) {
    return "docs";
  }
  if (audioTypes.includes(file?.type || file)) {
    return "audio";
  }
  return "photo";
};

export const uploadMedia = async ({ files, Post, route = "media/upload" }) => {
  if (!files.length) return null;
  const formData = new FormData();
  files.forEach((file) => {
    formData.append(getMediaType(file), file);
  });

  const { response } = await Post({
    route,
    data: formData,
    isFormData: true,
  });
  if (response) {
    return response;
  }

  return null;
};

export const uploadMediaHelper = async ({
  files,
  setFiles,
  setIsLoading,
  loadingType,
  Post,
  route,
}) => {
  if (files.length === 0) return [];

  setIsLoading(loadingType);
  uploadMedia({ files, Post, route })
    .then((res) => {
      if (res) {
        setFiles(res);
      } else {
        setFiles([]);
      }
      setIsLoading("");
    })
    .finally(() => {
      setIsLoading("");
    });
};
