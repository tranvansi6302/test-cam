import { useState, useEffect } from 'react'

// Hook to detect both browser name and device information
export const useDeviceAndBrowser = () => {
    const [browserName, setBrowserName] = useState('Unknown')
    const [deviceInfo, setDeviceInfo] = useState('Unknown')

    useEffect(() => {
        const userAgent = navigator.userAgent

        // Detect browser name
        let name = 'Unknown'
        if (userAgent.indexOf('Firefox') > -1) {
            name = 'Mozilla Firefox'
        } else if (userAgent.indexOf('SamsungBrowser') > -1) {
            name = 'Samsung Browser'
        } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
            name = 'Opera'
        } else if (userAgent.indexOf('Trident') > -1) {
            name = 'Internet Explorer'
        } else if (userAgent.indexOf('Edge') > -1) {
            name = 'Microsoft Edge (Legacy)'
        } else if (userAgent.indexOf('Edg') > -1) {
            name = 'Microsoft Edge (Chromium)'
        } else if (userAgent.indexOf('Chrome') > -1) {
            name = 'Google Chrome'
        } else if (userAgent.indexOf('Safari') > -1) {
            name = 'Safari'
        }
        setBrowserName(name)

        // Detect device information
        let deviceType = 'Unknown'
        if (/Android/i.test(userAgent)) {
            deviceType = 'Android Device'
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            deviceType = 'iOS Device'
        } else if (/Windows/i.test(userAgent)) {
            deviceType = 'Windows PC'
        } else if (/Mac/i.test(userAgent)) {
            deviceType = 'Mac'
        } else if (/Linux/i.test(userAgent)) {
            deviceType = 'Linux'
        }
        setDeviceInfo(deviceType)
    }, [])

    return { browserName, deviceInfo }
}
