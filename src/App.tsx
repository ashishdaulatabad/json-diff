import React from 'react';
import './App.css';
import JsonDifference from './component/json-diff';
import { Navbar } from './component/navbar';
import { AlertProvider } from './providers/alerts';

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
function theme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
        localStorage.theme = 'dark'
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.theme = 'light'
    }
}

function App() {
    theme()
    return (
        <div className="App font-mono dark:bg-black dark:text-white">
            <Navbar themeChanged={theme}  />
            <AlertProvider>
                <div>
                    <JsonDifference />
                </div>
            </AlertProvider>
        </div>
    )
}

export default App
