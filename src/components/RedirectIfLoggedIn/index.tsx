import { gql, useLazyQuery, useReactiveVar } from "@apollo/client";
import React, { FC, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../apollo";
import Loading from "../Loading";

export const ACCESS_TOKEN = gql`
  query AccessToken {
    accessToken {
      token
    }
  }
`;

interface RedirectIfLoggedInProps {
  target?: string;
}

const RedirectIfLoggedIn: FC<RedirectIfLoggedInProps> = ({
  children,
  target,
}) => {
  const [accessTokenQuery, { called, data, loading }] = useLazyQuery(
    ACCESS_TOKEN,
    {
      // NOTE: errors here aren't the end of the world, they should just indicate that the user
      // doesn't have a refresh token. A more detailed approach might distinguish by error type.
      errorPolicy: "ignore",
      // TODO: maybe use the cache more here?
      fetchPolicy: "network-only",
      onCompleted: useCallback((result) => {
        if (result?.accessToken?.token) {
          isLoggedIn(true);
        }
      }, []),
    }
  );
  const loggedIn = useReactiveVar(isLoggedIn);

  if (!loggedIn && !called) {
    accessTokenQuery();
  }

  if (loading) {
    return <Loading />;
  }

  if (loggedIn || data?.accessToken?.token) {
    return <Navigate to={target || "/"} />;
  }

  return <>{children}</>;
};

export default RedirectIfLoggedIn;
