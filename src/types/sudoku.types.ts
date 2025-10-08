export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null;

// типы
export interface Cell {
  row: number;
  col: number;
  value: CellValue;
  isEditable: boolean;
}

// двумерный массив доски 9х9
export type Board = Cell[][];
