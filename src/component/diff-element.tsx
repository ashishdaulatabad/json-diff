import React from 'react'
import { DiffType, Field, Info, IterableSummary, Type } from '../models/interface'
import DiffSummary from './summary'
import Types from '../utils/types'

function transformString(data: string): string | JSX.Element {
    if (data.match(/^https?:\/\//)) {
        return <a href={data} className="text-blue-400 underline visited:text-magenta-500" target="_blank">"{data}"</a>
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

export default function DiffElement(props: React.PropsWithRef<Info<Field>>): JSX.Element {
    // To do: use this
    let [childVisible, setChildVisible] = React.useState<boolean>(false)
    /// To do: Something with props.children
    const depth = props.depth as number
    // const margin = `ml-${depth || 0}`
    return !props.hasOwnProperty('children') ? (
        <div className="flex w-full hover:bg-gray-100">
            <div className={"w-full flex p-0.5 " + bgColorLeft(props.diffResult)}>
                {depthWidth(depth)}
                <div className="w-full">
                    <b>{props.fieldKey}</b>:&nbsp;
                    <span className={getStylesLeft(props)}> 
                        {transform(props.left, props.leftType)}
                    </span>
                </div>
            </div>
            <div className={"w-full flex p-0.5 " + bgColorRight(props.diffResult)}>
                {depthWidth(depth)}
                <div className="w-full">
                    <b>{props.fieldKey}</b>:&nbsp;
                    <span className={getStylesRight(props)}>
                        {transform(props.right, props.rightType)}
                    </span>
                </div>
            </div>
        </div>
    ) : (
        <div className="">
            <div className="flex w-full hover:bg-gray-100">
                <div className={"w-full flex p-0.5 " + bgColorLeft(props.diffResult)}>
                    {depthWidth(depth)}
                    <div className="w-full">
                        <b>{props.fieldKey}</b>:&nbsp;
                        <span className={getStylesLeft(props)}> 
                            {!Types.typeIsIterable(props?.leftType as Type) ? transform(props.left, props.leftType) : ''}
                        </span>
                    </div>
                </div>
                <div className={"w-full flex p-0.5 " + bgColorRight(props.diffResult)}>
                    {depthWidth(depth)}
                    <div className="w-full">
                        <b>{props.fieldKey}</b>:&nbsp;
                        <span className={getStylesRight(props)}>
                            {!Types.typeIsIterable(props?.rightType as Type) ? transform(props.right, props.rightType) : ''}
                        </span>
                    </div>
                </div>
            </div> 
            <div className="w-full flex">
                <DiffSummary 
                    {...props.children as IterableSummary} 
                    depth={(props?.depth ?? 0) + 1}
                    filterKeyword={props.filterKeyword}
                />
            </div>
        </div>
    )
}
