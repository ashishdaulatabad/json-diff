import React from 'react'
import { DiffType, Field, Info, IterableSummary, Type } from '../models/interface'
import DiffSummary from './summary'
import Types from '../utils/types'

type Attr = {
    [Key: string]: () => boolean
}

function css(...args: Array<string | Attr>) {
    return args.reduce((prev: Array<string>, arg: string | Attr) => {
        if (typeof arg === 'string') {
            prev.push(arg)
        } else {
            prev = prev.concat(Object.keys(arg).filter(key => arg[key]()))
        }

        return prev
    }, []).join(' ')
}

function transformString(data: string): string | JSX.Element {
    if (data.match(/^https?:\/\//)) {
        return (
            <>
                {"\""}
                <a 
                    href={data} 
                    className="text-blue-400 underline visited:text-magenta-500"
                    target="_blank"
                    rel="noreferrer"
                >{data}</a>
                {"\""}
            </>
        )
    }

    return `"${data}"`
}

function transform(data: any, type: Type | undefined) {
    switch (type) {
        case Type.String:
            return transformString(data)
        case Type.Null:
            return 'null'
        case Type.Boolean:
            return data ? 'true' : 'false'
        default:
            return data
    }
}

function getStyleWithTypes(type: Type | undefined) {
    switch (type) {
        case Type.Null:
            return 'text-red-800'
        case Type.String:
            return 'text-green-700 break-all'
        case Type.Boolean:
            return 'text-purple-700'
        case Type.Number:
            return 'text-amber-800'
        default:
            return 'text-gray-700'
    }
}

function bgColorLeft(type: DiffType) {
    switch (type) {
        case DiffType.LeftOnly:
            return 'bg-green-200'
        case DiffType.RightOnly:
            return 'bg-gray-200'
        case DiffType.Different:
            return 'bg-yellow-200'
        default:
            return ''
    }
}

function bgColorRight(type: DiffType) {
    switch (type) {
        case DiffType.RightOnly:
            return 'bg-red-200'
        case DiffType.LeftOnly:
            return 'bg-gray-200'
        case DiffType.Different:
            return 'bg-yellow-200'
        default:
            return ''
    }
}

function getStylesLeft(props: Info<Field>) {
    return getStyleWithTypes(props.leftType)
}

function getStylesRight(props: Info<Field>) {
    return getStyleWithTypes(props.rightType)
}

function depthWidth(depth: number) {
    return Array.from({length: depth}).map((_, index: number) => (
         <div className="border-l border-gray-400 min-w-10" key={index}></div> 
    ))
}

function collapsible(
    type: Type,
    visible: boolean, 
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
): JSX.Element {
    if (Types.typeIsIterable(type)) {
        const visibleChange = async () => React.startTransition(() => {
            setVisible(!visible)
        })
        if (type === Type.Array) {
            return (<button 
                className="px-2 py-0.25 w-full text-gray-500 flex"
                onClick={visibleChange}
            >
                <div data-before="[" className="before:content-[attr(data-before)]"></div>
                <div>...</div>
                <div data-before="]" className="before:content-[attr(data-before)]"></div>
            </button>)
        } else {
            return (<button 
                className="px-2 py-0.25 w-full text-gray-500 flex"
                onClick={visibleChange}
            >
                <div data-before="{" className="before:content-[attr(data-before)]"></div>
                <div>...</div>
                <div data-before="}" className="before:content-[attr(data-before)]"></div>
            </button>)
        }
    } else {
        return (<></>)
    }
}

export default function DiffElement(props: React.PropsWithoutRef<Info<Field>>): JSX.Element {
    // To do: use this
    let [childVisible, setChildVisible] = React.useState<boolean>(props.collapsed ?? true)
    /// To do: Something with props.children
    const depth = props.depth as number
    const indexed = Types.ftype(props.fieldKey) === Type.Number ?
        (<><b>- {`[${props.fieldKey}]`}</b>&nbsp;</>) :
        (<><b>{props.fieldKey}</b>:&nbsp;</>)

    React.useEffect(() => {
        return () => {}
    }, [childVisible])

    if (!props.showOnlyDifferences || (props.showOnlyDifferences && props.diffResult !== DiffType.Same)) {
        return !props.hasOwnProperty('children') ? (
            <div className="flex w-full hover:bg-gray-100">
                <div className={css("w-full flex p-0.5", bgColorLeft(props.diffResult))}>
                    {depthWidth(depth)}
                    <div className="w-full">
                        {indexed}
                        <span className={getStylesLeft(props)}> 
                            {transform(props.left, props.leftType)}
                        </span>
                    </div>
                </div>
                <div className={css("w-full flex p-0.5", bgColorRight(props.diffResult))}>
                    {depthWidth(depth)}
                    <div className="w-full">
                        {indexed}
                        <span className={getStylesRight(props)}>
                            {transform(props.right, props.rightType)}
                        </span>
                    </div>
                </div>
            </div>
        ) : (
            <div className="">
                <div className="flex w-full hover:bg-gray-100">
                    <div className={css("w-full flex p-0.5", bgColorLeft(props.diffResult))}>
                        {depthWidth(depth)}
                        <div className="w-full flex">
                            {indexed}
                            <span className={getStylesLeft(props)}> 
                                {!Types.typeIsIterable(props?.leftType as Type) ? transform(props.left, props.leftType) : collapsible(props.leftType as Type, childVisible, setChildVisible)}
                            </span>
                        </div>
                    </div>
                    <div className={css("w-full flex p-0.5", bgColorRight(props.diffResult))}>
                        {depthWidth(depth)}
                        <div className="w-full flex">
                            {indexed}
                            <span className={css(getStylesRight(props))}>
                                {!Types.typeIsIterable(props?.rightType as Type) ? transform(props.right, props.rightType) : collapsible(props.rightType as Type, childVisible, setChildVisible)}
                            </span>
                        </div>
                    </div>
                </div>
                {
                    childVisible ?
                        <div className="w-full flex">
                            <DiffSummary 
                                {...props.children as IterableSummary} 
                                depth={(props?.depth ?? 0) + 1}
                                filterKeyword={props.filterKeyword}
                                collapsed={childVisible || false}
                                showOnlyDifferences={props.showOnlyDifferences}
                            />
                        </div> :
                        <></>
                }
            </div>
        )
    } else {
        return (<></>)
    }
}
