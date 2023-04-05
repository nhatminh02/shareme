import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./components/Login";
import Home from "./container/Home";
import { ChangedProvider } from "./contexts/ChangedContext";
import { MessageUpdateProvider } from "./contexts/MessageUpdateContext";
import { fetchUser } from "./utils/fetchUser";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = fetchUser();

    if (!user) navigate("/login");
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_API_TOKEN}>
      <ChangedProvider>
        <MessageUpdateProvider>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="/*" element={<Home />} />
          </Routes>
        </MessageUpdateProvider>
      </ChangedProvider>
    </GoogleOAuthProvider>
  );
};

export default App;