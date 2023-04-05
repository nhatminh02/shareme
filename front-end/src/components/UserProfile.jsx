import React, { useContext, useEffect, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";

import {
  userCreatedPinsQuery,
  userQuery,
  userSavedPinsQuery,
} from "../utils/data";
import { client } from "../client";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { fetchUser } from "../utils/fetchUser";
import { ChangedContext } from "../contexts/ChangedContext";

const activeBtnStyles =
  "border-b-4 border-gray-900 text-black font-bold p-2 rounded-sm w-20 outline-none";
const notActiveBtnStyles =
  "hover:bg-gray-100 text-black font-bold p-2 rounded-sm w-20 outline-none";

const UserProfile = () => {
  const [user, setUser] = useState();
  const [pins, setPins] = useState();
  const [text, setText] = useState("Created");
  const [activeBtn, setActiveBtn] = useState("created");
  const navigate = useNavigate();
  const { userId } = useParams();
  const {
    changed: { transition },
    setChanged,
  } = useContext(ChangedContext);

  const User = fetchUser();

  useEffect(() => {
    const query = userQuery(userId);
    client.fetch(query).then((data) => {
      setUser(data[0]);
    });
  }, [userId]);

  useEffect(() => {
    if (text === "Created") {
      const createdPinsQuery = userCreatedPinsQuery(userId);

      client.fetch(createdPinsQuery).then((data) => {
        setPins(data);
        setChanged("");
      });
    } else {
      const savedPinsQuery = userSavedPinsQuery(userId);

      client.fetch(savedPinsQuery).then((data) => {
        setPins(data);
        setChanged("");
      });
    }
  }, [text, userId, transition]);

  const logout = () => {
    localStorage.clear();

    navigate("/login");
  };

  if (!user) return <Spinner message="Loading profile" />;

  return (
    <div className="relative pb-2 h-full justify-center items-center">
      <div className="flex flex-col pb-5">
        <div className="relative flex flex-col mb-3">
          <div className="flex flex-col mt-10 justify-center items-center">
            <img
              className="rounded-full w-20 h-20 object-cover"
              src={user.image}
              alt="user-pic"
            />
          </div>
          <h1 className="font-bold text-3xl text-center mt-3">
            {user.userName}
          </h1>
        </div>
        <div className="p-2 flex justify-center items-center mb-5">
          {userId === User.sub && (
            <button
              className="flex justify-center items-center gap-2 bg-gray-100 font-semibold px-5 py-3 rounded-full cursor-pointer outline-none"
              onClick={logout}
            >
              Logout
              <AiOutlineLogout fontSize={20} />
            </button>
          )}
        </div>
        <div className="flex justify-center items-start gap-5 mb-7">
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("created");
            }}
            className={`${
              activeBtn === "created" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Created
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("saved");
            }}
            className={`${
              activeBtn === "saved" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Saved
          </button>
        </div>

        <div className="px-2">
          <MasonryLayout pins={pins} />
        </div>

        {pins?.length === 0 && (
          <div className="flex flex-col gap-5 justify-center items-center w-full mt-7">
            <p className="font-bold text-2xl">No Pins Found</p>
            <button
              type="button"
              onClick={() => {
                navigate("/create-pin");
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-full w-28 outline-none"
            >
              Create Pin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
