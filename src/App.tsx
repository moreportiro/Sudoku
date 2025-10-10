import { useEffect, useState } from "react";
import type { Board as BoardType, CellValue } from "./types/sudoku.types";
import { generateSudoku } from "./utils/sudokuLogic";
import { Board } from "./components/Board";

// тип для координат выбранной ячейки
type SelectedCell = { row: number; col: number } | null;

export default function App() {
  // <BoardType> тип данных в котором будут храниться данные
  const [board, setBoard] = useState<BoardType>(generateSudoku());
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  // глобальный слушатель нажатий клавиш
  useEffect(() => {
    // каждый раз при нажатии на клавишу
    const handleKeyDown = (event: KeyboardEvent) => {
      // если ни одна ячейка не выбрана, ничего не делает
      if (!selectedCell) return;

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
  }, [selectedCell, board]);

  // обновляет значение в конкретной ячейке
  const updateCellValue = (row: number, col: number, value: CellValue) => {
    // создает полную копию доски, чтобы не изменять состояние напрямую (это принцип React)
    const newBoard = board.map((rowArr) => rowArr.map((cell) => ({ ...cell })));

    // обновляет значение только в нужной ячейке, если она редактируемая
    if (newBoard[row][col].isEditable) {
      newBoard[row][col].value = value;
      setBoard(newBoard);
    }
  };

  // обработчик клика по ячейке
  const handleCellClick = (row: number, col: number) => {
    // устанавливает выбранную ячейку в состояние
    setSelectedCell({ row, col });
  };

  // обработчик для кнопки "Новая игра"
  const handleNewGame = () => {
    setBoard(generateSudoku(40)); // генерирует новую доску
    setSelectedCell(null); // сбрасывает выделение
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
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
    </div>
  );
}
