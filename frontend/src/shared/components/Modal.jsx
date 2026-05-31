import { useEffect } from "react";

/**
 * Modal — accessible modal dialog.
 *
 * Props:
 *   isOpen    — controls visibility
 *   onClose   — called when backdrop or Escape is pressed
 *   title     — modal heading
 *   children  — modal body content
 *   maxWidth  — Tailwind max-width class (default: "max-w-lg")
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={`
          relative z-10 w-full ${maxWidth}
          bg-gray-900 border border-gray-800
          rounded-2xl shadow-2xl
          animate-in fade-in slide-in-from-bottom-4
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-gray-100"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-800"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
