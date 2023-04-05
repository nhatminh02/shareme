import React, { useContext, useState } from "react";
import { client } from "../client";

export const MessageUpdateContext = React.createContext();

export const useChanged = () => useContext(MessageUpdateContext);

export const MessageUpdateProvider = ({ children }) => {
  const [changed, setChanged] = useState({});
  const query = `*[_type == "conversation"]`;

  client.listen(query).subscribe((update) => {
    setChanged(update);
  });

  const value = { changed, setChanged };

  return (
    <MessageUpdateContext.Provider value={value}>
      {children}
    </MessageUpdateContext.Provider>
  );
};
