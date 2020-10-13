import { gql, useApolloClient, useMutation } from "@apollo/client";
import React, { FC, useCallback, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../apollo";
import Loading from "../Loading";

const LOGOUT = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

const Logout: FC = () => {
  const client = useApolloClient();
  const [logoutMutation, { loading }] = useMutation(LOGOUT, {
    errorPolicy: "ignore",
    onCompleted: useCallback(() => {
      client.writeQuery({
        data: {
          accessToken: {
            token: null,
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
      isLoggedIn(false);
    }, []),
  });
  useEffect(() => {
    logoutMutation();
  }, [logoutMutation]);

  if (loading) {
    return <Loading />;
  }

  return <Navigate to="/" />;
};

export default Logout;
