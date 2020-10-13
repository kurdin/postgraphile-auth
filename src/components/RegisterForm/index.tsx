import { MutationFunctionOptions } from "@apollo/client";
import { ErrorMessage } from "@hookform/error-message";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { getValidators } from "./validators";

interface RegisterFormProps {
  registerMutation: (options: MutationFunctionOptions) => void;
}

interface RegisterFormFields {
  confirmPassword: string;
  email: string;
  fullName: string;
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

const RegisterForm: FC<RegisterFormProps> = ({ registerMutation }) => {
  const { errors, handleSubmit, register, watch } = useForm<
    RegisterFormFields
  >();

  const onSubmit = ({ email, fullName, password }: RegisterFormFields) => {
    registerMutation({ variables: { input: { email, password, fullName } } });
  };
  const validators = getValidators(register, watch);

  return (
    <SimpleForm onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email">Email</label>
      <input name="email" type="email" ref={validators.email} />
      <ErrorMessage as={RedError} errors={errors} name="email" />

      <label htmlFor="password">Password</label>
      <input name="password" type="password" ref={validators.password} />
      <ErrorMessage as={RedError} errors={errors} name="password" />

      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        name="confirmPassword"
        type="password"
        ref={validators.confirmPassword}
      />
      <ErrorMessage as={RedError} errors={errors} name="confirmPassword" />

      <label htmlFor="fullName">Full name</label>
      <input name="fullName" ref={validators.fullName} />
      <ErrorMessage as={RedError} errors={errors} name="fullName" />

      <input type="submit" />
    </SimpleForm>
  );
};

export default RegisterForm;
