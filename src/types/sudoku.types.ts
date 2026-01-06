export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null;

// типы для доски
export interface Cell {
  row: number;
  col: number;
  value: CellValue;
  isEditable: boolean;
  isInvalid?: boolean;
}

// двумерный массив доски 9х9
export type Board = Cell[][];

// сложность
export type DifficultyLevel = 'Тест' | 'Очень легко' | 'Легко' | 'Средне' | 'Сложно' | 'Эксперт';

export interface DifficultyConfig {
  name: DifficultyLevel;
  holes: number; // Количество пустых клеток
}

export interface WinRecord {
  solvedAt: string;
  difficulty: string;
}
