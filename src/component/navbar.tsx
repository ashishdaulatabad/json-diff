import React from 'react'
import LightBulbIcon from '@heroicons/react/24/solid/LightBulbIcon'

export function Navbar(props: React.PropsWithoutRef<{themeChanged: () => void}>): JSX.Element {
    const click = () => {
        localStorage.theme = localStorage.theme === 'light' ? 'dark' : 'light'
        props.themeChanged()
    }
    console.log('Rendering')
    return (
        <div className="w-full border-b-2 border-black dark:border-white text-center shadow-lg p-7 font-bold flex justify-between uitems-center">
            <div className="self-center">JSON Comparison</div>
            <div className="ml-12">
                <button onClick={click}>
                    <LightBulbIcon
                        className="w-8 hover:scale-125 ease-in-out duration-300 dark:text-gray-300 cursor"
                    />
                </button>
            </div>
        </div>
    )
}
