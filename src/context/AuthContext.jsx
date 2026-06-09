import { createContext, useContext, useEffect, useState } from "react";
import LoginModal from "../components/LoginModal";
import {
  ensureDefaultUser,
  getSession,
  loginUser,
  logoutUser,
  signupUser,
} from "../lib/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    ensureDefaultUser();
    setUser(getSession());
  }, []);

  function openLogin() {
    setLoginModalOpen(true);
  }

  function closeLogin() {
    setLoginModalOpen(false);
  }

  function login(email, password) {
    const result = loginUser(email, password);
    if (result.error) return result.error;

    setUser(result.user);
    closeLogin();
    return null;
  }

  function signup(formData) {
    const result = signupUser(formData);
    if (result.error) return result.error;

    setUser(result.user);
    closeLogin();
    return null;
  }

  function logout() {
    logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        login,
        signup,
        logout,
        openLogin,
        closeLogin,
      }}
    >
      {children}
      <LoginModal isOpen={loginModalOpen} onClose={closeLogin} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
