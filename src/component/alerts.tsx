import React from "react";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";
import CheckBadge from "@heroicons/react/24/solid/CheckBadgeIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";
import InformationCircleIcon from "@heroicons/react/24/solid/InformationCircleIcon";

export enum AlertSeverity {
  Error,
  Warning,
  Info,
  Success,
  Custom,
}

interface AlertBase {
  severity: AlertSeverity;
  header: string;
  lifems?: number;
  sticky?: boolean;
}

interface AlertText extends AlertBase {
  message: string;
  messageHtml?: never;
}

export interface AlertHtml extends AlertBase {
  messageHtml: string;
  message?: never;
}

export type Alert = AlertText | AlertHtml;

function Icon(
  props: React.PropsWithoutRef<{ severity: AlertSeverity }>,
): JSX.Element {
  switch (props.severity) {
    case AlertSeverity.Warning:
      return <ExclamationTriangleIcon />;
    case AlertSeverity.Success:
      return <CheckBadge />;
    case AlertSeverity.Error:
      return <XCircleIcon />;
    default:
      return <InformationCircleIcon />;
  }
}

function ClassSeverity(sev: AlertSeverity): string {
  switch (sev) {
    case AlertSeverity.Success:
      return "bg-green-600";
    case AlertSeverity.Info:
      return "bg-blue-600";
    case AlertSeverity.Error:
      return "bg-red-600";
    case AlertSeverity.Warning:
      return "bg-yellow-600";
    case AlertSeverity.Custom:
      return "bg-purple-600";
  }
}

export let setShowState: any = null;

/**
 * @description Notification description
 */
export function ShowAlert(
  props: React.PropsWithoutRef<{ show: Alert }>,
): JSX.Element {
  let className =
    "flex justify-center flex-col top-0 left-0 w-full h-28 text-white text-center rounded-s shadow-lg ease-in-out transition-all fixed";

  const [showState, setSState] = React.useState<boolean>(false);
  setShowState = setSState;

  React.useEffect(() => {
    let clearTimeoutId: NodeJS.Timeout;
    if (showState && !props.show.sticky) {
      clearTimeoutId = setTimeout(
        () => setSState(false),
        props.show.lifems || 3000,
      );
    }

    return () => {
      clearTimeoutId && clearTimeout(clearTimeoutId);
    };
  });

  return (
    <div
      className={
        className +
        (showState
          ? " translate-y-0 opacity-100"
          : " -translate-y-24 opacity-0") +
        (" " + ClassSeverity(props.show.severity))
      }
    >
      <div className="flex fixed w-full justify-end">
        <div className="top-0 w-8 rounded-full border transition-all ease-in mr-10 cursor-pointer">
          <XMarkIcon onClick={(_) => setSState(false)} />
        </div>
      </div>
      <div className="flex flex-row justify-center header">
        <div className="icon w-11 flex flex-col justify-center text-center">
          <Icon severity={props.show.severity} />
        </div>
        <div className="ml-5 text-left">
          <h1 className="font-bold">{props.show.header}</h1>
          <p>{props.show.message}</p>
        </div>
      </div>
    </div>
  );
}
