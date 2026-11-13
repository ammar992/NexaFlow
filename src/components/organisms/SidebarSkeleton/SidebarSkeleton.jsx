"use client";
import React from "react";
import classes from "./SidebarSkeleton.module.css";
import Sidebar from "../Sidebar/Sidebar";

export default function SidebarSkeleton({ children }) {
  return (
    <main className={classes.sidebarSkeleton}>
      <Sidebar />
      <section className={classes.mainContent}>{children}</section>
    </main>
  );
}
