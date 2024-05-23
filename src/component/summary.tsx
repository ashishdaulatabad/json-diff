import React from 'react'
import { Field, Info, IterableSummary } from '../models/interface';
import DiffElement from './diff-element';

export default function DiffSummary(props: React.PropsWithRef<Info<IterableSummary>>): JSX.Element { 
    let summary = props.summary?.map((field: Field, index: number) => (
        <DiffElement 
            {...field}
            key={index} 
            depth={props.depth}
            filterKeyword={props.filterKeyword}
            collapsed={true}
            showOnlyDifferences={props.showOnlyDifferences}
        />
    ))
    return (
        <div className="items-start text-left w-full">
            {summary}
        </div>
    )
}
