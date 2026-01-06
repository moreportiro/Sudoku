import { useContext, useEffect, useState } from "react";
import type { Board as BoardType, CellValue, DifficultyLevel, WinRecord } from "./types/sudoku.types";
import {
  DIFFICULTY_LEVELS,
  generateSudoku,
  getNumberCounts,
  validateBoard,
} from "./utils/sudokuLogic";
import { Board } from "./components/Board";
import { AuthContext } from "./context/AuthContext";
import { Modal } from "./components/Modal";
import { AuthForm } from "./components/AuthForm";
import { GameHistory } from "./components/GameHistory";
import { Numpad } from "./components/Numpad";
import axios from "axios";

// тип для координат выбранной ячейки
type SelectedCell = { row: number; col: number } | null;
// тип для состояния экрана
type GameState = 'welcome' | 'difficulty_select' | 'playing';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('Средне');
  // <BoardType> тип данных в котором будут храниться данные
  const [board, setBoard] = useState<BoardType>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [wins, setWins] = useState<WinRecord[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>(
    getNumberCounts(board)
  );
  const auth = useContext(AuthContext);

  // Обновляет счетчики каждый раз, когда меняется доска
  useEffect(() => {
    setCounts(getNumberCounts(board));
  }, [board]);

  // для отображения сообщения о победе
  useEffect(() => {
    if (isGameWon) {
      alert(`Поздравляем! Вы прошли уровень "${currentDifficulty}"!`);
      saveGameWin();
    }
  }, [isGameWon]);

  // Запуск выбора сложности
  const handleStartGameClick = () => {
    setGameState('difficulty_select');
  };

  // Старт самой игры
  const startGame = (levelName: DifficultyLevel, holes: number) => {
    setCurrentDifficulty(levelName);
    const newBoard = generateSudoku(holes); // Передаем количество дырок
    setBoard(newBoard);
    setCounts(getNumberCounts(newBoard));
    setSelectedCell(null);
    setIsGameWon(false);
    setGameState('playing');
  };

  // сохрани победную игру
  const saveGameWin = async () => {
    if (!auth?.token) return;
    
    try {
      await axios.post('/api/save-win', {
        solvedAt: new Date().toISOString(),
        difficulty: currentDifficulty // <-- Отправляем сложность
      }, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      console.log('Победа сохранена');
    } catch (error) {
      console.error(error);
    }
  };

  // обновляет значение в конкретной ячейке
  const updateCellValue = (row: number, col: number, value: CellValue) => {
    // создает полную копию доски, чтобы не изменять состояние напрямую (это принцип React)
    const newBoard = board.map((rowArr) => rowArr.map((cell) => ({ ...cell })));

    // можно ли редактировать ячнйку
    if (newBoard[row][col].isEditable) {
      newBoard[row][col].value = value;

      // валидация и проверка победы
      const validatedBoard = validateBoard(newBoard);
      setBoard(validatedBoard);
      checkWinCondition(validatedBoard);
    }
  };

  // Обработчик нажатия на кнопку Numpad
  const handleNumberSelect = (num: CellValue) => {
    // Если ячейка не выбрана или игра выиграна, ничего не делает
    if (!selectedCell || isGameWon) return;

    updateCellValue(selectedCell.row, selectedCell.col, num);
  };

  // функция для проверки условия победы
  const checkWinCondition = (currentBoard: BoardType) => {
    const isComplete = currentBoard.flat().every((cell) => cell.value !== null);
    const hasErrors = currentBoard.flat().some((cell) => cell.isInvalid);

    if (isComplete && !hasErrors && !isGameWon) {
      setIsGameWon(true);
    }
  };

  // обработчик клика по ячейке
  const handleCellClick = (row: number, col: number) => {
    // нельзя выбирать ячейки после победы
    if (!isGameWon) {
      setSelectedCell({ row, col });
    }
  };

  // обработчик для кнопки "Заново"
  const handleRestartGame = () => {
    // находит настройки для текущей сложности
    const difficultyConfig = DIFFICULTY_LEVELS.find(level => level.name === currentDifficulty);
    const holes = difficultyConfig ? difficultyConfig.holes : 40; // 40 как запасной вариант

    // генерирует новую доску
    const newBoard = generateSudoku(holes);
    setBoard(newBoard);
    setCounts(getNumberCounts(newBoard));
    setSelectedCell(null);
    setIsGameWon(false);
    // GameState менять не нужно, мы остаемся в 'playing'
  };

  // история побед
  const fetchWinsHistory = async () => {
    if (!auth?.token) return;
    try {
      const response = await axios.get('/api/wins', {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      setWins(response.data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

const renderContent = () => {
    switch (gameState) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center animate-fade-in">
            <h1 className="text-6xl font-bold mb-8 text-blue-800">SUDOKU</h1>
            <p className="text-xl text-gray-600 mb-12">Тренируй свой мозг каждый день</p>
            <button 
              onClick={handleStartGameClick}
              className="px-8 py-4 bg-blue-600 text-white text-2xl rounded-full hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
            >
              Новая игра
            </button>
          </div>
        );

      case 'difficulty_select':
        return (
          <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-gray-700">Выберите сложность</h2>
            <div className="flex flex-col gap-4 w-64">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.name}
                  onClick={() => startGame(level.name, level.holes)}
                  className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 text-lg rounded-lg hover:bg-blue-500 hover:text-white transition font-semibold"
                >
                  {level.name}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setGameState('welcome')}
              className="mt-8 text-gray-500 hover:text-gray-800 underline"
            >
              Назад
            </button>
          </div>
        );

      case 'playing':
        return (
          <div className="flex flex-col items-center w-full max-w-lg">
            <div className="flex justify-between items-center w-full mb-4 px-2">
              {/* Кнопка Меню */}
               <button 
                onClick={() => setGameState('difficulty_select')}
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
              >
                ← Меню
              </button>
              <div className="text-lg font-semibold text-gray-700">
                Уровень: <span className="text-blue-600">{currentDifficulty}</span>
              </div>
              <div className="w-10"></div> {/* Заглушка для центровки */}
            </div>
            {/* Кнопка Заново */}
              <button 
                onClick={handleRestartGame}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ↻ Заново
              </button>

            <Board
              board={board}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
            />
            <Numpad 
              onNumberSelect={handleNumberSelect} 
              counts={counts} 
            />
          </div>
        );
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      {/* Хедер (Авторизация) всегда виден */}
      <header className="absolute top-4 right-4 z-10">
        {auth?.user ? (
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
            <span className="font-medium text-blue-800">{auth.user.username}</span>
            <button onClick={fetchWinsHistory} className="text-sm text-gray-600 hover:text-blue-600">🏆 Истори</button>
            <button onClick={auth.logout} className="text-sm text-red-500 hover:text-red-700">Выйти</button>
          </div>
        ) : (
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-white text-blue-600 font-semibold rounded shadow hover:bg-blue-50">
            Войти / Регистрация
          </button>
        )}
      </header>

      {/* Основной контент меняется в зависимости от состояния */}
      {renderContent()}

      {/* Модалки */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AuthForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}>
        <GameHistory wins={wins} />
      </Modal>
    </div>
  );
}
