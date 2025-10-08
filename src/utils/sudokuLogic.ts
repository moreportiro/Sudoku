import type { Board, Cell } from "../types/sudoku.types";

export const generateEmptyBoard = (): Board => {
  // массив доски
  const board: Board = [];
  // создает 9 строк
  for (let i = 0; i < 9; i++) {
    const row: Cell[] = [];
    // создает 9 колонок
    for (let j = 0; j < 9; j++) {
      row.push({ row: i, col: j, value: null, isEditable: true });
    }
    // добавляет созданное в доску
    board.push(row);
  }
  return board;
};
