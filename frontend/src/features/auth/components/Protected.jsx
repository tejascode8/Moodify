import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import GlobalLoader from "../../shared/components/GlobalLoader";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader status="Authenticating your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
