/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/*.{html,ts,tsx}', './src/**/*.{html,ts,tsx}'],
    darkMode: 'selector',
    theme: {
        fontFamily: {
            mono: ['Roboto Mono', 'monospace', 'sans-serif']
        },
        extend: {}
    },
    plugins: [
        require('tailwind-scrollbar')
    ]
};
