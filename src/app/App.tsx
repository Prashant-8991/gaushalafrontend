import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthContext";
import { BootLoader } from "./components/ui/loader";

function App() {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence>
        {booting && <BootLoader key="boot" />}
      </AnimatePresence>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
