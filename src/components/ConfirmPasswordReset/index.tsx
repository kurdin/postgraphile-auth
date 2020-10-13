import { gql, useMutation } from "@apollo/client";
import React, { FC } from "react";
import { Link, Navigate } from "react-router-dom";
import styled from "styled-components";
import ConfirmPasswordResetForm from "../ConfirmPasswordResetForm";
import FormNav from "../FormNav";
import FormNotice from "../FormNotice";
import RedirectIfLoggedIn from "../RedirectIfLoggedIn";

const RESET_PASSWORD_WITH_TOKEN = gql`
  mutation ResetPasswordWithToken($input: ResetPasswordWithTokenInput!) {
    resetPasswordWithToken(input: $input) {
      success
    }
  }
`;

const ConfirmPasswordResetError = styled(FormNotice)`
  color: red;
  margin-bottom: 0;
`;

const ConfirmPasswordReset: FC = () => {
  const [
    resetPasswordWithTokenMutation,
    { data, error, loading },
  ] = useMutation(RESET_PASSWORD_WITH_TOKEN, {
    errorPolicy: "all",
  });

  const success = data?.resetPasswordWithToken?.success;
  if (success) {
    return <Navigate to="/" />;
  }

  return (
    <RedirectIfLoggedIn>
      {error && (
        <ConfirmPasswordResetError>{error.message}</ConfirmPasswordResetError>
      )}
      {loading && <FormNotice>Please wait...</FormNotice>}
      {success === false ? (
        <ConfirmPasswordResetError>
          Could not reset password using that link. Perhaps it's expired?
        </ConfirmPasswordResetError>
      ) : (
        <ConfirmPasswordResetForm
          resetPasswordWithTokenMutation={resetPasswordWithTokenMutation}
        />
      )}
      <FormNav>
        <Link to="/">Home</Link>
      </FormNav>
    </RedirectIfLoggedIn>
  );
};

export default ConfirmPasswordReset;
