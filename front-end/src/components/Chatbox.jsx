import React, { useEffect, useState, useContext } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { BiSend } from "react-icons/bi";
import { userQuery, usersQuery, conversationQuery } from "../utils/data";
import { client } from "../client";
import { v4 as uuidv4 } from "uuid";
import { fetchUser } from "../utils/fetchUser";
import Spinner from "./Spinner";
import { MessageUpdateContext } from "../contexts/MessageUpdateContext";

const Chatbox = () => {
  const [showInbox, setShowInbox] = useState(false);
  const [showInboxDetail, setShowInboxDetail] = useState(false);
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(null);
  const { changed, setChanged } = useContext(MessageUpdateContext);

  const localStorageUser = fetchUser();
  const currentUserQuery = userQuery(localStorageUser.sub);
  const query = usersQuery();

  const conversationId =
    user?._id > currentUser?._id
      ? user?._id + currentUser?._id
      : currentUser?._id + user?._id;

  const query2 = conversationQuery(conversationId);

  const createConversation = () => {
    const doc = {
      _id: conversationId,
      _type: "conversation",
      members: [
        { ...user, _key: uuidv4() },
        { ...currentUser, _key: uuidv4() },
      ],
    };
    client.createIfNotExists(doc);
  };

  const sendMessage = () => {
    if (message.length > 0) {
      client
        .patch(conversationId)
        .setIfMissing({ messages: [] })
        .insert("after", "messages[-1]", [
          {
            _key: uuidv4(),
            message,
            postedBy: {
              _type: "postedBy",
              _ref: currentUser._id,
            },
          },
        ])
        .commit();
      setMessage("");
    }
  };

  useEffect(() => {
    client.fetch(query2).then((data) => {
      setMessages(data[0]?.messages);
      setChanged("");
    });
  }, [changed]);

  useEffect(() => {
    if (user) createConversation();
  }, [user]);

  useEffect(() => {
    client.fetch(query).then((data) => {
      setUsers(data);
    });
    client.fetch(currentUserQuery).then((data) => {
      setCurrentUser(data[0]);
    });
    client.fetch(query2).then((data) => {
      setMessages(data[0]?.messages);
    });
  }, [showInbox, showInboxDetail]);

  return (
    <div className="relative">
      <div
        onClick={() => {
          setShowInbox((state) => !state);
          setShowInboxDetail(false);
        }}
        className="flex justify-center items-center w-12 h-12 hover:bg-gray-200 cursor-pointer rounded-full"
      >
        <AiOutlineMessage fontSize={25} color="#343a40" />
      </div>
      {showInbox && (
        <div className="absolute top-14 -left-28 z-20 w-72 h-96 overflow-y-auto bg-white rounded-lg shadow-md animate-slide-top-in">
          <p className="text-base font-bold text-center p-3">Inbox</p>
          {users?.map((user, index) => {
            if (user._id !== currentUser._id)
              return (
                <div
                  key={index}
                  onClick={() => {
                    setShowInboxDetail(true);
                    setUser(user);
                  }}
                  className="flex justify-start items-center gap-2 p-3 mx-2 my-2 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  <img src={user.image} className="w-10 h-10 rounded-full" />
                  <p>{user.userName}</p>
                </div>
              );
          })}
        </div>
      )}
      {showInboxDetail && (
        <div className="absolute flex justify-between flex-col top-14 -left-28 z-20 w-72 h-96 overflow-y-auto bg-white rounded-lg shadow-md animate-slide-top-in">
          <div className="flex justify-center items-center gap-2 bg-slate-50">
            <div
              onClick={() => {
                setShowInboxDetail(false);
                setShowInbox(true);
                setMessages(null);
              }}
              className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <IoIosArrowBack fontSize={20} />
            </div>
            <p className="text-base font-base text-center p-3 mr-6">
              {user.userName}
            </p>
          </div>
          <div className="flex flex-col h-full gap-3 overflow-y-auto">
            {messages ? (
              messages.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`flex ${
                      currentUser._id === item.postedBy._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="flex justify-start items-center p-3 w-max rounded-xl bg-gray-100 mx-2 scrollbar">
                      <p className="text-base">{item.message}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <Spinner />
            )}
          </div>
          <div className="flex justify-around items-center bg-slate-50">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message"
              className="border-gray-100 outline-none border-2 w-4/5 p-2 my-3 rounded-2xl focus:border-gray-300 resize-none"
            />

            <button
              onClick={sendMessage}
              className="flex justify-center items-center hover:bg-gray-200 w-10 h-10 rounded-full"
            >
              <BiSend fontSize={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
