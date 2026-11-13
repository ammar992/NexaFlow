import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef } from "react";
import AsyncSelect from "react-select/async";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  getZipCode,
} from "use-places-autocomplete";
import classes from "./PlacesInput.module.css";

export default function PlacesInput({
  // UI Props
  label = "",
  label2 = "",
  required = false,
  placeholder = "Enter your location",
  className = "",
  leftIcon = null,
  rightIcon = null,
  error = "",
  disabled = false,
  // Functional Props
  types = null,
  countryRestrictions = null,
  address = "",
  setAddress = () => {},
  setCompleteAddress = () => {},
  setCoordinates = () => {},
  setPlaceDetail = () => {},
}) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      ...(types && { types }),
      ...(countryRestrictions && {
        componentRestrictions: { country: countryRestrictions },
      }),
    },
    debounce: 300,
  });

  const suggestionsRef = useRef({ data, status });

  // Update ref when suggestions change
  useEffect(() => {
    suggestionsRef.current = { data, status };
  }, [data, status]);

  // Update value when address prop changes
  useEffect(() => {
    if (address !== value) {
      setValue(address || "", false);
      clearSuggestions();
    }
  }, [address, value, setValue, clearSuggestions]);

  // Load options for react-select (promise-based)
  const loadOptions = useCallback(
    (inputValue) => {
      return new Promise((resolve) => {
        if (!inputValue || inputValue.trim() === "") {
          resolve([]);
          return;
        }

        // Update the value to trigger suggestions
        setValue(inputValue, false);

        // Wait for suggestions to update
        const checkSuggestions = () => {
          const current = suggestionsRef.current;
          if (
            current.status === "OK" &&
            current.data &&
            current.data.length > 0
          ) {
            const options = current.data.map(({ place_id, description }) => ({
              value: description,
              label: description,
              place_id,
            }));
            resolve(options);
          } else if (current.status === "ZERO_RESULTS") {
            resolve([]);
          } else {
            // If not ready yet, check again after a short delay
            setTimeout(checkSuggestions, 100);
          }
        };

        // Start checking after a small delay to allow suggestions to update
        setTimeout(checkSuggestions, 100);
      });
    },
    [setValue]
  );

  // Handle selection
  const handleSelect = useCallback(
    async (selectedOption) => {
      if (!selectedOption) {
        setPlaceDetail && setPlaceDetail(null);
        setCoordinates && setCoordinates(null);
        setAddress && setAddress("");
        setValue("", false);
        clearSuggestions();
        return;
      }

      const val = selectedOption.value;
      setValue(val, false);
      clearSuggestions();

      try {
        const results = await getGeocode({ address: val });
        const zipcode = await getZipCode(results[0], false);
        const { lat, lng } = await getLatLng(results[0]);

        let country = "";
        let city = "";
        let state = "";
        let addrComp = results[0].address_components;
        for (let i = 0; i < addrComp.length; ++i) {
          if (addrComp[i].types.includes("administrative_area_level_1"))
            state = addrComp[i].long_name;
          else if (addrComp[i].types.includes("locality"))
            city = addrComp[i].long_name;
          else if (addrComp[i].types.includes("country"))
            country = addrComp[i].long_name;
          //we can break early if we find all three data
          if (state !== "" && city !== "" && country !== "") break;
        }
        setPlaceDetail && setPlaceDetail({ state, city, country, zipcode });
        setCoordinates && setCoordinates({ lat, lng });
        setAddress(val);
        setCompleteAddress &&
          setCompleteAddress({
            address: val,
            state: state,
            city: city,
            country: country,
            zipcode: zipcode,
            lat: lat,
            lng: lng,
          });
      } catch (error) {
        console.error("Error geocoding address:", error);
      }
    },
    [
      setValue,
      clearSuggestions,
      setPlaceDetail,
      setCoordinates,
      setAddress,
      setCompleteAddress,
    ]
  );

  // Current selected value for react-select
  const selectedValue = useMemo(() => {
    if (!address) return null;
    return {
      value: address,
      label: address,
    };
  }, [address]);

  // Custom styles for react-select
  const customStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: "10px",
        border: `1px solid ${
          state.isFocused ? "var(--primary, #007bff)" : "var(--border, #dee2e6)"
        }`,
        background: "var(--white, #ffffff)",
        minHeight: "46px",
        height: "46px",
        boxShadow: state.isFocused
          ? "0 0 0 1px var(--primary, #007bff)"
          : "none",
        "&:hover": {
          border: `1px solid ${
            state.isFocused
              ? "var(--primary, #007bff)"
              : "var(--border, #dee2e6)"
          }`,
        },
        paddingLeft: leftIcon ? "32px" : "0px",
        paddingRight: rightIcon ? "32px" : "0px",
      }),
      input: (base) => ({
        ...base,
        margin: "0",
        padding: "0",
        fontSize: "var(--fs14, 14px)",
        fontWeight: "400",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        color: "var(--black, #000000)",
      }),
      placeholder: (base) => ({
        ...base,
        color: "var(--white-9, #999999)",
        fontSize: "var(--fs14, 14px)",
        textTransform: "capitalize",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        fontWeight: "400",
      }),
      singleValue: (base) => ({
        ...base,
        fontSize: "var(--fs14, 14px)",
        fontWeight: "500",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        color: "var(--black, #000000)",
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "10px",
        border: "1px solid var(--border, #dee2e6)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
        marginTop: "5px",
      }),
      option: (base, state) => ({
        ...base,
        padding: "12px 16px",
        fontSize: "var(--fs14, 14px)",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        color: "var(--black, #000000)",
        backgroundColor: state.isSelected
          ? "var(--blue-light-2, #e3f2fd)"
          : state.isFocused
          ? "var(--blue-light-2, #e3f2fd)"
          : "transparent",
        cursor: "pointer",
        "&:active": {
          backgroundColor: "var(--blue-light-2, #e3f2fd)",
        },
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "var(--text-muted, #6c757d)",
        padding: "0 8px",
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "var(--text-muted, #6c757d)",
        padding: "0 8px",
      }),
    }),
    [leftIcon, rightIcon]
  );

  return (
    <div className={clsx(className, classes.containerClass)}>
      {label && (
        <label className={classes.labelClass}>
          {label} {required && <span className={classes.required}>*</span>}{" "}
          {label2 && <span className={classes.smallLabelClass}>{label2}</span>}
        </label>
      )}
      <div className={classes.selectContainer}>
        {leftIcon && <span className={classes.leftIcon}>{leftIcon}</span>}
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={handleSelect}
          onInputChange={(inputValue, actionMeta) => {
            if (inputValue === "" && address !== value) {
              setPlaceDetail && setPlaceDetail(null);
              setCoordinates && setCoordinates(null);
              setAddress && setAddress("");
              setValue("", false);
              clearSuggestions();
            } else if (inputValue !== "") {
              setValue(inputValue);
            }
          }}
          value={selectedValue}
          placeholder={placeholder}
          isDisabled={!ready || disabled}
          isClearable
          styles={customStyles}
          className={clsx(classes.selectWrapper, {
            [classes.disabled]: disabled,
          })}
          noOptionsMessage={({ inputValue }) => {
            if (inputValue.trim() === "") {
              return "Type to search locations";
            }
            return "No locations found";
          }}
          loadingMessage={({ inputValue }) => {
            if (inputValue.trim() === "") {
              return "Type to search locations";
            }
            return "Loading locations...";
          }}
        />
        {rightIcon && <div className={classes.rightIcon}>{rightIcon}</div>}
      </div>
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
}
