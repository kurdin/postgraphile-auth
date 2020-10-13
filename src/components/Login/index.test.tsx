import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from ".";
import { isLoggedIn } from "../../apollo";

test("Redirects to / if logged in", () => {
  isLoggedIn(true);

  const Home = () => <>HOME</>;
  const { container } = render(
    <MockedProvider>
      <MemoryRouter initialEntries={["/account/login"]}>
        <Routes>
          <Route path="/account/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  expect(container).toHaveTextContent(/HOME/);
});
