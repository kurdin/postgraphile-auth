import { useReactiveVar } from "@apollo/client";
import React from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../../apollo";

const Home = () => {
  const loggedIn = useReactiveVar(isLoggedIn);

  const outOrIn = loggedIn ? "out" : "in";
  return (
    <>
      <div>HOME</div>
      <Link to={`/account/log${outOrIn}`}>Log {outOrIn}</Link>
    </>
  );
};

export default Home;
