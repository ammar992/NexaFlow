"use client";
import RenderToast from "@/components/atoms/RenderToast";
import config from "@/config";
import { clearAllCookies } from "@/resources/utils/cookie";
import { getUniqueBrowserId } from "@/resources/utils/helper";
import { signOutRequest } from "@/store/auth/authSlice";
import { incrementUnreadNotificationCount } from "@/store/common/commonSlice";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const { accessToken, user } = useSelector((state) => state?.authReducer);

  // Stable logout handler
  const handleUserLogout = useCallback(() => {
    RenderToast("Your session has ended", "info");
    dispatch(signOutRequest());
    clearAllCookies();
    router.replace("/login");
  }, [dispatch, router]);

  useEffect(() => {
    if (!accessToken || !user?._id) return;

    const socket = io(config?.apiBaseUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token: accessToken }, // attach token if backend needs it
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected");
      socket.emit("join", {
        userId: user._id,
        device: getUniqueBrowserId(),
      });
    });

    socket.on("user-blocked", () => {
      RenderToast("Your account has been blocked", "error");
      handleUserLogout();
    });

    socket.on("user-deleted", () => {
      RenderToast("Your account has been deleted", "error");
      handleUserLogout();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    socket.on("new-notification", (data) => {
      console.log("New notification received:", data);

      // Increment unread count in Redux
      dispatch(incrementUnreadNotificationCount());

      RenderToast({
        type: "info",
        message: data?.title || "New Notification",
        autoClose: false,
        closeButton: true,
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, user?._id, handleUserLogout]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
