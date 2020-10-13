import validator from "validator";

export const getValidators = (register: any) => ({
  email: register({
    required: "Must enter an email address.",
    validate: (v: string) => validator.isEmail(v) || "Invalid email address.",
  }),
});
