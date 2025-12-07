"use client";
import Footer from "../Components/Global/Footer.jsx";
import Navbar from "../Components/Global/Navbar.jsx";
import Upload from "./../Components/Upload/Index.jsx";
import { useAuth } from "./../Hooks/Auth.jsx";

function Index() {
  const { user, loading } = useAuth();
  if (loading) return <div className="hidden">Loading...</div>;
  return (
    <>
      <Navbar />
      <Upload />
      <Footer />
    </>
  );
}

export default Index;
