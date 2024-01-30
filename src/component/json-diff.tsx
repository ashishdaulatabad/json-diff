import React, { useContext } from 'react'
import { IterableSummary } from '../models/interface'
import compare from '../services/compare'
import DiffSummary from './summary'
import { Bars } from 'react-loader-spinner'
import { AlertContext, AlertMessageFn } from '../providers/alerts'
import { AlertSeverity } from './alerts'

export default function JsonDifference() {
    let [first, setFirst] = React.useState<string | null>(null)
    let [second, setSecond] = React.useState<string | null>(null)
    let [summary, setSummary] = React.useState<IterableSummary>({} as IterableSummary)
    let [filter, setFilter] = React.useState<string | null>(null)
    let [isComparing, setIsComparing] = React.useState<boolean>(false)
    let [showDiffOnly, setShowDiffOnly] = React.useState<boolean>(false)
    let showMessage = useContext(AlertContext) as AlertMessageFn

    const startComparison = () => React.startTransition(() => {
        if (isComparing) {
            setIsComparing(false)
        }
        setIsComparing(true)
    })
    const clearComparison = async () => React.startTransition(() => {
        setIsComparing(false)
        setFirst('')
        setSecond('')
        setSummary({} as IterableSummary)
    })
    const toggleShowDiff = () => React.startTransition(() => {
        setShowDiffOnly(!showDiffOnly)
    })
    
    React.useEffect(() => {
        if (isComparing) {
            if (first?.trim().length && second?.trim().length) {
                try {
                    compare.compare(JSON.parse(first.trim()), JSON.parse(second.trim()))
                        .then(data => setSummary(data.get() as IterableSummary)) 
                        .catch((e) => {console.log(e)})
                        .finally(() => setIsComparing(false))
                } catch(e: any) {
                    showMessage({
                        severity: AlertSeverity.Error,
                        header: 'Error',
                        message: e.message
                    })
                } finally {
                    setIsComparing(false)
                }
            } else if (!first || !first.trim().length) {
                showMessage({
                    severity: AlertSeverity.Info,
                    header: 'No JSON Input',
                    message: 'No JSON header input was defined for first JSON input.'
                })
                setIsComparing(false)
            } else if (!second || !second.trim().length) {
                showMessage({
                    severity: AlertSeverity.Info,
                    header: 'No JSON Input',
                    message: 'No JSON header input was defined for second JSON input.'
                })
                setIsComparing(false)
            }
        }
    }, [isComparing])

    return (
        <>
            <div className="flex flex-row font-mono">
                <div className="w-full p-8">
                    <textarea
                        autoComplete="false"
                        spellCheck="false"
                        value={first ?? ''}
                        className="w-full h-96 p-2 border border-gray-300 resize-none focus:border-gray-400 focus:outline-none font-mono rounded-sm"
                        placeholder="Enter your first JSON object"
                        onInput={(e) => setFirst((e.target as HTMLTextAreaElement).value)}
                    >
                    </textarea>
                </div>
                <div className="w-full p-8">
                    <textarea
                        autoComplete="false"
                        spellCheck="false"
                        value={second ?? ''}
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
                    onClick={startComparison}
                >
                    {(isComparing ? <Bars width={30} height={30} color={"black"} /> : "Compare")} {isComparing}
                </button>
                <button
                    className="bg-white border border-black border-b-4 border-r-4 px-8 py-2 rounded-sm font-mono active:border-b-8 ease-in-out transition-all duration-50 active:bg-gray-100 ml-10"
                    onClick={clearComparison}
                >Clear</button>
            </div>
            <div className="summary p-10 flex justify-center items-center">
                <div className="items-start font-mono text-left w-4/5 p-8 border-t-2 border-l-2 border-black border-r-8 border-b-8">
                    <div className="w-full">
                        <input
                            value={showDiffOnly ? 1 : 0}
                            name="changes"
                            id="changes"
                            type="checkbox"
                            className="scale-150"
                            onClick={toggleShowDiff}
                        />
                        <label
                            onClick={toggleShowDiff}
                            htmlFor="changes" 
                            className="ml-3"
                        >Show Only Changes</label>
                    </div>
                    <div className="w-full mb-10 mt-3">
                        <input 
                            className="py-2 px-3 w-full rounded-sm border border-r-4 border-b-4 border-black active:outline-none"
                            placeholder="Search keywords to filter (Does not work)"
                            onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
                        />
                    </div>
                    <DiffSummary {...summary} filterKeyword={filter || ''} showOnlyDifferences={showDiffOnly} />
                </div>
            </div>
        </>
    )
}
