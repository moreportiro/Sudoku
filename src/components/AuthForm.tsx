import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface AuthFormProps {
  onSuccess: () => void; // функция, которая вызовется после успешного входа
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const auth = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLoginMode ? "/api/login" : "/api/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Произошла ошибка");
      }

      if (isLoginMode) {
        auth?.login(data.token);
        onSuccess(); // вызывает колбэк для закрытия модального окна
      } else {
        alert("Регистрация прошла успешно! Теперь вы можете войти.");
        setIsLoginMode(true); // переключает на режим входа
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-80">
      <h2 className="text-2xl font-bold mb-4">
        {isLoginMode ? "Вход" : "Регистрация"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Имя пользователя"
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full p-2 border rounded mb-4"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {isLoginMode ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
      <button
        onClick={() => setIsLoginMode(!isLoginMode)}
        className="mt-4 text-sm text-blue-500 hover:underline"
      >
        {isLoginMode
          ? "Нет аккаунта? Зарегистрироваться"
          : "Уже есть аккаунт? Войти"}
      </button>
    </div>
  );
}
