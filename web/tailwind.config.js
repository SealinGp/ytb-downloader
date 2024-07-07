/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        err: "#FDEDED",
      },
      transitionTimingFunction: {
        cb0051: "cubic-bezier(0,0,.5,1)",
      },
      scale: {
        101: "1.01",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
      boxShadow: {
        apple: "2px 4px 12px #00000014",
        "apple-after": "2px 4px 16px #00000029",
      },
    },
  },
  plugins: [],
};
