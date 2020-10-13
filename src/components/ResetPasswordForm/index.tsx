import { MutationFunctionOptions } from "@apollo/client";
import { ErrorMessage } from "@hookform/error-message";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import SimpleForm from "../SimpleForm";
import { getValidators } from "./validators";

interface ResetPasswordFormProps {
  resetPasswordMutation: (options: MutationFunctionOptions) => void;
}

interface ResetPasswordFormFields {
  email: string;
}

const RedError = styled.div`
  color: red;
  font-style: italic;
  margin-top: 0;
`;

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({
  resetPasswordMutation,
}) => {
  const { errors, handleSubmit, register } = useForm<ResetPasswordFormFields>();

  const onSubmit = ({ email }: ResetPasswordFormFields) =>
    resetPasswordMutation({ variables: { input: { email } } });

  const validators = getValidators(register);

  return (
    <SimpleForm onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email">Email</label>
      <input name="email" ref={validators.email} />
      <ErrorMessage as={RedError} errors={errors} name="email" />

      <input type="submit" />
    </SimpleForm>
  );
};

export default ResetPasswordForm;
