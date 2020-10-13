import { MutationFunctionOptions } from "@apollo/client";
import { ErrorMessage } from "@hookform/error-message";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { getValidators } from "./validators";

interface LoginFormProps {
  loginMutation: (options: MutationFunctionOptions) => void;
}

interface LoginFormFields {
  email: string;
  password: string;
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

const LoginForm: FC<LoginFormProps> = ({ loginMutation }) => {
  const { errors, handleSubmit, register } = useForm<LoginFormFields>();

  const onSubmit = ({ email, password }: LoginFormFields) =>
    loginMutation({ variables: { input: { email, password } } });

  const validators = getValidators(register);

  return (
    <SimpleForm onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email">Email</label>
      <input name="email" type="email" ref={validators.email} />
      <ErrorMessage as={RedError} errors={errors} name="email" />

      <label htmlFor="password">Password</label>
      <input name="password" type="password" ref={validators.password} />
      <ErrorMessage as={RedError} errors={errors} name="password" />

      <input type="submit" />
    </SimpleForm>
  );
};

export default LoginForm;
