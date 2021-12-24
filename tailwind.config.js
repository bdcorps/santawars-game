module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        styled: ['"Rock Salt"', "cursive"],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "translateX(-0.35rem)" },
          "50%": { transform: "translateX(0.35rem)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
