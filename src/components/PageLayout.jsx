import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Preloader from "./Preloader";
export default function PageLayout() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  return (
    <>
      <Preloader visible={loading} />
      <Outlet />
    </>
  );
}
