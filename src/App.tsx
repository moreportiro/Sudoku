import { useState } from "react";
import type { Board as BoardType } from "./types/sudoku.types";
import { generateEmptyBoard } from "./utils/sudokuLogic";
import { Board } from "./components/Board";

export default function App() {
  // <BoardType> тип данных в котором будут храниться данные
  const [board, setBoard] = useState<BoardType>(generateEmptyBoard());

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Судоку</h1>
      <Board board={board} />
    </div>
  );
}
