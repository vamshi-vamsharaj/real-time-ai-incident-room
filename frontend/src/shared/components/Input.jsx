
const Input = ({
  label,
  id,
  error,
  multiline = false,
  rows = 3,
  required = false,
  className = "",
  ...rest
}) => {
  const fieldClass = `form-input ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-400 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          className={`${fieldClass} resize-none`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
      ) : (
        <input
          id={id}
          className={fieldClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
