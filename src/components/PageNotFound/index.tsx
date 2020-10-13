import React, { FC } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const PageNotice = styled.div`
  margin: 2rem;
`;

const PageNotFound: FC = () => (
  <PageNotice>
    <h1>Nope, that's a 404</h1>
    <Link to="/">Home</Link>
  </PageNotice>
);

export default PageNotFound;
