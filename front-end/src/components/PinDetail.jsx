import React, { useState, useEffect, useContext } from "react";
import {
  MdDownloadForOffline,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { BiLink } from "react-icons/bi";
import { Link, useParams } from "react-router-dom";
import { BsEmojiSmileFill } from "react-icons/bs";
import TextareaAutosize from "react-textarea-autosize";
import EmojiPicker from "emoji-picker-react";
import { v4 as uuidv4 } from "uuid";

import { client, urlFor } from "../client";
import MasonryLayout from "./MasonryLayout";
import { pinDetailMorePinQuery, pinDetailQuery } from "../utils/data";
import Spinner from "./Spinner";
import { ChangedContext } from "../contexts/ChangedContext";

const PinDetail = ({ user }) => {
  const [pins, setPins] = useState(null);
  const [pinDetail, setPinDetail] = useState(null);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const { pinId } = useParams();
  const {
    changed: { transition },
    setChanged,
  } = useContext(ChangedContext);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onEmojiClick = (emojiObj, e) => {
    setComment((prev) => prev + emojiObj.emoji);
    setShowEmojiPicker(false);
  };

  const fetchPinDetails = () => {
    let query = pinDetailQuery(pinId);

    if (query) {
      client.fetch(query).then((data) => {
        setPinDetail(data[0]);
        if (data[0]) {
          query = pinDetailMorePinQuery(data[0]);
          client.fetch(query).then((res) => {
            setPins(res);
          });
        }
      });
    }
  };

  console.log(comment);

  useEffect(() => {
    fetchPinDetails();
    setChanged("");
  }, [transition]);

  useEffect(() => {
    fetchPinDetails();
  }, [pinId]);

  const alreadySaved = !!pinDetail?.save?.filter(
    (item) => item.postedBy?._id === user?._id
  )?.length;

  const savePin = (id) => {
    if (!alreadySaved) {
      client
        .patch(id)
        .setIfMissing({ save: [] })
        .insert("after", "save[-1]", [
          {
            _key: uuidv4(),
            userId: user?._id,
            postedBy: {
              _type: "postedBy",
              _ref: user?._id,
            },
          },
        ])
        .commit()
        .then(() => {
          fetchPinDetails();
        });
    } else {
      client
        .patch(id)
        .unset([`save[userId=="${user?._id}"]`])
        .commit()
        .then(() => {
          fetchPinDetails();
        });
    }
  };

  const addComment = () => {
    if (comment) {
      setAddingComment(true);

      client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .insert("after", "comments[-1]", [
          {
            comment,
            _key: uuidv4(),
            postedBy: {
              _type: "postedBy",
              _ref: user._id,
            },
          },
        ])
        .commit()
        .then(() => {
          fetchPinDetails();
          setComment("");
          setAddingComment(false);
        });
    }
  };

  if (!pinDetail) return <Spinner message={"Loading pin..."} />;

  return (
    <div className="relative">
      <div
        className="flex xl:flex-row flex-col m-auto bg-white gap-5 drop-shadow-md"
        style={{ maxWidth: "1500px", borderRadius: "32px" }}
      >
        <div className="flex justify-center items-center md:items-start flex-initial">
          <img
            className="rounded-l-3xl object-fill"
            src={pinDetail?.image && urlFor(pinDetail?.image).url()}
            alt="user-post"
          />
        </div>
        <div className="w-full p-5 flex-1 xl:min-w-620">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start gap-2">
              <div className="flex gap-2 items-center">
                <a
                  href={`${pinDetail.image.asset.url}?dl=`}
                  download
                  className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
                >
                  <MdDownloadForOffline />
                </a>
              </div>
              <div className="flex gap-2 items-center">
                <div
                  onClick={copyLink}
                  className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100 cursor-pointer"
                >
                  <BiLink />
                </div>
              </div>

              <a
                href={pinDetail.destination}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-1"
              >
                {pinDetail.destination?.slice(8)}
              </a>
            </div>
            {alreadySaved ? (
              <button
                type="button"
                className="bg-gray-900 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                onClick={() => {
                  savePin(pinDetail._id);
                }}
              >
                Saved
              </button>
            ) : (
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                onClick={() => {
                  savePin(pinDetail._id);
                }}
              >
                Save
              </button>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-semibold break-words mt-3 ">
              {pinDetail.title}
            </h1>
            <p className="mt-3 break-words">{pinDetail.about}</p>
          </div>
          <Link
            to={`/user-profile/${pinDetail?.postedBy._id}`}
            className="flex gap-2 mt-5 items-center bg-white rounded-lg "
          >
            <img
              src={pinDetail?.postedBy.image}
              className="w-10 h-10 rounded-full"
              alt="user-profile"
            />
            <p className="font-bold">{pinDetail?.postedBy.userName}</p>
          </Link>
          <div className="flex gap-2 justify-start items-center mt-5">
            <h2 className="text-2xl">{pinDetail.comments?.length} Comments</h2>
            <button
              onClick={() => setShowComments((state) => !state)}
              className="hover:bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
            >
              {showComments ? (
                <MdKeyboardArrowDown fontSize={20} />
              ) : (
                <MdKeyboardArrowRight fontSize={20} />
              )}
            </button>
          </div>
          {showComments && (
            <>
              <div className="max-h-370 overflow-y-auto scrollbar">
                {pinDetail.comments?.map((item, index) => (
                  <div
                    className="flex gap-2 mt-5 items-start bg-white rounded-lg"
                    key={index}
                  >
                    <img
                      src={item.postedBy.image}
                      alt="user-profile"
                      className="w-10 h-10 rounded-full cursor-pointer"
                    />
                    <div className="flex flex-col min-w-min">
                      <p className="font-bold">{item.postedBy?.userName}</p>
                      <p className="break-all">{item.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex mt-6 gap-3">
                <Link to={`/user-profile/${user?._id}`}>
                  <img
                    src={user?.image}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    alt="user-profile"
                  />
                </Link>
                <div className="flex justify-between items-center relative w-11/12 gap-2">
                  <TextareaAutosize
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment"
                    className="flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300 resize-none"
                  />
                  <BsEmojiSmileFill
                    fontSize={25}
                    className="text-amber-400 cursor-pointer"
                    onClick={() => setShowEmojiPicker((state) => !state)}
                  />
                  {showEmojiPicker && (
                    <div className="absolute right-10">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                  onClick={addComment}
                >
                  {addingComment ? "Doing..." : "Done"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {pins?.length > 0 && (
        <h2 className="text-center font-bold text-2xl mt-8 mb-4">
          More like this
        </h2>
      )}
      {pins ? (
        <MasonryLayout pins={pins} />
      ) : (
        <Spinner message="Loading more pins" />
      )}
      {copied && (
        <div className="fixed bottom-10 inset-x-0 flex justify-center items-center animate-slide-bottom-in">
          <div className="h-80 w-80 bg-gray-900 rounded-full flex justify-center items-center p-5">
            <p className="text-center text-lg text-white">
              Copied link to your clipboard to share
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinDetail;
