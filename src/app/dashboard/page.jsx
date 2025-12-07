"use client";
import Dashboard from "./../Components/Dashboard/Index.jsx";
import { useAuth } from "./../Hooks/Auth.jsx";

function Index() {
  const { user, loading } = useAuth();
  if (loading) return <div className="hidden">Loading...</div>;
  return (
    <>
      <Dashboard />
    </>
  );
}

export default Index;
