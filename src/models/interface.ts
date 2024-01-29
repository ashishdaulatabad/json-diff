export enum DiffType {
    Same,
    Different,
    LeftOnly,
    RightOnly,
}

export enum Type {
    Null,
    Undefined,
    Number,
    Boolean,
    String,
    Array,
    Object,
}

export interface CError {
    error: string;
}

export interface IterableSummary {
    isSame: boolean
    same?: number
    different?: number
    leftonly?: number
    rightonly?: number
    summary?: Array<Field>
    depth?: number
}

export type Info<Type> = {
    [Property in keyof Type]: Type[Property]
} & {
    depth?: number,
    filterKeyword?: string
}

export interface Field {
    fieldKey: string | number
    diffResult: DiffType
    path: Array<string | number>
    leftType?: Type
    rightType?: Type
    left?: any
    right?: any
    children?: IterableSummary
}
