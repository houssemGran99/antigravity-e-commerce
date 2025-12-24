/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: '#3B82F6', // Electric Blue
                dark: {
                    900: '#0F172A', // Slate 900
                    800: '#1E293B', // Slate 800
                    700: '#334155', // Slate 700
                }
            }
        },
    },
    plugins: [],
}
