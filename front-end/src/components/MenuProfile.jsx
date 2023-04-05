import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Menu, Transition } from "@headlessui/react";

const MenuProfile = ({ user }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();

    navigate("/login");
  };

  return (
    <div className="text-right">
      <Menu as="div" className="relative text-left">
        <div className="flex justify-center items-center">
          <Menu.Button>
            <MdKeyboardArrowDown />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-10 right-0 mt-5 w-max origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg focus:outline-none">
            <div className="py-4 px-2 flex flex-col gap-2">
              <div className="flex flex-col justify-start gap-2">
                <p className="text-sm font-thin ml-3">Currently in</p>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate(`/user-profile/${user._id}`)}
                      className={`${
                        active ? "bg-gray-200 text-gray-900" : "text-gray-900"
                      } group flex gap-2 w-full items-center rounded-md p-3 text-sm`}
                    >
                      <img
                        src={user.image}
                        alt="user-profile"
                        className="w-12 h-12 rounded-full "
                      />
                      <div className="flex flex-col items-start">
                        <p className="font-semibold text-base">
                          {user.userName}
                        </p>
                        <p className="font-thin text-sm text-gray-500">
                          Personal
                        </p>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="flex flex-col justify-start gap-2">
                <p className="text-sm font-thin ml-3">Another options</p>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? "bg-gray-200 text-gray-900" : "text-gray-900"
                      } group flex gap-2 w-full items-center rounded-md p-3 text-sm`}
                    >
                      <p className="font-semibold text-base">Log out</p>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default MenuProfile;
