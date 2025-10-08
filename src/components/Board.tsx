import { Cell } from "./Cell";
import type { Board as BoardType } from "../types/sudoku.types";

// принимает тип
interface BoardProps {
  board: BoardType;
}

export function Board({ board }: BoardProps) {
  return (
    <div className="grid grid-cols-9 border-4 border-gray-800">
      {/*внешний мап проходит по строкам(преобразует данные массива в jsx-элементы) */}
      {board.map((row, rowIndex) =>
        //   внутренний мап проходит по ячейкам текущей строки
        row.map((cell, colIndex) => (
          //   уникальный ключ для отслеживания что изменилось в ячейке
          <Cell key={`${rowIndex}-${colIndex}`} cell={cell} />
        ))
      )}
    </div>
  );
}
