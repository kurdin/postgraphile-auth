import { gql, useApolloClient, useMutation } from "@apollo/client";
import React, { FC, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import styled from "styled-components";
import { isLoggedIn } from "../../apollo";
import FormNav from "../FormNav";
import FormNotice from "../FormNotice";
import LoginForm from "../LoginForm";
import RedirectIfLoggedIn from "../RedirectIfLoggedIn";

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
    }
  }
`;

const LoginError = styled(FormNotice)`
  color: red;
  margin-bottom: 0;
`;

const Login: FC = () => {
  const client = useApolloClient();
  const [loginMutation, { data, error, loading }] = useMutation(LOGIN, {
    errorPolicy: "all",
    onCompleted: useCallback((result) => {
      const token = result?.login?.token;
      client.writeQuery({
        data: {
          accessToken: {
            token,
          },
        },
        query: gql`
          query ResetToken {
            accessToken {
              token
            }
          }
        `,
      });
      if (token) {
        isLoggedIn(true);
      }
    }, []),
  });

  return (
    <RedirectIfLoggedIn>
      {error && <LoginError>{error.message}</LoginError>}
      {loading && <FormNotice>Please wait...</FormNotice>}
      {data && !error ? (
        <Navigate to="/" />
      ) : (
        <LoginForm loginMutation={loginMutation} />
      )}
      <FormNav>
        <Link to="/account/resetpassword">Forgot password?</Link>
        <Link to="/account/register">Register</Link>
      </FormNav>
    </RedirectIfLoggedIn>
  );
};

export default Login;
