import { useContext, useEffect, useState } from "react";
import type { Board as BoardType, CellValue } from "./types/sudoku.types";
import {
  generateSudoku,
  getNumberCounts,
  validateBoard,
} from "./utils/sudokuLogic";
import { Board } from "./components/Board";
import { AuthContext } from "./context/AuthContext";
import { Modal } from "./components/Modal";
import { AuthForm } from "./components/AuthForm";
import { GameHistory } from "./components/GameHistory";
import { Numpad } from "./components/Numpad";

// тип для координат выбранной ячейки
type SelectedCell = { row: number; col: number } | null;

export default function App() {
  // <BoardType> тип данных в котором будут храниться данные
  const [board, setBoard] = useState<BoardType>(generateSudoku(40));
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [wins, setWins] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>(
    getNumberCounts(board)
  );
  const auth = useContext(AuthContext);

  // Обновляет счетчики каждый раз, когда меняется доска
  useEffect(() => {
    setCounts(getNumberCounts(board));
  }, [board]);

  // для отображения сообщения о победе
  useEffect(() => {
    if (isGameWon) {
      alert("Поздравляем! Вы решили головоломку!");
      saveGameWin();
    }
  }, [isGameWon]);

  // сохрани победную игру
  const saveGameWin = async () => {
    if (!auth?.token || !auth.user) return; // если пользователь не авторизован, не сохраняет

    const gameData = {
      username: auth.user.username,
      solvedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/save-win", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`, // Добавляем токен
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) throw new Error("Ошибка сохранения");

      console.log("Победа успешно сохранена!");
    } catch (error) {
      console.error(error);
    }
  };

  // обновляет значение в конкретной ячейке
  const updateCellValue = (row: number, col: number, value: CellValue) => {
    // создает полную копию доски, чтобы не изменять состояние напрямую (это принцип React)
    const newBoard = board.map((rowArr) => rowArr.map((cell) => ({ ...cell })));

    // можно ли редактировать ячнйку
    if (newBoard[row][col].isEditable) {
      newBoard[row][col].value = value;

      // валидация и проверка победы
      const validatedBoard = validateBoard(newBoard);
      setBoard(validatedBoard);
      checkWinCondition(validatedBoard);
    }
  };

  // Обработчик нажатия на кнопку Numpad
  const handleNumberSelect = (num: CellValue) => {
    // Если ячейка не выбрана или игра выиграна, ничего не делает
    if (!selectedCell || isGameWon) return;

    updateCellValue(selectedCell.row, selectedCell.col, num);
  };

  // функция для проверки условия победы
  const checkWinCondition = (currentBoard: BoardType) => {
    const isComplete = currentBoard.flat().every((cell) => cell.value !== null);
    const hasErrors = currentBoard.flat().some((cell) => cell.isInvalid);

    if (isComplete && !hasErrors && !isGameWon) {
      setIsGameWon(true);
    }
  };

  // обработчик клика по ячейке
  const handleCellClick = (row: number, col: number) => {
    // нельзя выбирать ячейки после победы
    if (!isGameWon) {
      setSelectedCell({ row, col });
    }
  };

  // обработчик для кнопки "Новая игра"
  const handleNewGame = () => {
    const newBoard = generateSudoku(40); // генерирует новую доску
    setBoard(newBoard);
    setSelectedCell(null); // сбрасывает выделение
    setIsGameWon(false); // сбрасывает флаг победы
  };

  // история побед
  const fetchWinsHistory = async () => {
    if (!auth?.token || !auth.user) return;

    try {
      const response = await fetch(
        `/api/wins?username=${encodeURIComponent(auth.user.username)}`,
        {
          headers: {
            // отправляет токен, чтобы бэкенд знал, чьи победы запрашивать
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось загрузить историю");
      }

      const data: string[] = await response.json();
      setWins(data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Ошибка при загрузке истории побед.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      {/* Шапка */}
      <header className="absolute top-4 right-4">
        {auth?.user ? (
          <div className="flex items-center gap-4">
            <span>
              Привет, <strong>{auth.user.username}</strong>!
            </span>
            <button
              onClick={fetchWinsHistory}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Мои победы
            </button>
            <button
              onClick={auth.logout}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Выйти
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Войти / Регистрация
          </button>
        )}
      </header>
      <h1 className="text-4xl font-bold mb-8">Судоку</h1>

      {/* Кнопка Новая игра */}
      <button
        onClick={handleNewGame}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Новая игра
      </button>

      {/* Доска */}
      <Board
        board={board}
        selectedCell={selectedCell}
        onCellClick={handleCellClick}
      />

      {/* Кнопки */}
      <Numpad onNumberSelect={handleNumberSelect} counts={counts} />

      {/* Окно с победами */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      >
        <GameHistory wins={wins} />
      </Modal>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AuthForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
