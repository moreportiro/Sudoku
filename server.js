import express from "express";
const app = express();
const port = 3001;

// middleware, который будет выполняться для каждого входящего запроса
// express.json() автоматически разбирает тело запроса, если оно в формате JSON и помещает результат в req.body
app.use(express.json());

// endpoint (конечная точка API), который будет слушать POST-запросы
// по адресу /api/save-win (Vite перенаправит сюда запросы с фронтенда)
app.post("/api/save-win", (req, res) => {
  const { playerName, solvedAt } = req.body;

  // проверка, что данные пришли
  if (!playerName || !solvedAt) {
    // если каких-то данных нет, отправляет ошибку 400 "Bad Request"
    return res.status(400).json({ error: "Не все данные были предоставлены" });
  }

  // ИМИТАЦИЯ ЗАПИСИ В 1С
  console.log("--- ПОЛУЧЕН ЗАПРОС НА СОХРАНЕНИЕ ПОБЕДЫ ---");
  console.log(`Имя игрока: ${playerName}`);
  console.log(`Время победы: ${new Date(solvedAt).toLocaleString("ru-RU")}`);
  console.log("Статус: Имитация успешной записи в 1С завершена.");
  console.log("-------------------------------------------");

  res.status(200).json({ message: "Результат успешно сохранен (имитация)" });
});

// запускает сервер и заставляет слушать входящие запросы на указанном порту
app.listen(port, () => {
  console.log(
    `API сервер запущен и готов к имитации на http://localhost:${port}`
  );
});
