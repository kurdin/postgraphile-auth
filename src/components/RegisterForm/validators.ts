import validator from "validator";

const MIN_PASSWORD_LENGTH = 10;

export const getValidators = (register: any, watch: any) => ({
  confirmPassword: register({
    required: "Must confirm your password.",
    validate: (v: string) => v === watch("password") || "Passwords must match.",
  }),
  email: register({
    required: "Required field.",
    validate: (v: string) => validator.isEmail(v) || "Invalid email address.",
  }),
  fullName: register({
    required: "Required field.",
  }),
  password: register({
    minLength: {
      value: MIN_PASSWORD_LENGTH,
      message: `Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    },
    required: "Must enter a password.",
  }),
});
