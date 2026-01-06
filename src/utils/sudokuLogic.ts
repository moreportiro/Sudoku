// src/utils/sudokuLogic.ts

import type { Board, Cell, CellValue, DifficultyConfig } from '../types/sudoku.types';

// Конфигурация уровней сложности
export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  { name: 'Тест', holes: 1 },
  { name: 'Очень легко', holes: 20 },
  { name: 'Легко', holes: 30 },
  { name: 'Средне', holes: 40 },
  { name: 'Сложно', holes: 50 },
  { name: 'Эксперт', holes: 60 },
];

export const generateEmptyBoard = (): Board => {
  const board: Board = [];
  for (let i = 0; i < 9; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < 9; j++) {
      row.push({ row: i, col: j, value: null, isEditable: true });
    }
    board.push(row);
  }
  return board;
};

// Перемешивание массива (алгоритм Фишера-Йетса)
const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const isSafe = (grid: number[][], row: number, col: number, num: number): boolean => {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

const fillGrid = (grid: number[][]): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(grid, i, j, num)) {
            grid[i][j] = num;
            if (fillGrid(grid)) return true;
            grid[i][j] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// --- ОПТИМИЗИРОВАННАЯ ГЕНЕРАЦИЯ ---
export const generateSudoku = (holes: number): Board => {
  // 1. Создаем и заполняем числовую сетку
  const solvedGrid: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
  fillGrid(solvedGrid);

  // 2. Конвертируем в нашу структуру Board
  const puzzleBoard: Board = [];
  for (let i = 0; i < 9; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < 9; j++) {
      row.push({
        row: i,
        col: j,
        value: solvedGrid[i][j] as CellValue,
        isEditable: false,
      });
    }
    puzzleBoard.push(row);
  }

  // 3. Выкалываем дыры (ОПТИМИЗИРОВАННЫЙ АЛГОРИТМ)
  // Вместо цикла while, который может зависнуть, мы создаем список всех индексов (0..80),
  // перемешиваем его и просто берем первые N индексов для удаления.
  
  // Создаем массив индексов от 0 до 80
  const allIndices = Array.from({ length: 81 }, (_, i) => i);
  
  // Перемешиваем индексы
  shuffle(allIndices);
  
  // Берем нужное количество индексов для удаления
  const indicesToRemove = allIndices.slice(0, holes);

  // Удаляем значения по этим индексам
  indicesToRemove.forEach(index => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    puzzleBoard[row][col].value = null;
    puzzleBoard[row][col].isEditable = true;
  });

  return puzzleBoard;
};

export const validateBoard = (board: Board): Board => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell, isInvalid: false })));
  const grid: number[][] = newBoard.map(row => 
    row.map(cell => cell.value ?? 0)
  );

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = newBoard[i][j];
      if (cell.isEditable && cell.value !== null) {
        const num = cell.value;
        grid[i][j] = 0;
        if (!isSafe(grid, i, j, num)) {
          newBoard[i][j].isInvalid = true;
        }
        grid[i][j] = num;
      }
    }
  }
  return newBoard;
};

export const getNumberCounts = (board: Board): Record<number, number> => {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) {
    counts[i] = 0;
  }
  board.forEach(row => {
    row.forEach(cell => {
      if (cell.value !== null) {
        counts[cell.value] = (counts[cell.value] || 0) + 1;
      }
    });
  });
  return counts;
};