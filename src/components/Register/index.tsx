import { gql, useMutation } from "@apollo/client";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import FormNav from "../FormNav";
import FormNotice from "../FormNotice";
import RedirectIfLoggedIn from "../RedirectIfLoggedIn";
import RegisterForm from "../RegisterForm";

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
    }
  }
`;

const RegistrationError = styled(FormNotice)`
  color: red;
  margin-bottom: 0;
`;

const RegistrationSuccess = styled(FormNotice)`
  color: green;
`;

const Register: FC = () => {
  const [registerMutation, { data, error, loading }] = useMutation(REGISTER, {
    errorPolicy: "all",
  });

  return (
    <RedirectIfLoggedIn>
      {error && <RegistrationError>{error.message}</RegistrationError>}
      {loading && <FormNotice>Please wait...</FormNotice>}
      {data && !error ? (
        <RegistrationSuccess>
          Ok, now click the link in the email.
          <FormNav>
            <Link to="/">Home</Link>
          </FormNav>
        </RegistrationSuccess>
      ) : (
        <RegisterForm registerMutation={registerMutation} />
      )}
    </RedirectIfLoggedIn>
  );
};

export default Register;
