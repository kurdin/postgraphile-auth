import { gql, useMutation } from "@apollo/client";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import FormNav from "../FormNav";
import FormNotice from "../FormNotice";
import ResetPasswordForm from "../ResetPasswordForm";

const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
    }
  }
`;

const ResetPasswordError = styled(FormNotice)`
  color: red;
  margin-bottom: 0;
`;

const ResetPasswordSuccess = styled(FormNotice)`
  color: green;
`;

const ResetPassword: FC = () => {
  const [resetPasswordMutation, { data, error, loading }] = useMutation(
    RESET_PASSWORD,
    {
      errorPolicy: "all",
    }
  );

  return (
    <>
      {error && <ResetPasswordError>{error.message}</ResetPasswordError>}
      {loading && <FormNotice>Please wait...</FormNotice>}
      {data && !error ? (
        <ResetPasswordSuccess>Ok, now check your email.</ResetPasswordSuccess>
      ) : (
        <ResetPasswordForm resetPasswordMutation={resetPasswordMutation} />
      )}
      <FormNav>
        <Link to="/">Home</Link>
      </FormNav>
    </>
  );
};

export default ResetPassword;
