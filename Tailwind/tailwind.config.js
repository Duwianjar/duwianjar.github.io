/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['index.html'],
    theme: {
        container: {
            center: true,
            padding: '16px',
        },
        extend: {
            colors: {
                primary: '#6d28d9',
                dark: '#0f172a',
                abang: '#FF0068',
            },
            screens: {
                '2xl': '1320px',
            },
        },
    },
    plugins: [],
};