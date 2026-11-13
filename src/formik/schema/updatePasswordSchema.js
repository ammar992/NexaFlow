import * as Yup from "yup";

export const updatePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current Password is required"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Min 8 characters")
    .max(20, "Max 20 characters")
    .matches(/[a-z]/, "Add lowercase")
    .matches(/[A-Z]/, "Add uppercase")
    .matches(/\d/, "Add number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Add special character")
    .test(
      "not-same-as-current",
      "New Password must be different from Current Password",
      function (value) {
        const { currentPassword } = this.parent;
        return value !== currentPassword;
      }
    ),

  confirmPassword: Yup.string()
    .oneOf(
      [Yup.ref("password"), null],
      "New Password and Confirm Password must match"
    )
    .required("Confirm Password is required"),
});
