import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      onClick={onClose} // закрытие по клику на фон
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl z-50"
        onClick={(e) => e.stopPropagation()} // предотвращает закрытие по клику на само окно
      >
        {children}
      </div>
    </div>
  );
}
