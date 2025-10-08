import type { Cell as CellType } from "../types/sudoku.types";

// принимает тип
interface CellProps {
  cell: CellType;
}

export function Cell({ cell }: CellProps) {
  // стиль ячейки
  const baseClasses =
    "w-12 h-12 flex items-center justify-center text-2xl border border-gray-400";
  // если можно редактировать, при наведении серая
  const editableClasses = cell.isEditable
    ? "bg-white cursor-pointer hover:bg-gray-200"
    : "bg-gray-300 text-gray-800 font-bold";
  // обводка сетки 3х3
  const borderClasses = `
    ${
      (cell.row + 1) % 3 === 0 && cell.row !== 8
        ? "border-b-4 border-b-gray-800"
        : ""
    }
    ${
      (cell.col + 1) % 3 === 0 && cell.col !== 8
        ? "border-r-4 border-r-gray-800"
        : ""
    }
  `;

  return (
    <div className={`${baseClasses} ${editableClasses} ${borderClasses}`}>
      {cell.value}
    </div>
  );
}
