import React, { useState, Fragment, useEffect } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { RiErrorWarningFill } from "react-icons/ri";
import { BsEmojiSmileFill } from "react-icons/bs";
import { RiArrowUpDownLine } from "react-icons/ri";
import { AiOutlineCheck } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import EmojiPicker from "emoji-picker-react";
import { Listbox, Transition } from "@headlessui/react";

import { client } from "../client";
import Spinner from "./Spinner";
import { categories } from "../utils/data";

const CreatePin = ({ user }) => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [imageAsset, setImageAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [wrongImageType, setWrongImageType] = useState(false);
  const [imageField, setImageField] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const navigate = useNavigate();

  const savePin = () => {
    if (imageAsset?._id) {
      const doc = {
        _type: "pin",
        title,
        about,
        destination,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset?._id,
          },
        },
        userId: user._id,
        postedBy: {
          _type: "postedBy",
          _ref: user._id,
        },
        category: category.name,
      };
      client.create(doc).then(() => {
        navigate("/");
      });
    } else {
      setError(true);
      setImageField(false);
      setWrongImageType(false);
    }
  };

  const onEmojiClick = (emojiObj, e) => {
    setAbout((prev) => prev + emojiObj.emoji);
    setShowEmojiPicker(false);
  };

  const uploadImage = (e) => {
    const { type, name } = e.target.files[0];

    if (
      type === "image/png" ||
      type === "image/svg" ||
      type === "image/jpeg" ||
      type === "image/gif" ||
      type === "image/tiff"
    ) {
      setError(false);
      setLoading(true);

      client.assets
        .upload("image", e.target.files[0], {
          contentType: type,
          filename: name,
        })
        .then((doc) => {
          setImageAsset(doc);
          setLoading(false);
        })
        .catch((err) => {
          console.log("Image upload failed", err);
        });
    } else {
      setError(true);
      setWrongImageType(true);
      setImageField(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
      <div className="flex lg:flex-row flex-col justify-center items-start rounded-md bg-white lg:p-5 p-3 lg:w-4/5 w-full">
        <div
          className={
            error
              ? `bg-red-100 border-2 border-rose-500 rounded-md p-3 flex flex-0.7 w-full`
              : `bg-secondaryColor rounded-md p-3 flex flex-0.7 w-full`
          }
        >
          <div className="flex justify-center items-center flex-col border-2 border-dashed border-gray-300 rounded-md p-3 w-full h-420">
            {loading && <Spinner />}
            {error && (
              <div className="flex flex-col justify-center items-center">
                <RiErrorWarningFill
                  fontSize={40}
                  className="mb-5 text-red-700"
                />
                <p className="text-2xl text-red-700 text-center">
                  {wrongImageType
                    ? "Your upload failed because it's the wrong format."
                    : !imageField
                    ? "An image is required to create a Pin."
                    : null}
                </p>
              </div>
            )}
            {!imageAsset ? (
              <label className="cursor-pointer">
                <div className="flex flex-col items-center justify-center h-full">
                  {!error && (
                    <div className="flex flex-col justify-center items-center">
                      <p className="font-bold text-2xl">
                        <AiOutlineCloudUpload />
                      </p>
                      <p className="text-lg">Click to upload</p>
                    </div>
                  )}
                  <p
                    className={
                      error
                        ? `mt-32 text-red-700 text-center`
                        : `mt-32 text-gray-400 text-center`
                    }
                  >
                    Recommendation: Use high-quality .jpg files less than 20MB
                  </p>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  onChange={uploadImage}
                  className="w-0 h-0"
                />
              </label>
            ) : (
              <div className="relative h-full">
                <img
                  src={imageAsset?.url}
                  alt="uploaded-pic"
                  className="w-full h-full rounded-md"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                  onClick={() => setImageAsset(null)}
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
          <TextareaAutosize
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add your title"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2 focus:border-sky-400 resize-none"
          />
          {user && (
            <div className="flex gap-2 my-2 items-center bg-white rounded-lg">
              <img
                src={user.image}
                className="w-10 h-10 rounded-full"
                alt="user-profile"
              />
              <p className="font-semibold">{user.userName}</p>
            </div>
          )}
          <div className="flex justify-center items-center relative">
            <TextareaAutosize
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell everyone what your Pin is about"
              className="outline-none text-sm border-b-2 border-gray-200 p-2 focus:border-sky-400 resize-none pt-4 w-full"
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
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Add a destination link"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2 focus:border-sky-400 resize-none pt-4 w-full"
          />
          <div className="flex flex-col">
            <div>
              <p className="mb-2 font-semibold text:lg sm:text-xl text-gray-700">
                Choose Pin Category
              </p>
              <Listbox value={category} onChange={setCategory}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md outline-none sm:text-sm">
                    <span className="flex items-center gap-2 capitalize">
                      <img
                        src={category.image}
                        alt="category-image"
                        className="w-10 h-10 rounded-full"
                      />
                      {category.name}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <RiArrowUpDownLine
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm scrollbar">
                      {categories.map((category, index) => (
                        <Listbox.Option
                          key={index}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? "bg-gray-100" : "text-gray-900"
                            }`
                          }
                          value={category}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`capitalize flex items-center gap-2 ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                <img
                                  src={category.image}
                                  alt="category-image"
                                  className="w-10 h-10 rounded-full"
                                />
                                {category.name}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600">
                                  <AiOutlineCheck />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
          <div className="flex justify-end items-end mt-5">
            <button
              type="button"
              onClick={savePin}
              className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none"
            >
              Save Pin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
