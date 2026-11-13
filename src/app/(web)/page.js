"use client";
import MapAndPlaces from "@/components/organisms/MapAndPlaces";
import { useState } from "react";

export default function Page() {
  const [inputValue, setInputValue] = useState("lahore");
  const [completeAddress, setCompleteAddress] = useState(null);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <MapAndPlaces
        label="Sample Places Input"
        address={inputValue}
        setAddress={(address) => {
          setInputValue(address);
        }}
        setCompleteAddress={(address) => {
          setCompleteAddress(address);
        }}
      />
    </div>
  );
}
