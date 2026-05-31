/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          open:          "#3B82F6", // blue-500
          investigating: "#F59E0B", // amber-500
          resolved:      "#10B981", // emerald-500
        },
        priority: {
          low:      "#6B7280", // gray-500
          medium:   "#3B82F6", // blue-500
          high:     "#F59E0B", // amber-500
          critical: "#EF4444", // red-500
        },
      },
    },
  },
  plugins: [],
};
