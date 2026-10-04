import {
  useMemo,
  useState,
} from "react";

import AuthContext from "./authContext.js";

import {
  getStoredUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = async (credentials) => {
    const authenticatedUser = await loginUser(credentials);

    setUser(authenticatedUser);

    return authenticatedUser;
  };

  const signup = async (payload) => {
    const registeredUser = await registerUser(payload);

    setUser(registeredUser);

    return registeredUser;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
    }),
    [user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
