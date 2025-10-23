interface GameHistoryProps {
  wins: string[]; // массив дат в виде строк
}

export function GameHistory({ wins }: GameHistoryProps) {
  if (wins.length === 0) {
    return <p>У вас пока нет сохраненных побед.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">История побед</h2>
      <ul className="list-disc pl-5 space-y-2">
        {wins.map((winDate, index) => (
          <li key={index}>{new Date(winDate).toLocaleString("ru-RU")}</li>
        ))}
      </ul>
    </div>
  );
}
