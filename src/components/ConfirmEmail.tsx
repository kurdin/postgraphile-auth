import { gql, useMutation } from "@apollo/client";
import React, { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

const CONFIRM_EMAIL = gql`
  mutation ConfirmEmail($input: ConfirmEmailInput!) {
    confirmEmail(input: $input) {
      success
    }
  }
`;

const ConfirmEmailNotice = styled.div`
  font-style: italic;
  font-size: 1.1rem;
  margin: 1rem;
`;

const ConfirmEmailError = styled(ConfirmEmailNotice)`
  color: red;
`;

const ConfirmEmailSuccess = styled(ConfirmEmailNotice)`
  color: green;
`;

const ConfirmEmail: FC = () => {
  const [confirmEmailMutation, { data, error, loading }] = useMutation(
    CONFIRM_EMAIL,
    {
      errorPolicy: "all",
    }
  );
  const { token } = useParams();
  const [queryError, setQueryError] = useState();

  useEffect(() => {
    try {
      confirmEmailMutation({ variables: { input: { token } } });
    } catch (e) {
      setQueryError(e.message);
    }
  }, [confirmEmailMutation, setQueryError, token]);

  if (loading) {
    return <ConfirmEmailNotice>Please wait...</ConfirmEmailNotice>;
  }

  if (error || queryError) {
    return (
      <>
        <ConfirmEmailError>
          Something unexpected happened while trying to confirm your email.
        </ConfirmEmailError>
        <Link to="/">Home</Link>
      </>
    );
  }

  if (!data?.confirmEmail?.success) {
    return (
      <ConfirmEmailError>
        We couldn't confirm your email using that link. Maybe you did it
        already? Try <Link to="/account/login">logging in</Link>.
      </ConfirmEmailError>
    );
  }

  return (
    <ConfirmEmailSuccess>
      Thanks for confirming your email! You can{" "}
      <Link to="/account/login">log in</Link> now.
    </ConfirmEmailSuccess>
  );
};

export default ConfirmEmail;
