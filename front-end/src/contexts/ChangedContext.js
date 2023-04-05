import React, { useContext, useState } from "react";
import { client } from "../client";

export const ChangedContext = React.createContext();

export const useChanged = () => useContext(ChangedContext);

export const ChangedProvider = ({ children }) => {
  const [changed, setChanged] = useState({});
  const query = `*[_type == "pin"]`;

  client.listen(query).subscribe((update) => {
    setChanged(update);
  });

  const value = { changed, setChanged };

  return (
    <ChangedContext.Provider value={value}>{children}</ChangedContext.Provider>
  );
};
