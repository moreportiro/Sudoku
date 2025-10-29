// server.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const app = express();
const port = 3001;

// --- ВАЖНЫЕ КОНСТАНТЫ ---
// В реальном проекте этот ключ нужно вынести в переменные окружения (.env файл)
const SECRET_KEY = "your_super_secret_key_that_is_long_and_random";
// URL вашей реальной публикации 1С
const BASE_1C_URL = "http://localhost/Sudoku/hs/sudoku";

app.use(express.json());

// --- ЭНДПОИНТЫ АВТОРИЗАЦИИ ---

// 1. Регистрация нового пользователя
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Имя пользователя и пароль обязательны" });
  }

  // Безопасно хешируем пароль перед отправкой в 1С
  const password_hash = await bcrypt.hash(password, 10);

  // --- РЕАЛЬНЫЙ ЗАПРОС К 1С с AXIOS ---
  try {
    const response1C = await axios.post(`${BASE_1C_URL}/users`, {
      username,
      password_hash,
    });
    res.status(201).json(response1C.data);
  } catch (error) {
    // Axios удобно кладет данные ошибки в error.response
    const errorMessage =
      error.response?.data?.error || "Ошибка на сервере 1С при регистрации";
    const status = error.response?.status || 500;
    res.status(status).json({ error: errorMessage });
  }
});

// 2. Вход пользователя
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const response1C = await axios.get(`${BASE_1C_URL}/users/${username}`);
    const userFrom1C = response1C.data;

    if (!userFrom1C || !userFrom1C.password_hash) {
      return res
        .status(401)
        .json({ error: "Неверное имя пользователя или пароль" });
    }

    // Сравниваем пароль напрямую с хэшем из 1С
    const match = await bcrypt.compare(password, userFrom1C.password_hash);

    if (match) {
      const payload = { id: userFrom1C.id, username: userFrom1C.username };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
      res.json({ message: "Вход выполнен успешно", token });
    } else {
      res.status(401).json({ error: "Неверное имя пользователя или пароль" });
    }
  } catch (error) {
    const status = error.response?.status;
    if (status === 404) {
      console.warn(`[ВХОД] Пользователь не найден в 1С: ${username}`);
      res.status(401).json({ error: "Неверное имя пользователя или пароль" });
    } else {
      console.error("[ВХОД] КРИТИЧЕСКАЯ ОШИБКА:", error.message);
      const errorMessage =
        error.response?.data?.error || "Ошибка на сервере 1С при входе";
      res.status(status || 500).json({ error: errorMessage });
    }
  }
});

// --- MIDDLEWARE и ИГРОВЫЕ ЭНДПОИНТЫ ---

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // Ошибка, если токена нет

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Ошибка, если токен неверный
    req.user = user; // Сохраняем данные пользователя в объекте запроса
    next(); // Передаем управление следующему обработчику
  });
};

// 3. Сохранение победы (защищенный эндпоинт)
app.post("/api/save-win", authenticateToken, async (req, res) => {
  const { solvedAt } = req.body;
  // req.user был добавлен в middleware authenticateToken
  const user = req.user;

  // --- РЕАЛЬНЫЙ ЗАПРОС К 1С с AXIOS ---
  try {
    const response1C = await axios.post(`${BASE_1C_URL}/wins`, {
      playerName: user.username,
      solvedAt,
    });
    res.status(200).json(response1C.data);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || "Ошибка при сохранении победы в 1С";
    res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// 4. Получение списка побед (защищенный эндпоинт)
app.get("/api/wins", authenticateToken, async (req, res) => {
  // Получаем имя пользователя из проверенного токена
  const username = req.user.username;

  // --- РЕАЛЬНЫЙ ЗАПРОС К 1С с AXIOS ---
  try {
    const response1C = await axios.get(`${BASE_1C_URL}/wins`, {
      params: { username }, // axios удобно передает GET-параметры
    });
    res.status(200).json(response1C.data);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || "Ошибка при получении истории из 1С";
    res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`API шлюз для 1С запущен на http://localhost:${port}`);
});
