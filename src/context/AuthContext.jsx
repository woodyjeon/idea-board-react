import { createContext, useContext, useEffect, useState } from "react";
import LoginModal from "../components/LoginModal";
import {
  getCurrentUser,
  loginWithEmail,
  logout,
  signupWithEmail,
  subscribeToAuthChanges,
} from "../lib/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((profile) => {
        if (isMounted) setUser(profile);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const { data } = subscribeToAuthChanges((profile) => {
      if (isMounted) {
        setUser(profile);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  function openLogin() {
    setLoginModalOpen(true);
  }

  function closeLogin() {
    setLoginModalOpen(false);
  }

  async function login(email, password) {
    const result = await loginWithEmail(email, password);
    if (result.error) return result.error;

    setUser(result.user);
    closeLogin();
    return null;
  }

  async function signup(formData) {
    const result = await signupWithEmail(formData);
    if (result.error) return result.error;

    setUser(result.user);
    closeLogin();
    return null;
  }

  async function signOut() {
    await logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isLoading,
        login,
        signup,
        logout: signOut,
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
