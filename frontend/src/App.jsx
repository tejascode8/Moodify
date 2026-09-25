import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app.routes";
import "./features/shared/style/global.scss";
import { AuthProvider } from "./features/auth/auth.context";
import { useAuth } from "./features/auth/hooks/useAuth";
import { SongContextProvider } from "./features/home/service/SongContext";
import GlobalLoader from "./features/shared/components/GlobalLoader";

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <GlobalLoader status="Calibrating emotional soundscapes..." />;
  }

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <SongContextProvider>
        <AppContent />
      </SongContextProvider>
    </AuthProvider>
  );
}

export default App;
