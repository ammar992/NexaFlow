"use client";
import { useLinkStatus } from "next/link";
import React from "react";
import { Spinner } from "react-bootstrap";
import classes from "./LinkLoader.module.css";
import { createPortal } from "react-dom";

export default function LinkLoader() {
  const { pending } = useLinkStatus();

  if (pending) {
    return createPortal(
      <div className={classes.overlay}>
        <Spinner className={classes.spinner} />
      </div>,
      typeof document !== "undefined" ? document.body : null
    );
  }
}
