import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./config/supabase";
import Register from "./pages/Register";
import Home from "./pages/Home";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Creating and managing user authentication session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route
          path="/login"
          element={session ? <Navigate to="/home" replace /> : <Register />}
        />

        {/* PROTECTED ROUTE */}
        <Route
          path="/home"
          element={session ? <Home /> : <Navigate to="/login" replace />}
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to={session ? "/home" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
