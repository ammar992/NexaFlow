import { baseURL } from "@/resources/utils/helper";
import axios from "axios";

export const getApi = async (endpoint = "") => {
  try {
    const response = await axios.get(baseURL(endpoint), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data;
  } catch (error) {
    console.error("getApi ~ error:", error);
    return null;
  }
};
