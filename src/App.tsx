import React, { FC } from "react";
import { Route, Routes } from "react-router-dom";
import ConfirmEmail from "./components/ConfirmEmail";
import ConfirmPasswordReset from "./components/ConfirmPasswordReset";
import Home from "./components/Home";
import Login from "./components/Login";
import Logout from "./components/Logout";
import PageNotFound from "./components/PageNotFound";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";

const App: FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/account">
      <Route path="/confirmemail/:token" element={<ConfirmEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={<Register />} />
      <Route path="/resetpassword" element={<ResetPassword />} />
      <Route
        path="/confirmpasswordreset/:token"
        element={<ConfirmPasswordReset />}
      />
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default App;
