// TODO: move to config
const MIN_PASSWORD_LENGTH = 10;

export const getValidators = (register: any, watch: any) => ({
  confirmPassword: register({
    required: "Must confirm your password.",
    validate: (v: string) =>
      v === watch("newPassword") || "Passwords must match.",
  }),
  newPassword: register({
    minLength: {
      value: MIN_PASSWORD_LENGTH,
      message: `Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    },
    required: "Must enter a password.",
  }),
});
