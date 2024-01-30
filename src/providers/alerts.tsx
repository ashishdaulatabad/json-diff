import React from 'react'
import { Alert, ShowAlert, setShowState } from '../component/alerts'

export type AlertMessageFn = (alert: Alert, forceShow?: boolean) => void

// Show Message to the user
let showMessage: AlertMessageFn
export const AlertContext = React.createContext<AlertMessageFn | null>(null)

/**
 * @description Provider for showing notification
 */
export const AlertProvider = React.memo((props: React.PropsWithChildren) => {
    const [status, setStatus] = React.useState({} as Alert) 
    showMessage = (alert: Alert) => {
        setStatus(alert)
        setShowState(true)
    }

    return (
        <>
            <AlertContext.Provider value={showMessage}>
                {props.children}
            </AlertContext.Provider>
            <ShowAlert show={status} />
        </>
    )
})
