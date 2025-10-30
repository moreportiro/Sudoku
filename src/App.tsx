import { useContext, useEffect, useState } from "react";
import type { Board as BoardType, CellValue } from "./types/sudoku.types";
import { generateSudoku, validateBoard } from "./utils/sudokuLogic";
import { Board } from "./components/Board";
import { AuthContext } from "./context/AuthContext";
import { Modal } from "./components/Modal";
import { AuthForm } from "./components/AuthForm";
import { GameHistory } from "./components/GameHistory";

// тип для координат выбранной ячейки
type SelectedCell = { row: number; col: number } | null;

export default function App() {
  // <BoardType> тип данных в котором будут храниться данные
  const [board, setBoard] = useState<BoardType>(generateSudoku());
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [wins, setWins] = useState<string[]>([]);

  const auth = useContext(AuthContext);

  // глобальный слушатель нажатий клавиш
  useEffect(() => {
    // каждый раз при нажатии на клавишу
    const handleKeyDown = (event: KeyboardEvent) => {
      // если ни одна ячейка не выбрана, ничего не делает
      if (!selectedCell || isGameWon) return;

      const { row: r, col: c } = selectedCell;

      // очистка ячейки
      if (event.key === "Backspace" || event.key === "Delete") {
        updateCellValue(r, c, null);
        return;
      }

      // является ли нажатая клавиша цифрой от 1 до 9
      const isDigit = /^[1-9]$/.test(event.key);
      if (isDigit) {
        // Преобразуем строку (event.key) в число.
        const digit = parseInt(event.key) as CellValue;
        updateCellValue(r, c, digit);
      }
    };

    // слушатель к объекту window (на всю страницу).
    window.addEventListener("keydown", handleKeyDown);

    // при размонтировании компонента, чтобы избежать утечек памяти
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCell, board, isGameWon]);

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

    // обновляет значение только в нужной ячейке, если она редактируемая
    if (newBoard[row][col].isEditable) {
      newBoard[row][col].value = value;
      const validatedBoard = validateBoard(newBoard);
      setBoard(validatedBoard);
      checkWinCondition(validatedBoard);
    }
  };

  // функция для проверки условия победы
  const checkWinCondition = (currentBoard: BoardType) => {
    const isComplete = currentBoard.flat().every((cell) => cell.value !== null);
    const hasErrors = currentBoard.flat().some((cell) => cell.isInvalid);

    if (isComplete && !hasErrors) {
      // чтобы избежать повторной отправки данных
      if (!isGameWon) {
        setIsGameWon(true);
      }
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
    setBoard(generateSudoku(1)); // генерирует новую доску
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
      <button
        onClick={handleNewGame}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Новая игра
      </button>
      <Board
        board={board}
        selectedCell={selectedCell}
        onCellClick={handleCellClick}
      />
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
