import React from "react";
import {
  Alert,
  ShowAlert,
  setShowState,
  AlertSeverity,
} from "../component/alerts";

export type AlertMessageFn = (alert: Alert, forceShow?: boolean) => void;
export type AlertMessageNoSeverityFn = (
  alert: Omit<Alert, "severity">,
  forceShow?: boolean,
) => void;

export interface AlertsInfo {
  showMessage: AlertMessageFn;
  showSuccess: AlertMessageNoSeverityFn;
  showError: AlertMessageNoSeverityFn;
  showInfo: AlertMessageNoSeverityFn;
  showWarning: AlertMessageNoSeverityFn;
  showCustom: AlertMessageNoSeverityFn;
}

/// Context to show message to the user
export const AlertContext = React.createContext<AlertsInfo>({} as AlertsInfo);

/**
 * @description Provider for showing notification
 */
export const AlertProvider = React.memo((props: React.PropsWithChildren) => {
  const [status, setStatus] = React.useState({} as Alert);
  const showMessage = (alert: Alert) => {
    setStatus(alert);
    setShowState(true);
  };
  const showError = (alert: Omit<Alert, "severity">) => {
    setStatus({
      ...alert,
      severity: AlertSeverity.Error,
    } as Alert);
    setShowState(true);
  };
  const showSuccess = (alert: Omit<Alert, "severity">) => {
    setStatus({
      ...alert,
      severity: AlertSeverity.Success,
    } as Alert);
    setShowState(true);
  };
  const showInfo = (alert: Omit<Alert, "severity">) => {
    setStatus({
      ...alert,
      severity: AlertSeverity.Info,
    } as Alert);
    setShowState(true);
  };
  const showCustom = (alert: Omit<Alert, "severity">) => {
    setStatus({
      ...alert,
      severity: AlertSeverity.Custom,
    } as Alert);
    setShowState(true);
  };
  const showWarning = (alert: Omit<Alert, "severity">) => {
    setStatus({
      ...alert,
      severity: AlertSeverity.Warning,
    } as Alert);
    setShowState(true);
  };
  const show = {
    showMessage,
    showError,
    showSuccess,
    showInfo,
    showCustom,
    showWarning,
  };
  return (
    <>
      <AlertContext.Provider value={show}>
        {props.children}
      </AlertContext.Provider>
      <ShowAlert show={status} />
    </>
  );
});
