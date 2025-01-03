import { useContext, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import logo from "../imgs/logo.png";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel,setUserNavPanel]=useState(false);

  const { userAuth } = useContext(UserContext) || {};
  const access_token = userAuth?.access_token;
  const profile_img = userAuth?.profile_img;

  const toggleSearchBox = () => {
    setSearchBoxVisibility((currentVal) => !currentVal);
  };
  //on click on profile
  const handleUserNavPanel= () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  //onclick outside the Navelements of User Panel
  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    },200);

  };

  return (
    <>
      <nav className="navbar flex items-center py-4 px-6 bg-white shadow-md">
        <Link to="/" className="flex-none w-14">
          <img src={logo} alt="logo" className="w-full" />
        </Link>

        <div
          className={`absolute bg-white w-full left-0 top-full mt-1 border-b border-gray-200 py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto ${
            searchBoxVisibility ? "block" : "hidden"
          }`}
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-gray-100 p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder-gray-500 md:pl-12"
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center"
            onClick={toggleSearchBox}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>

          <Link to="/editor" className="hidden md:flex gap-2 items-center text-gray-700">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>

          {access_token ? (
            <>
              <Link to="/dashboard/notification">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                </button>
              </Link>
              <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}
              >
              <button className="w-12 h-12 mt-1">
                  <img src={profile_img} className="w-full h-full object-cover rounded-full" />
              </button>

              {userNavPanel ? <UserNavigationPanel/> :""}

              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2 px-4 rounded-full text-white bg-blue-600" to="/signin">
                Sign In
              </Link>
              <Link
                className="btn-light py-2 px-4 rounded-full hidden md:block text-blue-600 border border-blue-600"
                to="/signup"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
