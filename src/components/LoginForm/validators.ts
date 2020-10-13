export const getValidators = (register: any) => ({
  email: register({
    required: "Must enter an email address.",
  }),
  password: register({
    required: "Must enter a password.",
  }),
});
