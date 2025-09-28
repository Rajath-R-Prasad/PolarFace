/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
  "./App.{js,jsx,ts,tsx}",  // 👈 include root App.js
  "./app/**/*.{js,jsx,ts,tsx}",  // 👈 all your screens in app/
  "./components/**/*.{js,jsx,ts,tsx}",
],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}