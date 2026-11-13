"use client";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import Button from "@/components/atoms/Button";
import { ReactSVG } from "react-svg";
import "./style.css";
import { Spinner } from "react-bootstrap";

const localizer = momentLocalizer(moment);

export default function CalendarComponent({
  onCreateEvent,
  slotsEvents,
  onRangeChange = () => {},
  loading = false,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const date = currentDate;
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Start: 7 days before first day of current month
    const start = new Date(firstDayOfMonth);
    start.setDate(firstDayOfMonth.getDate() - 7);

    // End: 7 days after last day of current month
    const end = new Date(lastDayOfMonth);
    end.setDate(lastDayOfMonth.getDate() + 7);

    onRangeChange({ start, end });
  }, []); // Only on mount

  const handleSelectSlot = ({ start, end }) => {
    const selectedDate = new Date(start);
    selectedDate.setHours(0, 0, 0, 0);

    // Check if the selected date is in the past
    if (selectedDate < today) {
      return; // Don't allow creating events on past dates
    }

    const dateEvent = slotsEvents?.find((event) => {
      const eventDate = new Date(event?.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === selectedDate.getTime();
    });

    if (onCreateEvent) {
      onCreateEvent({ start, end, date: selectedDate, dateEvent });
    }
  };

  const dayPropGetter = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return {
        className: styles.disabledDay,
        style: {
          backgroundColor: "#ffffff",
          opacity: 0.5,
          zIndex: 5,
        },
      };
    }
    return {};
  };

  const eventStyleGetter = (event) => {
    if (event.resource?.type === "availability") {
      return {
        style: {
          border: "none",
          color: "transparent",
        },
      };
    }
    return {};
  };

  const CustomToolbar = ({ label, onNavigate }) => (
    <div className={styles.customToolbar}>
      <div className={styles.navigationButtons}>
        <Button
          onClick={() => onNavigate("PREV")}
          className={styles.navButton}
          leftIcon={
            <ReactSVG src="/svg/chevron-leftBlue.svg" width={24} height={24} />
          }
        />
        <Button
          onClick={() => onNavigate("NEXT")}
          className={styles.navButton}
          leftIcon={
            <ReactSVG src="/svg/chevron-rightBlue.svg" width={24} height={24} />
          }
        />
      </div>
      <h2 className={styles.monthYear}>
        {loading && <Spinner />}
        {label}
      </h2>
    </div>
  );

  return (
    <div className={styles.main}>
      <Calendar
        localizer={localizer}
        events={slotsEvents}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={setCurrentDate}
        view="month"
        views={["month"]}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onRangeChange={onRangeChange}
        components={{
          toolbar: CustomToolbar,
        }}
        className={styles.calendar}
      />
    </div>
  );
}
