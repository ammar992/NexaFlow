"use client";
import useAxios from "@/interceptor/axios-functions";
import Aos from "aos";
import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import store, { persistor } from "..";
import { signOutRequest } from "../auth/authSlice";

export function CustomProvider({ children }) {
  useEffect(() => {
    Aos.init();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApisProvider>{children}</ApisProvider>
      </PersistGate>
    </Provider>
  );
}

export default function ApisProvider({ children }) {
  let accessToken = useSelector((state) => state.authReducer.accessToken);
  const dispatch = useDispatch();
  const { Get } = useAxios();

  const getCommonData = async () => {
    const [{ response: userResponse }] = await Promise?.all([
      Get({ route: "users/me" }),
    ]);
    if (userResponse) {
      dispatch(setExample(userResponse?.data?.data));
    }
  };

  useEffect(() => {
    if (accessToken) {
      console.log("Access Token:", accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      dispatch(signOutRequest());
    } else {
      // getCommonData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}
