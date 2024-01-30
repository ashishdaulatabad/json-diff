import React from 'react';
import './App.css';
import JsonDifference from './component/json-diff';
import { Navbar } from './component/navbar';
import { AlertProvider } from './providers/alerts';

function App() {
    return (
        <div className="App">
            <Navbar />
            <AlertProvider>
                <div>
                    <JsonDifference />
                </div>
            </AlertProvider>
        </div>
    )
}

export default App
