"use client";

import { capitalizeEachWord, mediaURL } from "@/resources/utils/helper";
import moment from "moment";
import styles from "./tableHelper.module.css";
import { Form } from "react-bootstrap";
import Image from "next/image";
import clsx from "clsx";

export function RenderStatusCell({ status }) {
  const normalizedStatus = status?.toLowerCase();
  const getStatusClass = (status) => {
    if (["confirmed", "low"].includes(status)) {
      return styles.statusBlue;
    } else if (["completed", "resolved", "approved"].includes(status)) {
      return styles.statusGreen;
    } else if (["escalated", "urgent", "in progress"].includes(status)) {
      return styles.statusRed;
    } else if (["pending", "under review", "medium"].includes(status)) {
      return styles.statusOrange;
    } else {
      return styles.statusDefault;
    }
  };
  const statusClass = getStatusClass(normalizedStatus);
  return (
    <div className={clsx(statusClass, styles.statusCell)}>
      <span />
      <p>{status}</p>
    </div>
  );
}

export function RenderDateTimeCell({ dateTime, withoutTimezone = false }) {
  const formatDateTime = () => {
    if (withoutTimezone) {
      // Show as UTC without timezone offset
      return moment.utc(dateTime).format("YYYY-MM-DD • h:mmA");
    } else {
      // Show with timezone offset (local time)
      return moment(dateTime).format("YYYY-MM-DD • h:mmA");
    }
  };

  return (
    <div className={styles.dateTimeCell}>
      <p>{formatDateTime()}</p>
    </div>
  );
}

export function RenderSwitchCell({ isActive, onChange = () => {} }) {
  return (
    <div className={styles.switchCell}>
      <Form.Switch
        checked={isActive}
        onChange={onChange}
        className={styles.switch}
      />
      <p>{isActive ? "Active" : "Inactive"}</p>
    </div>
  );
}

export function RenderPhoneNumberCell({ countryCode, phoneNumber }) {
  return (
    <div className={styles.phoneNumberCell}>
      <p>
        {countryCode} {phoneNumber}
      </p>
    </div>
  );
}

export function RenderItemPhotoCell({ photo, itemName = "" }) {
  return (
    <div className={styles.itemPhotoCell}>
      <Image
        src={mediaURL(photo, "/app-images/image-placeholder.png")}
        alt={itemName}
        width={40}
        height={40}
      />
      <p>{capitalizeEachWord(itemName)}</p>
    </div>
  );
}
