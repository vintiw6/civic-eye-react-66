
import React from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">CitizenAlert</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
