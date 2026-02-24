import { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [verified, setVerified] = useState(false);

  const verify = () => {
    setVerified(true);
    localStorage.setItem("adminVerified", "true");

    setTimeout(
      () => {
        setVerified(false);
        localStorage.removeItem("adminVerified");
      },
      10 * 60 * 1000,
    );
  };

  useEffect(() => {
    if (localStorage.getItem("adminVerified") === "true") {
      setVerified(true);
    }
  }, []);

  return (
    <AdminContext.Provider value={{ verified, verify }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
