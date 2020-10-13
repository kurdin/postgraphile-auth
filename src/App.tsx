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
    <Route path="/add-property" element={<PageNotFound />} />
    <Route path="/add-project" element={<PageNotFound />} />
    <Route path="/property" element={<PageNotFound />} />
    <Route path="/property_gallery" element={<PageNotFound />} />
    <Route path="/project" element={<PageNotFound />} />
    <Route path="/home" element={<PageNotFound />} />
    <Route path="/plan_page" element={<PageNotFound />} />
    <Route path="/select_avatar_page" element={<PageNotFound />} />
    <Route path="/template_page" element={<PageNotFound />} />
    <Route path="/templates_page" element={<PageNotFound />} />
    <Route path="/verity_page" element={<PageNotFound />} />
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default App;
