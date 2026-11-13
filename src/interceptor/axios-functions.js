"use client";
import RenderToast from "@/components/atoms/RenderToast";
import {
  clearAllCookies,
  setRefreshTokenCookie,
  setTokenCookie,
} from "@/resources/utils/cookie";
import { baseURL } from "@/resources/utils/helper";
import { signOutRequest, updateJWTTokens } from "@/store/auth/authSlice";
import axios from "axios";
import momentTimezone from "moment-timezone";
import { useDispatch, useSelector } from "react-redux";

let refreshPromise = null;

const useAxios = () => {
  const dispatch = useDispatch();
  const { accessToken, refreshToken } = useSelector(
    (state) => state.authReducer
  );

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    if (refreshPromise) {
      return refreshPromise;
    }
    if (!refreshToken) {
      RenderToast({
        message: "No refresh token found.",
        type: "error",
      });
      return null;
    }

    refreshPromise = (async () => {
      try {
        const { data: response } = await axios.get(
          baseURL("auth/refresh/token"),
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const data = response?.data;
        setTokenCookie(data?.token);
        setRefreshTokenCookie(data?.refreshToken);
        dispatch(updateJWTTokens(data));
        return data.token;
      } catch (error) {
        clearAllCookies();
        dispatch(signOutRequest());
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  const getErrorMsg = (error = null) => {
    if (error?.message === "Network Error") {
      return `Network Error : Please Check Your Network Connection`;
    }
    const message = error?.response?.data?.message?.error;
    let errorMessage = "";

    Array.isArray(message)
      ? message?.map(
          (item, i) => (errorMessage = `${errorMessage} • ${item} \n`)
        )
      : (errorMessage = message);
    return errorMessage;
  };

  // Function to handle API requests
  const handleRequest = async ({
    method = "",
    route = "",
    data = {},
    headers = {},
    showAlert = true,
    isFormData = false,
    signal,
    responseType = "json",
  }) => {
    const url = baseURL(route);
    const _headers = {
      "ngrok-skip-browser-warning": "69420",
      Accept: "application/json",
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      timezone: momentTimezone.tz.guess(),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    };

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: _headers,
        signal,
        ...(responseType && { responseType }),
      });
      return { response: response?.data, error: null };
    } catch (error) {
      if (axios.isCancel(error)) {
        return {
          error,
          response: null,
        };
      }
      const errorMessage = getErrorMsg(error);
      if (showAlert) {
        RenderToast({
          message: errorMessage || "An unexpected error occurred.",
          type: "error",
        });
      }

      if (
        error?.response?.status === 401 &&
        window.location.pathname !== "/login"
        // ! replace login route
      ) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          headers.Authorization = `Bearer ${newAccessToken}`;
          return await axios({ method, url, data, headers });
        }
      }
      return { error, response: null };
    }
  };

  return {
    Get: ({
      route = "",
      headers = {},
      showAlert = true,
      signal,
      responseType,
    }) =>
      handleRequest({
        method: "get",
        route,
        headers,
        showAlert,
        signal,
        responseType,
      }),

    Post: ({
      route = "",
      data = {},
      headers = {},
      showAlert = true,
      isFormData = false,
      signal,
      responseType,
    }) =>
      handleRequest({
        method: "post",
        route,
        data,
        headers,
        showAlert,
        isFormData,
        signal,
        responseType,
      }),

    Put: ({
      route = "",
      data = {},
      headers = {},
      showAlert = true,
      isFormData = false,
      signal,
      responseType,
    }) =>
      handleRequest({
        method: "put",
        route,
        data,
        headers,
        showAlert,
        isFormData,
        signal,
        responseType,
      }),

    Patch: ({
      route = "",
      data = {},
      headers = {},
      showAlert = true,
      isFormData = false,
      signal,
      responseType,
    }) =>
      handleRequest({
        method: "patch",
        route,
        data,
        headers,
        showAlert,
        isFormData,
        signal,
        responseType,
      }),

    Delete: ({ route = "", headers = {}, showAlert = true, signal }) =>
      handleRequest({ method: "delete", route, headers, showAlert, signal }),
  };
};

export default useAxios;
