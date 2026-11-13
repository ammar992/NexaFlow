import { GoogleMap, Marker } from "@react-google-maps/api";
import clsx from "clsx";
import classes from "./MapView.module.css";

/**
 * A React component that renders a Google Map view with a single marker
 * at the specified location.
 *
 * @param {{lat: number, lng: number}} location - Center location for MapView
 * @param {string} className - CSS class name for MapView wrapper
 * @param {number} [zoomLevel=16] - Initial zoom level for MapView
 */

export default function MapView({ location, className, zoomLevel = 16 }) {
  return (
    <div className={clsx(classes?.container, className)}>
      <GoogleMap
        zoom={zoomLevel}
        center={location}
        mapContainerClassName={classes["map-container"]}
        options={{
          disableDefaultUI: true, // Disable all default UI elements
          clickableIcons: false, // Prevent callout for POIs
        }}
      >
        <Marker position={location} />
      </GoogleMap>
    </div>
  );
}
