/**
 * ErrorMessage — displays an error string inline.
 *
 * Props:
 *   message  — the error string (if falsy, renders nothing)
 *   onRetry  — optional retry callback; renders a Retry button if provided
 */
const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 bg-red-950/50 border border-red-800/60 rounded-lg p-4"
    >
      <span className="text-red-400 text-lg leading-none mt-0.5" aria-hidden="true">
        ⚠️
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-300">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
