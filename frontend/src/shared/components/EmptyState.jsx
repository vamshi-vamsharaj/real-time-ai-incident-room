
const EmptyState = ({
  icon = "📋",
  title = "Nothing here yet",
  message = "",
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4" role="img" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-gray-500 max-w-xs mb-6">{message}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
