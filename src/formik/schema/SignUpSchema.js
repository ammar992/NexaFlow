import { emailRegex, phoneRegex } from "@/resources/utils/regex";
import * as Yup from "yup";

export const SignUpSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email a valid email.")
    .test(
      "no-special-chars",
      "Email contains invalid characters",
      (value) => !value || emailRegex.test(value)
    ),
  password: Yup.string().required("Password is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .test(
      "valid-phone",
      "Phone number is invalid",
      (value) => !value || phoneRegex.test(value)
    ),
});
