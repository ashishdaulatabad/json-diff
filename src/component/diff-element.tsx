import React from "react";
import {
  DiffType,
  Field,
  Info,
  IterableSummary,
  Type,
} from "../models/interface";
import DiffSummary from "./summary";
import Types from "../utils/types";
import { cn } from "../utils/classnames";

function transformString(data: string): string | JSX.Element {
  return data.match(/^https?:\/\//) ? (
    <a
      href={data}
      className="text-blue-400 underline visited:text-magenta-500"
      target="_blank"
      rel="noreferrer"
    >
      {`"${data}"`}
    </a>
  ) : (
    `"${data}"`
  );
}

function JSONPrimitiveValue(
  props: React.PropsWithRef<{ data: any; type: Type | undefined }>,
) {
  switch (props.type) {
    case Type.String:
      return transformString(props.data);
    case Type.Null:
      return "null";
    case Type.Boolean:
      return props.data ? "true" : "false";
    case Type.Number:
      return props.data;
    default:
      return null;
  }
}

function getStyleWithTypes(type: Type | undefined) {
  switch (type) {
    case Type.Null:
      return "text-red-800 dark:text-red-400";
    case Type.String:
      return "text-green-700 break-all dark:text-green-400";
    case Type.Boolean:
      return "text-purple-700 dark:text-purple-400";
    case Type.Number:
      return "text-amber-800 dark:text-amber-400";
    default:
      return "text-gray-700 dark:text-gray-400";
  }
}

function bgColorLeft(type: DiffType) {
  switch (type) {
    case DiffType.LeftOnly:
      return "bg-green-200 dark:bg-green-800";
    case DiffType.RightOnly:
      return "bg-gray-200 dark:bg-gray-800";
    case DiffType.Different:
      return "bg-yellow-200 dark:bg-yellow-800";
    default:
      return "";
  }
}

function bgColorRight(type: DiffType) {
  switch (type) {
    case DiffType.RightOnly:
      return "bg-red-200 dark:bg-red-800";
    case DiffType.LeftOnly:
      return "bg-gray-200 dark:bg-gray-800";
    case DiffType.Different:
      return "bg-yellow-200 dark:bg-yellow-800";
    default:
      return "";
  }
}

function getStylesLeft(props: Info<Field>) {
  return getStyleWithTypes(props.leftType);
}

function getStylesRight(props: Info<Field>) {
  return getStyleWithTypes(props.rightType);
}

function WidthSet(
  props: React.PropsWithoutRef<{ depth: number }>,
): JSX.Element {
  return (
    <>
      {Array.from({ length: props.depth }).map((_, index: number) => (
        <div className="border-l border-gray-400 min-w-6" key={index}></div>
      ))}
    </>
  );
}

interface CollapsibleType {
  type: Type;
  visible: boolean;
  showEllipsis: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

function Collapsible(props: React.PropsWithRef<CollapsibleType>): JSX.Element {
  if (!Types.typeIsIterable(props.type)) {
    return <></>;
  }

  const visibleChange = async () =>
    React.startTransition(() => {
      props.setVisible(!props.visible);
    });
  const cln = "before:content-[attr(data-before)]";
  const [bOpen, bClose] = props.type === Type.Array ? ["[", "]"] : ["{", "}"];

  return (
    <button
      className="px-2 py-0.25 w-full text-gray-500 flex"
      onClick={visibleChange}
    >
      <div data-before={bOpen} className={cln}></div>
      {props.showEllipsis && <div>...</div>}
      <div data-before={bClose} className={cln}></div>
    </button>
  );
}

function Key(
  props: React.PropsWithChildren<{
    fieldType: Type;
    fieldKey: string | number | null;
  }>,
): JSX.Element {
  switch (props.fieldType) {
    case Type.Number:
      return (
        <>
          <b>- {`[${props.fieldKey}]`}</b>&nbsp;
        </>
      );
    case Type.String:
      return (
        <>
          <b>{props.fieldKey}</b>:&nbsp;
        </>
      );
    default:
      return <></>;
  }
}

export default function DiffElement(
  props: React.PropsWithoutRef<Info<Field>>,
): JSX.Element {
  // To do: use this
  let [childVisible, setChildVisible] = React.useState<boolean>(
    props.collapsed ?? true,
  );
  /// To do: Something with props.children
  const depth = props.depth as number;
  const fieldType = Types.ftype(props.fieldKey);

  if (
    !props.showOnlyDifferences ||
    (props.showOnlyDifferences && props.diffResult !== DiffType.Same)
  ) {
    return !props.hasOwnProperty("children") ? (
      <div className="flex w-full hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
        <div className={cn("w-full flex p-0.5", bgColorLeft(props.diffResult))}>
          <WidthSet depth={depth} />
          <div className="w-full">
            <Key fieldKey={props.fieldKey} fieldType={fieldType} />
            <span className={getStylesLeft(props)}>
              <JSONPrimitiveValue data={props.left} type={props.leftType} />
            </span>
          </div>
        </div>
        <div
          className={cn("w-full flex p-0.5", bgColorRight(props.diffResult))}
        >
          <WidthSet depth={depth} />
          <div className="w-full">
            <Key fieldKey={props.fieldKey} fieldType={fieldType} />
            <span className={getStylesRight(props)}>
              <JSONPrimitiveValue data={props.right} type={props.rightType} />
            </span>
          </div>
        </div>
      </div>
    ) : (
      <div className="text-sm">
        <div className="flex w-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <div
            className={cn("w-full flex p-0.5", bgColorLeft(props.diffResult))}
          >
            <WidthSet depth={depth} />
            <div className="w-full flex">
              <Key fieldKey={props.fieldKey} fieldType={fieldType} />
              <span className={getStylesLeft(props)}>
                {!Types.typeIsIterable(props?.leftType as Type) ? (
                  <JSONPrimitiveValue data={props.left} type={props.leftType} />
                ) : (
                  <Collapsible
                    showEllipsis={props.children!.summary!.length > 0}
                    type={props.leftType as Type}
                    visible={childVisible}
                    setVisible={setChildVisible}
                  />
                )}
              </span>
            </div>
          </div>
          <div
            className={cn("w-full flex p-0.5", bgColorRight(props.diffResult))}
          >
            <WidthSet depth={depth} />
            <div className="w-full flex">
              <Key fieldKey={props.fieldKey} fieldType={fieldType} />
              <span className={cn(getStylesRight(props))}>
                {!Types.typeIsIterable(props?.rightType as Type) ? (
                  <JSONPrimitiveValue
                    data={props.right}
                    type={props.rightType}
                  />
                ) : (
                  <Collapsible
                    showEllipsis={props.children!.summary!.length > 0}
                    type={props.rightType as Type}
                    visible={childVisible}
                    setVisible={setChildVisible}
                  />
                )}
              </span>
            </div>
          </div>
        </div>
        {childVisible && (
          <div className="w-full flex">
            <DiffSummary
              {...(props.children as IterableSummary)}
              depth={(props?.depth ?? 0) + 1}
              filterKeyword={props.filterKeyword}
              collapsed={childVisible || false}
              showOnlyDifferences={props.showOnlyDifferences}
            />
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
}
