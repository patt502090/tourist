import React from "react";
import AppFooter from "./Footer";
import AppNavbar from "./Navbar";


const UserLayout = ({ children }) => {
  return (
    <div>
      {/* <AppNavbar /> */}

      <main>{children}</main>

      <AppFooter />
    </div>
  );
};

export default UserLayout;
