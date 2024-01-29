import React from 'react';
import './App.css';
import JsonDifference from './component/json-diff';
import { Navbar } from './component/navbar';

function App() { 
    return (
        <div className="App">
            <Navbar />
            <div>
                <JsonDifference />
            </div>
        </div>
    )
}

export default App
