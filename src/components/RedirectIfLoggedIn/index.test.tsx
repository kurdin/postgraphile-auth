import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { isLoggedIn } from "../../apollo";
import RedirectIfLoggedIn from "../RedirectIfLoggedIn";

test("Redirects to / if logged in", () => {
  isLoggedIn(true);

  const Home = () => <>HOME</>;

  const { container } = render(
    <MemoryRouter initialEntries={["/test/redirect"]}>
      <Routes>
        <Route path="/test/redirect" element={<RedirectIfLoggedIn />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );
  expect(container).toHaveTextContent(/HOME/);
});

test("Redirects to target if logged in", () => {
  isLoggedIn(true);

  const Target = () => <>TARGET</>;

  const { container } = render(
    <MemoryRouter initialEntries={["/test/redirect"]}>
      <Routes>
        <Route
          path="/test/redirect"
          element={<RedirectIfLoggedIn target="/target" />}
        />
        <Route path="/target" element={<Target />} />
      </Routes>
    </MemoryRouter>
  );
  expect(container).toHaveTextContent(/TARGET/);
});
