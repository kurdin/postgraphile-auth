import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Home from ".";
import { isLoggedIn } from "../../apollo";

test("Shows log in link if logged out", () => {
  isLoggedIn(false);

  const { getByText } = render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  const link = getByText(/Log in/i) as HTMLLinkElement;
  expect(link.href).toContain("/account/login");
});

test("Shows log out link if logged in", () => {
  isLoggedIn(true);

  const { getByText } = render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const link = getByText(/Log out/i) as HTMLLinkElement;
  expect(link.href).toContain("/account/logout");
});
