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
  isSame: boolean;
  same?: number;
  different?: number;
  leftonly?: number;
  rightonly?: number;
  summary?: Array<Field>;
  depth?: number;
}

export type Info<Type> = {
  [Property in keyof Type]: Type[Property];
} & {
  depth?: number;
  filterKeyword?: string;
  collapsed?: boolean;
  showOnlyDifferences?: boolean;
};

export interface Field {
  fieldKey: string | number | null;
  diffResult: DiffType;
  path: Array<string | number> | null;
  leftType?: Type;
  rightType?: Type;
  left?: any;
  right?: any;
  children?: IterableSummary;
}
