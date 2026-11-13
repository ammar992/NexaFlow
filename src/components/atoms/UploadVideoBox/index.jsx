import { imageUrl } from "@/resources/utils/helper";
import { useRef } from "react";
import { CgImage } from "react-icons/cg";
import { MdClose, MdModeEdit, MdUpload } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import classes from "./UploadVideoBox.module.css";

function UploadVideoBox({
  state,
  setValue,
  label,
  edit = true,
  onDelete,
  onClose,
  isCloseable,
  hideDeleteIcon = false,
  videoClass,
  containerClass = "",
  onEdit,
}) {
  const inputRef = useRef(null);
  return (
    <>
      {label && <label className={classes.label}>{label}</label>}

      <div className={`${classes.box} ${containerClass}`}>
        <div className={classes.uploadImageBox}>
          {/* Close Icon */}
          {isCloseable && (
            <span className={classes.closeIcon} onClick={onClose}>
              <MdClose size={24} />
            </span>
          )}
          {state?.name || typeof state == "string" ? (
            <div className={classes.imageUploaded}>
              <video
                controls
                className={videoClass ? videoClass : ""}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                src={
                  typeof state == "object"
                    ? URL.createObjectURL(state)
                    : imageUrl(state)
                }
              />
              <div className={classes.editAndDelete}>
                {edit && (
                  <>
                    {hideDeleteIcon && (
                      <div className={classes.icon} onClick={onDelete}>
                        <RiDeleteBinLine size={24} />
                      </div>
                    )}
                    <div
                      className={classes.icon}
                      onClick={() => {
                        inputRef.current.click();
                        onEdit && onEdit();
                      }}
                    >
                      <MdModeEdit size={24} />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className={classes.uploadBox}>
              <CgImage className={classes.icon} />
              <div
                className={classes.uploadIcon}
                onClick={() => inputRef.current.click()}
              >
                <MdUpload />
              </div>
            </div>
          )}
        </div>
        {/* Input For Video Upload */}
        <input
          hidden
          type={"file"}
          accept="video/*"
          ref={inputRef}
          onChange={(e) => setValue(e.target.files[0])}
        />
      </div>
    </>
  );
}

export default UploadVideoBox;
