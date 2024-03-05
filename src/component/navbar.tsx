import React from 'react'
import LightBulbIcon from '@heroicons/react/24/solid/LightBulbIcon'

export function Navbar(props: React.PropsWithoutRef<{themeChanged: () => void}>): JSX.Element {
    const click = () => {
        localStorage.theme = localStorage.theme === 'light' ? 'dark' : 'light'
        props.themeChanged()
    }
    return (
        <div className="w-full border-b-2 border-gray-200 dark:border-gray-700 text-center shadow-lg p-7 font-bold flex justify-between uitems-center">
            <div className="self-center text-gray-600 dark:text-gray-300">JSON Comparison</div>
            <div className="ml-12">
                <button onClick={click}>
                    <LightBulbIcon
                        className="w-8 hover:scale-125 ease-in-out duration-300 text-gray-600 dark:text-gray-300 cursor"
                    />
                </button>
            </div>
        </div>
    )
}
