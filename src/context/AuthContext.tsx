import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // этот эффект будет срабатывать при изменении токена
    if (token) {
      localStorage.setItem("token", token);
      try {
        const decodedUser: User = jwtDecode(token); // расшифровка токена, чтобы получить данные пользователя
        setUser(decodedUser);
      } catch (error) {
        // если токен невалидный, выходит из системы
        console.error("Неверный токен", error);
        logout();
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
