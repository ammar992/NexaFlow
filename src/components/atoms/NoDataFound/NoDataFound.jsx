import React from "react";
import classes from "./NoDataFound.module.css";
import { GoAlertFill } from "react-icons/go";
import clsx from "clsx";

/**
 * NoDataFound component displays a message when no data is available.
 *
 * @param {Object} param - Component props.
 * @param {string} [param.className=""] - Additional class names to apply.
 * @param {string} [param.text="No Data Found"] - Message text to display.
 * @returns {JSX.Element}
 */
export default function NoDataFound({
  className = "",
  text = "No Data Found",
}) {
  return (
    <div className={clsx(classes.main, className)}>
      <GoAlertFill color="var(--primary)" size={50} />
      <p>{text}</p>
    </div>
  );
}
