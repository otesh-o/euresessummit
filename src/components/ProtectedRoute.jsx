import { Navigate, useLocation } from "react-router-dom";
import { AUTH_TOKEN_KEY } from "../lib/api";

const readToken = () => {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    // Safari private mode / blocked storage: treat as signed out.
    return null;
  }
};

/**
 * Gate for the dashboard route. Reads the auth token from sessionStorage
 * (key "eureses_admin_token") and redirects to the login page when it is
 * missing, otherwise renders the protected route.
 *
 * This is the second lock, not the only one: /admin already redirects to
 * /admin/login unconditionally, so reaching this component at all means
 * someone deliberately typed /admin/dashboard. This catches that case.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!readToken()) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
