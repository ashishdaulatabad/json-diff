import React from 'react'
import LightBulbIcon from '@heroicons/react/24/solid/LightBulbIcon'

export function Navbar(): JSX.Element {
    return (
        <div className="w-full border-b-2 border-black text-center shadow-lg p-7 font-mono font-bold flex justify-between uitems-center">
            <div className="self-center">JSON Comparison</div>
            <div className="ml-12">
                <LightBulbIcon 
                    className="w-8 hover:scale-125 ease-in-out duration-300 dark:text-gray-300"
                    onClick={() => localStorage.theme = localStorage.theme === 'light' ? 'dark' : 'light'}
                />
            </div>
        </div>
    )
}
