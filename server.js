import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const port = 3001;

// надо придумать ключ
const SECRET_KEY = "your_super_secret_key_that_is_long_and_random";
// путь к базе 1с
const BASE_1C_URL = "http://localhost/sudoku_db/hs/sudoku";

// middleware, который будет выполняться для каждого входящего запроса
// express.json() автоматически разбирает тело запроса, если оно в формате JSON и помещает результат в req.body
app.use(express.json());

// это имитирует то, как 1С будет хранить данные.
const inMemoryWinsDatabase = {};
// пример: { "user1": ["2025-10-23T10:00:00Z", "2025-10-23T11:00:00Z"], "user2": [...] }

// регистрация
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Имя пользователя и пароль обязательны" });
  }

  const password_hash = await bcrypt.hash(password, 10);

  // пока так
  console.log(`Отправка в 1С для регистрации: POST ${BASE_1C_URL}/users`);
  console.log(`Тело запроса:`, { username, password_hash });
  res.status(201).json({ message: "Запрос на регистрацию отправлен" });

  /* должно так
    try {
        const response1C = await fetch(`${BASE_1C_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password_hash }),
        });

        if (!response1C.ok) {
            const errorData = await response1C.json();
            throw new Error(errorData.error || `Ошибка 1С: ${response1C.statusText}`);
        }

        const dataFrom1C = await response1C.json();
        res.status(201).json(dataFrom1C);

    } catch (error) {
        console.error('Ошибка при регистрации в 1С:', error);
        res.status(500).json({ error: 'Не удалось связаться с сервером 1С' });
    }
    */
});

// вход
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  console.log(`Запрос данных из 1С: GET ${BASE_1C_URL}/users/${username}`);

  const match = true; // для имитации всегда пароль верный
  if (match) {
    // для токена нужны ID и имя пользователя
    const simulatedUser = { id: "guid-from-1c-simulated", username: username };
    const token = jwt.sign(simulatedUser, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Вход выполнен успешно (имитация)", token });
  } else {
    res
      .status(401)
      .json({ error: "Неверное имя пользователя или пароль (имитация)" });
  }
  /*
    try {
        // получает хэш пароля пользователя из 1С
        const response1C = await fetch(`${BASE_1C_URL}/users/${username}`);
        
        if (!response1C.ok) {
            // если 1С вернул 404 (не найдено), значит, пользователь не существует
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }

        const userFrom1C = await response1C.json(); // { id, username, password_hash }

        // сравнивает присланный пароль с хэшем из 1С
        const match = await bcrypt.compare(password, userFrom1C.password_hash);

        if (match) {
            // если пароли совпали, создаем JWT токен
            const payload = { id: userFrom1C.id, username: userFrom1C.username };
            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'Вход выполнен успешно', token });
        } else {
            res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }
    } catch (error) {
        console.error('Ошибка при входе через 1С:', error);
        res.status(500).json({ error: 'Не удалось связаться с сервером 1С' });
    }
    */
});

// проверка токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // если токена нет

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // если токен неверный
    req.user = user; // сохраняет данные пользователя в объекте запроса
    next(); // передает управление следующему обработчику
  });
};

// сохрани победу пользователя
app.post("/api/save-win", authenticateToken, (req, res) => {
  const { solvedAt } = req.body;
  const user = req.user;

  console.log(`Сохранение победы для пользователя: ${user.username}`);

  // есть ли уже записи для этого пользователя
  if (!inMemoryWinsDatabase[user.username]) {
    inMemoryWinsDatabase[user.username] = [];
  }
  // добавляет новую победу в начало массива чтобы новые были сверху
  inMemoryWinsDatabase[user.username].unshift(solvedAt);

  console.log(
    `Текущие победы для ${user.username}:`,
    inMemoryWinsDatabase[user.username]
  );
  res.status(200).json({ message: "Результат успешно сохранен" });

  /*
    try {
        const response1C = await fetch(`${BASE_1C_URL}/wins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName: user.username, solvedAt }),
        });

        if (!response1C.ok) {
            const errorData = await response1C.json();
            throw new Error(errorData.error || `Ошибка 1С: ${response1C.statusText}`);
        }

        const dataFrom1C = await response1C.json();
        res.status(200).json(dataFrom1C);

    } catch (error) {
        console.error('Ошибка при сохранении победы в 1С:', error);
        res.status(500).json({ error: 'Не удалось связаться с сервером 1С' });
    }
    */
});

// отдай список побед пользователя
app.get("/api/wins", authenticateToken, async (req, res) => {
  const username = req.user.username;

  console.log(`Запрос списка побед для пользователя: ${username}`);

  const userWins = inMemoryWinsDatabase[username] || [];

  console.log(`Отправка побед:`, userWins);
  res.json(userWins);
  /*
    try {
        const url = new URL(`${BASE_1C_URL}/wins`);
        url.searchParams.append('username', username);

        const response1C = await fetch(url.toString());

        if (!response1C.ok) {
            const errorData = await response1C.json();
            throw new Error(errorData.error || `Ошибка 1С: ${response1C.statusText}`);
        }

        const winsFrom1C = await response1C.json();
        res.status(200).json(winsFrom1C);

    } catch (error) {
        console.error('Ошибка при получении побед из 1С:', error);
        res.status(500).json({ error: 'Не удалось связаться с сервером 1С' });
    }
    */
});

// запускает сервер и заставляет слушать входящие запросы на указанном порту
app.listen(port, () => {
  console.log(`API шлюз для 1С запущен на http://localhost:${port}`);
});
