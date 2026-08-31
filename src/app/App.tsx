import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthContext";

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").toString().trim();

if (!GOOGLE_CLIENT_ID) {
  console.warn("VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
}

// export default function App() {
//   return (
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <AuthProvider>
//         <RouterProvider router={router} />
//       </AuthProvider>
//     </GoogleOAuthProvider>
//   );
// }



export default function App() {
  return (
        <RouterProvider router={router} />
  );
}