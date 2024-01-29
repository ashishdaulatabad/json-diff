import React from 'react'
import { IterableSummary } from '../models/interface'
import compare from '../services/compare'
import DiffSummary from './summary'
import { Bars } from 'react-loader-spinner'

export default function JsonDifference() {
    let [first, setFirst] = React.useState<string | null>(null)
    let [second, setSecond] = React.useState<string | null>(null)
    let [summary, setSummary] = React.useState<IterableSummary>({} as IterableSummary)
    let [filter, setFilter] = React.useState<string | null>(null)
    let [isComparing, setIsComparing] = React.useState<boolean>(false)

    async function comp(first: string, second: string) {
        if (first?.length && second?.length) {
            setIsComparing(true)
            let value = await compare.compare(JSON.parse(first), JSON.parse(second))
                .then(data => { setIsComparing(false); return data.get() }) 
                .catch(console.error)

            setSummary(value as IterableSummary)
        }
    }

    return (
        <>
            <div className="flex flex-row font-mono">
                <div className="w-full p-8">
                    <textarea 
                        className="w-full h-96 p-2 border border-gray-300 resize-none focus:border-gray-400 focus:outline-none font-mono rounded-sm"
                        placeholder="Enter your first JSON object"
                        onInput={(e) => setFirst((e.target as HTMLTextAreaElement).value)}
                    >
                    </textarea>
                </div>
                <div className="w-full p-8">
                    <textarea 
                        className="w-full h-96 p-2 border border-gray-300 resize-none focus:border-gray-400 focus:outline-none font-mono rounded-sm"
                        placeholder="Enter your second JSON object"
                        onInput={(e) => setSecond((e.target as HTMLTextAreaElement).value)}
                    >
                    </textarea>
                </div>
            </div>
            <div className="flex flex-row justify-center items-center mb-8">
                <button
                    className={"bg-white border border-black border-b-4 border-r-4 px-8 py-2 rounded-sm font-mono active:border-b-8 ease-in-out transition-all duration-50 active:bg-gray-100"}
                    onClick={async (_) => comp(first || '', second || '')}
                >
                    {(isComparing ? <Bars width={30} height={30} color={"black"} /> : "Compare")}
                </button>
            </div>
            <div className="summary p-10 flex justify-center items-center">
                <div className="items-start font-mono text-left w-4/5 p-8 border-t-2 border-l-2 border-black border-r-8 border-b-8">
                    <div className="w-full mb-10">
                        <input 
                            className="py-2 px-3 w-full rounded-sm border border-r-4 border-b-4 border-black active:outline-none"
                            placeholder="Search keywords to filter (Does not work)"
                            onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
                        />
                    </div>
                    <DiffSummary {...summary} filterKeyword={filter || ''} />
                </div>
            </div>
        </>
    )
}
