import React from "react";
import classes from "./AreYouSure.module.css";
import Modal from "../Modal/Modal";
import Button from "@/components/atoms/Button";
import { IoWarningOutline } from "react-icons/io5";

export default function AreYouSure({
  show,
  setShow,
  message = "This action cannot be undone. Please confirm if you'd like to continue.",
  text = "Are you sure?",
  buttonText = "Confirm",
  handleConfirm,
  loading,
}) {
  return (
    <Modal
      show={show}
      setShow={setShow}
      size="small"
      showHeader={false}
      className={classes.modalContent}
    >
      <div className={classes.container}>
        <IoWarningOutline size={72} color="var(--error)" />
        <div className={classes.main}>
          <h5>{text}</h5>
          <p>{message}</p>
        </div>
        <div className={classes.btnDiv}>
          <Button
            label={"Cancel"}
            variant={"outlined"}
            rounded
            onClick={() => setShow(false)}
          />
          <Button
            variant={"primary"}
            rounded
            onClick={handleConfirm}
            label={buttonText}
            loading={loading}
            showSpinner
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  );
}
