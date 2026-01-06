import type { WinRecord } from "../types/sudoku.types";

interface GameHistoryProps {
  wins: WinRecord[];
}

export function GameHistory({ wins }: GameHistoryProps) {
  if (wins.length === 0) {
    return <p className="text-center text-gray-500">У вас пока нет сохраненных побед.</p>;
  }

  return (
    <div className="w-80">
      <h2 className="text-2xl font-bold mb-4 text-center">История побед</h2>
      <div className="max-h-96 overflow-y-auto pr-2">
        <ul className="space-y-3">
          {wins.map((win, index) => (
            <li key={index} className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-800">{win.difficulty}</div>
                <div className="text-xs text-gray-500">
                  {new Date(win.solvedAt).toLocaleString('ru-RU')}
                </div>
              </div>
              <div className="text-green-500 font-bold">✓</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}