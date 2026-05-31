import Spinner from "./Spinner.jsx";


const variantMap = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium px-4 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-950",
};

const Button = ({
  variant = "primary",
  isLoading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  children,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${variantMap[variant]} inline-flex items-center gap-2 ${className}`}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;
