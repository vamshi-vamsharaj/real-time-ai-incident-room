const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-300 ${className}`} />
  );
};

export default Spinner;