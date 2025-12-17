import type { CellValue } from "../types/sudoku.types";

interface NumpadProps {
  onNumberSelect: (num: CellValue) => void;
  counts: Record<number, number>; // Объект с количеством цифр
}

export function Numpad({ onNumberSelect, counts }: NumpadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-md mt-6">
      <div className="grid grid-cols-5 gap-2">
        {numbers.map((num) => {
          // Сколько еще таких цифр нужно поставить (всего 9 минус текущее количество)
          const remaining = 9 - (counts[num] || 0);
          // Если цифр уже 9 (или больше, на всякий случай), отключаем кнопку
          const isFinished = remaining <= 0;

          if (isFinished) {
            // Если цифра полностью заполнена, возвращаем пустой div для сохранения сетки
            // или можно рендерить прозрачную кнопку
            return <div key={num} className="invisible" />;
          }

          return (
            <button
              key={num}
              onClick={() => onNumberSelect(num as CellValue)}
              className="flex flex-col items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-3 rounded shadow transition-colors active:bg-blue-300"
            >
              <span className="text-2xl">{num}</span>
              <span className="text-xs text-gray-500 font-normal">
                ост. {remaining}
              </span>
            </button>
          );
        })}

        {/* Кнопка стирания (Очистить клетку) */}
        <button
          onClick={() => onNumberSelect(null)}
          className="flex flex-col items-center justify-center bg-red-100 hover:bg-red-200 text-red-900 font-bold py-2 rounded shadow transition-colors active:bg-red-300"
        >
          <span className="text-xl">⌫</span>
          <span className="text-xs font-normal">Стереть</span>
        </button>
      </div>
    </div>
  );
}
