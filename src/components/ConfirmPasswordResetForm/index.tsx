import { MutationFunctionOptions } from "@apollo/client";
import { ErrorMessage } from "@hookform/error-message";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getValidators } from "./validators";

interface ConfirmPasswordResetFormProps {
  resetPasswordWithTokenMutation: (options: MutationFunctionOptions) => void;
}

interface ConfirmPasswordResetFormFields {
  confirmPassword: string;
  newPassword: string;
}

const SimpleForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: 1rem;
  max-width: 25rem;

  * {
    margin: 0.5rem;
  }

  label {
    font-weight: bold;
    margin-bottom: 0;
  }
`;

const RedError = styled.div`
  color: red;
  font-style: italic;
  margin-top: 0;
`;

const ConfirmPasswordResetForm: FC<ConfirmPasswordResetFormProps> = ({
  resetPasswordWithTokenMutation,
}) => {
  const { errors, handleSubmit, register, watch } = useForm<
    ConfirmPasswordResetFormFields
  >();
  const { token } = useParams();

  const onSubmit = ({ newPassword }: ConfirmPasswordResetFormFields) => {
    resetPasswordWithTokenMutation({
      variables: { input: { newPassword, token } },
    });
  };
  const validators = getValidators(register, watch);

  return (
    <SimpleForm onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="newPassword">New Password</label>
      <input name="newPassword" type="password" ref={validators.newPassword} />
      <ErrorMessage as={RedError} errors={errors} name="password" />

      <label htmlFor="confirmPassword">Confirm New Password</label>
      <input
        name="confirmPassword"
        type="password"
        ref={validators.confirmPassword}
      />
      <ErrorMessage as={RedError} errors={errors} name="confirmPassword" />

      <input type="submit" />
    </SimpleForm>
  );
};

export default ConfirmPasswordResetForm;
