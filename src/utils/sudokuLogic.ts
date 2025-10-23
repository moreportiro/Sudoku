import type { Board, Cell, CellValue } from "../types/sudoku.types";

// export const generateEmptyBoard = (): Board => {
//   // массив доски
//   const board: Board = [];
//   // создает 9 строк
//   for (let i = 0; i < 9; i++) {
//     const row: Cell[] = [];
//     // создает 9 колонок
//     for (let j = 0; j < 9; j++) {
//       row.push({ row: i, col: j, value: null, isEditable: true });
//     }
//     // добавляет созданное в доску
//     board.push(row);
//   }
//   return board;
// };

// алгоритм Фишера-Йетса - перемешивает массивы, чтобы каждая сгенерированная доска была разной
const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// проверяет, можно ли поставить число 'num' в ячейку [row, col]
const isSafe = (
  grid: number[][],
  row: number,
  col: number,
  num: number
): boolean => {
  // проверка по строке
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) {
      return false;
    }
  }

  // проверка по колонке
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) {
      return false;
    }
  }

  // проверка по квадрату 3x3
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
};

export const validateBoard = (board: Board): Board => {
  const newBoard = board.map((row) =>
    row.map((cell) => ({ ...cell, isInvalid: false }))
  );

  // числовое представление доски для удобной проверки с помощью isSafe
  const grid: number[][] = newBoard.map((row) =>
    row.map((cell) => cell.value ?? 0)
  );

  // проходит по каждой ячейке
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = newBoard[i][j];
      // проверяет только заполненные пользователем ячейки
      if (cell.isEditable && cell.value !== null) {
        const num = cell.value;
        // временно убирает число из сетки, чтобы проверить его на фоне остальных
        grid[i][j] = 0;
        if (!isSafe(grid, i, j, num)) {
          // Если число неправильное, помечаем ячейку как невалидную
          newBoard[i][j].isInvalid = true;
        }
        // возвращает число обратно в сетку для следующих проверок
        grid[i][j] = num;
      }
    }
  }

  return newBoard;
};

// алгоритм backtracking для заполнения доски
const fillGrid = (grid: number[][]): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        // находит пустую ячейку
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(grid, i, j, num)) {
            grid[i][j] = num; // пробует поставить число
            if (fillGrid(grid)) {
              // рекурсивно вызывает для следующей ячейки
              return true;
            }
            grid[i][j] = 0; // если не получилось (тупик), отменяет ход (возврат назад)
          }
        }
        return false; // если ни одно число не подошло, возвращаемся еще на шаг назад
      }
    }
  }
  return true; // вся доска заполнена
};

// Генерация решённой доски, потом убирает числа из ячейки для пользователя

// difficulty - количество ячеек, которые нужно очистить (чем больше, тем сложнее)
export const generateSudoku = (difficulty: number = 40): Board => {
  // создает пустую числовую сетку (0 - пустая ячейка)
  const solvedGrid: number[][] = Array(9)
    .fill(0)
    .map(() => Array(9).fill(0));
  fillGrid(solvedGrid);

  // создает доску в формате Board на основе решенной сетки
  const puzzleBoard: Board = [];
  for (let i = 0; i < 9; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < 9; j++) {
      row.push({
        row: i,
        col: j,
        value: solvedGrid[i][j] as CellValue,
        isEditable: false, // изначально все ячейки заблокированы
      });
    }
    puzzleBoard.push(row);
  }

  // убирает числа из ячеек
  let holes = difficulty;
  while (holes > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzleBoard[row][col].value !== null) {
      puzzleBoard[row][col].value = null;
      puzzleBoard[row][col].isEditable = true; // делает ячейку редактируемой
      holes--;
    }
  }

  return puzzleBoard;
};
