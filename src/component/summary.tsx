import React from 'react'
import { Field, Info, IterableSummary } from '../models/interface';
import DiffElement from './diff-element';

export default function DiffSummary(props: React.PropsWithRef<Info<IterableSummary>>) {
    let summary = props.summary?.map((field: Field, index: number) => (
        <DiffElement 
            {...field} key={index} 
            depth={props.depth}
            filterKeyword={props.filterKeyword}
            collapsed={props.summary && (props.summary.length < 100)}
        />
    ))
    return (
        <div className="items-start font-mono text-left w-full">
            {summary}
        </div>
    )
}
