import { Cell } from "./Cell";
import type { Board as BoardType } from "../types/sudoku.types";

type SelectedCell = { row: number; col: number } | null;

// принимает тип
interface BoardProps {
  board: BoardType;
  selectedCell: SelectedCell;
  onCellClick: (row: number, col: number) => void;
}

export function Board({ board, selectedCell, onCellClick }: BoardProps) {
  return (
    <div className="grid grid-cols-9 border-4 border-gray-800">
      {/*внешний мап проходит по строкам(преобразует данные массива в jsx-элементы) */}
      {board.map((row, rowIndex) =>
        //   внутренний мап проходит по ячейкам текущей строки
        row.map((cell, colIndex) => {
          // если координаты выбранной ячейки совпадают с текущими координатами ячейки в цикле, то ошибки не будет при null
          const isSelected =
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

          // return чтобы вернуть JSX из тела функции
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              isSelected={isSelected} // Теперь эта переменная существует, и ошибки не будет.
              onCellClick={onCellClick}
            />
          );
        })
      )}
    </div>
  );
}
