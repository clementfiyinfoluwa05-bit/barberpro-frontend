import { createContext, useContext, useState } from "react";
import { readJSON, writeJSON, remove } from "../utils/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJSON("user"));

  const login = (userData) => {
    writeJSON("user", userData);
    setUser(userData);
  };

  const logout = () => {
    remove("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
