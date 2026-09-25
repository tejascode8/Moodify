import React, { createContext, useState, useEffect, useCallback } from "react";
import { getMe, updateUserTheme } from "./services/auth.api";
import AuthModal from "./components/AuthModal";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("moodify_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Global Auth Modal State
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    initialMode: "login",
    title: "Sign In Required",
    message: "Register or sign in to your personal account to customize soundscapes, save favorites, and manage tracks.",
    onSuccess: null,
  });

  const isRegistered = Boolean(user && !user.isDemo);

  const openAuthModal = useCallback(({ mode = "login", title, message, onSuccess } = {}) => {
    setAuthModal({
      isOpen: true,
      initialMode: mode,
      title: title || (mode === "login" ? "Sign In to Moodify" : "Create an Account"),
      message: message || "Register or sign in to your personal account to customize soundscapes, save favorites, and manage tracks.",
      onSuccess: onSuccess || null,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const requireAuth = useCallback(
    (actionCallback, options = {}) => {
      if (isRegistered) {
        if (typeof actionCallback === "function") {
          actionCallback();
        }
        return true;
      }

      openAuthModal({
        ...options,
        onSuccess: () => {
          if (typeof actionCallback === "function") {
            actionCallback();
          }
        },
      });
      return false;
    },
    [isRegistered, openAuthModal]
  );

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    async function checkAuth() {
      try {
        const data = await getMe();
        if (isMounted) {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem("moodify_user", JSON.stringify(data.user));

            // If the registered user has a saved theme in the database, apply it
            if (data.user.theme) {
              document.documentElement.setAttribute("data-theme", data.user.theme);
              localStorage.setItem("moodify_theme", data.user.theme);
            }
          } else {
            const savedUser = localStorage.getItem("moodify_user");
            if (!savedUser) {
              setUser(null);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          const savedUser = localStorage.getItem("moodify_user");
          if (!savedUser) {
            setUser(null);
          }
        }
      } finally {
        const elapsed = Date.now() - startTime;
        const minLoadingDelay = Math.max(0, 450 - elapsed);
        setTimeout(() => {
          if (isMounted) {
            setLoading(false);
            if (typeof window !== "undefined" && window.dismissAppPreloader) {
              window.dismissAppPreloader();
            }
          }
        }, minLoadingDelay);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveUserSession = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("moodify_user", JSON.stringify(userData));
      if (userData.theme) {
        document.documentElement.setAttribute("data-theme", userData.theme);
        localStorage.setItem("moodify_theme", userData.theme);
      }
    } else {
      localStorage.removeItem("moodify_user");
    }
  };

  const updateThemePreference = async (newTheme) => {
    localStorage.setItem("moodify_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    if (user && !user.isDemo) {
      const updatedUser = { ...user, theme: newTheme };
      saveUserSession(updatedUser);
      await updateUserTheme(newTheme);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: saveUserSession,
        loading,
        setLoading,
        updateThemePreference,
        isRegistered,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.initialMode}
        title={authModal.title}
        message={authModal.message}
        onSuccess={() => {
          if (authModal.onSuccess) {
            authModal.onSuccess();
          }
        }}
      />
    </AuthContext.Provider>
  );
};

