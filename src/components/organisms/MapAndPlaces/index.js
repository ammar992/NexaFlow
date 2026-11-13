import MapView from "@/components/molecules/MapView";
import PlacesInput from "@/components/molecules/PlacesInput/PlacesInput";
import config from "@/config";
import { useLoadScript } from "@react-google-maps/api";

/** @type {string} Google Maps API key from configuration */
const googleMapApiKey = config?.GOOGLE_MAP_KEY_API;

/** @type {{lat: number, lng: number}} Default location coordinates (San Diego, CA) */
const defaultLocation = { lat: 32.715736, lng: -117.161087 };

/**
 * A versatile component that renders either a Google Map view or a Places input field
 * based on the specified type. Handles Google Maps API loading with error states.
 *
 * @component
 * @param {Object} props - The component props
 * @param {"map"|string} [props.type="map"] - Component type: "map" for MapView, anything else for PlacesInput
 * @param {React.ReactElement|null} [props.loader=null] - Custom loading component while Google Maps API loads
 * @param {string} [props.className=""] - CSS class name for the wrapper div
 *
 * @param {string} [props.label] - Label text for PlacesInput
 * @param {string} [props.label2] - Secondary label text for PlacesInput
 * @param {string} [props.placeholder] - Placeholder text for PlacesInput
 * @param {boolean} [props.required] - Whether the PlacesInput is required
 * @param {string} [props.placeClass] - CSS class name for PlacesInput wrapper
 * @param {React.ReactElement} [props.leftIcon] - Icon to display on the left side of PlacesInput
 * @param {React.ReactElement} [props.rightIcon] - Icon to display on the right side of PlacesInput
 * @param {string} [props.error] - Error message to display for PlacesInput
 * @param {boolean} [props.disabled] - Whether the PlacesInput is disabled
 * @param {string[]} [props.types] - Google Places API types to restrict autocomplete results
 * @param {string[]} [props.countryRestrictions] - Country codes to restrict autocomplete results
 * @param {string} [props.address] - Current address value for PlacesInput
 * @param {Function} [props.setAddress] - Callback function to update address value
 * @param {Function} [props.setCompleteAddress] - Callback function to set complete address object with lat/lng
 * @param {Function} [props.setPlaceDetail] - Callback function to set place details (state, city, country, zipcode)
 * @param {Function} [props.setCoordinates] - Callback function to set coordinates {lat, lng}
 *
 * @param {{lat: number, lng: number}} [props.location] - Center location for MapView
 * @param {string} [props.mapClass] - CSS class name for MapView wrapper
 * @param {number} [props.zoomLevel] - Initial zoom level for MapView
 *
 * @returns {React.ReactElement} Rendered MapView or PlacesInput component with loading/error states
 *
 * @example
 * // Render a map
 * <MapAndPlaces
 *   type="map"
 *   location={{lat: 40.7128, lng: -74.0060}}
 *   zoomLevel={12}
 * />
 *
 * @example
 * // Render a places input
 * <MapAndPlaces
 *   type="places"
 *   label="Enter Location"
 *   placeholder="Search for a location..."
 *   address={address}
 *   setAddress={setAddress}
 *   setCoordinates={setCoordinates}
 * />
 */
export default function MapAndPlaces({
  type = "map",
  loader = null,
  className = "",
  // Places Input Props
  label,
  label2,
  placeholder,
  required,
  placeClass,
  leftIcon,
  rightIcon,
  error,
  disabled,
  types,
  countryRestrictions,
  address,
  setAddress,
  setCompleteAddress,
  setPlaceDetail,
  setCoordinates,
  // Map View Props
  location = defaultLocation,
  mapClass,
  zoomLevel,
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapApiKey,
    libraries: ["places", "visualization"],
  });

  if (!isLoaded && !loadError) {
    return loader ? loader : <div>Loading</div>;
  }

  if (loadError) {
    return (
      <div>
        <span>Map cannot be loaded right now, sorry. </span>
      </div>
    );
  }

  return (
    <div className={className}>
      {type === "map" ? (
        <MapView
          location={location}
          className={mapClass}
          zoomLevel={zoomLevel}
        />
      ) : (
        <PlacesInput
          // UI Props
          label={label}
          label2={label2}
          placeholder={placeholder}
          className={placeClass}
          required={required}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          error={error}
          disabled={disabled}
          // Functional Props
          types={types}
          countryRestrictions={countryRestrictions}
          address={address}
          setAddress={setAddress}
          setCompleteAddress={setCompleteAddress}
          setCoordinates={setCoordinates}
          setPlaceDetail={setPlaceDetail}
        />
      )}
    </div>
  );
}
