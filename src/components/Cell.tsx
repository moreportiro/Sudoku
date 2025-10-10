import type { Cell as CellType } from "../types/sudoku.types";

// принимает тип
interface CellProps {
  cell: CellType;
  isSelected: boolean;
  onCellClick: (row: number, col: number) => void;
}

export function Cell({ cell, isSelected, onCellClick }: CellProps) {
  // стиль ячейки
  const baseClasses =
    "w-12 h-12 flex items-center justify-center text-2xl border border-gray-400";
  // если можно редактировать, при наведении серая
  const editableClasses = cell.isEditable
    ? "bg-white cursor-pointer hover:bg-gray-200"
    : "bg-gray-300 text-gray-800 font-bold";
  // синяя обводка когда выбрана
  const selectedClasses = isSelected ? "ring-2 ring-blue-500 z-10" : "";
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
  // если ячейка редактируемая, то можно редактировать =)
  const handleClick = () => {
    if (cell.isEditable) {
      onCellClick(cell.row, cell.col);
    }
  };
  return (
    <div
      className={`${baseClasses} ${editableClasses} ${borderClasses}${selectedClasses}`}
      onClick={handleClick}
    >
      {cell.value}
    </div>
  );
}
