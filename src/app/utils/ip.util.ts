/**
 * Network connection information interface
 */
interface NetworkInformation {
    effectiveType?: string
    type?: string
    downlinkMax?: number
    downlink?: number
    rtt?: number
    saveData?: boolean
}

/**
 * Extended Navigator interface with connection property
 */
interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation
    mozConnection?: NetworkInformation
    webkitConnection?: NetworkInformation
}

/**
 * Get browser network information using Navigator.connection API
 * Note: This API is experimental and not supported in all browsers
 */

interface BrowserNetwork {
    online: boolean
    effectiveType: string | null
    type: string | null
    downlinkMax: number | null
    downlink: number | null
    rtt: number | null
    saveData: boolean
}

export const getBrowserNetwork = (): BrowserNetwork => {
    // Check if running in browser environment
    if (typeof window === 'undefined' || !navigator) {
        return {
            online: navigator.onLine,
            effectiveType: null,
            type: null,
            downlinkMax: null,
            downlink: null,
            rtt: null,
            saveData: false
        }
    }

    const nav = navigator as NavigatorWithConnection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection

    if (!connection) {
        return {
            online: navigator.onLine,
            effectiveType: null,
            type: null,
            downlinkMax: null,
            downlink: null,
            rtt: null,
            saveData: false
        }
    }

    return {
        online: navigator.onLine,
        effectiveType: connection.effectiveType || null, // 4g, 3g, 2g, slow-2g
        type: connection.type || null, // wifi, cellular, etc.
        downlinkMax: connection.downlinkMax || null, // Maximum downlink speed in Mbps
        downlink: connection.downlink || null, // Current downlink speed in Mbps
        rtt: connection.rtt || null, // Round-trip time in ms
        saveData: connection.saveData || false // Data-saver enabled
    }
}

/**
 * Hàm thử kết nối đến các địa chỉ gateway router phổ biến
 * @returns Promise với địa chỉ IP của router hoặc null nếu không tìm thấy
 */
export const getWifiRouterIP = async (): Promise<string | null> => {
    // Danh sách các địa chỉ IP router phổ biến
    const commonRouterIPs = [
        '192.168.0.1',
        '192.168.1.1',
        '10.0.0.1',
        '192.168.2.1',
        '192.168.0.254',
        '192.168.1.254',
        '10.0.0.138',
        '10.1.1.1'
    ]

    // Kiểm tra môi trường
    if (typeof window === 'undefined') {
        return null // Không thể kiểm tra trong môi trường server
    }

    // Thử kết nối đến tất cả các địa chỉ IP phổ biến
    for (const ip of commonRouterIPs) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 1000)

            const response = await fetch(`http://${ip}`, {
                mode: 'no-cors',
                signal: controller.signal
            }).catch(() => null)

            clearTimeout(timeoutId)

            if (response) {
                return ip
            }
        } catch {
            // Tiếp tục với địa chỉ IP tiếp theo
        }
    }

    return null
}

/**
 * Định nghĩa các interface cho WebRTC
 */
interface WebRTCWindow extends Window {
    webkitRTCPeerConnection?: RTCPeerConnection
    mozRTCPeerConnection?: RTCPeerConnection
}

/**
 * Lấy thông tin kết nối mạng từ RTCPeerConnection API
 * Có thể được sử dụng để xác định địa chỉ IP cục bộ của thiết bị
 */
export const getLocalNetworkInfo = (): Promise<string[]> => {
    return new Promise((resolve) => {
        // Kiểm tra môi trường
        if (typeof window === 'undefined') {
            resolve([])
            return
        }

        const ipAddresses: string[] = []

        try {
            const webRTCWindow = window as WebRTCWindow
            const RTCPeerConnection =
                window.RTCPeerConnection || webRTCWindow.webkitRTCPeerConnection || webRTCWindow.mozRTCPeerConnection

            if (!RTCPeerConnection) {
                resolve([])
                return
            }

            const pc = new RTCPeerConnection({
                iceServers: []
            })

            pc.createDataChannel('')

            pc.onicecandidate = (event) => {
                if (!event.candidate) {
                    pc.close()
                    resolve(ipAddresses)
                    return
                }

                const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
                const ipMatch = ipRegex.exec(event.candidate.candidate)

                if (ipMatch && ipMatch[1]) {
                    const ip = ipMatch[1]

                    // Chỉ lấy địa chỉ IP private
                    if (
                        ip.startsWith('192.168.') ||
                        ip.startsWith('10.') ||
                        ip.startsWith('172.16.') ||
                        ip.startsWith('172.17.') ||
                        ip.startsWith('172.18.') ||
                        ip.startsWith('172.19.') ||
                        ip.startsWith('172.20.') ||
                        ip.startsWith('172.21.') ||
                        ip.startsWith('172.22.') ||
                        ip.startsWith('172.23.') ||
                        ip.startsWith('172.24.') ||
                        ip.startsWith('172.25.') ||
                        ip.startsWith('172.26.') ||
                        ip.startsWith('172.27.') ||
                        ip.startsWith('172.28.') ||
                        ip.startsWith('172.29.') ||
                        ip.startsWith('172.30.') ||
                        ip.startsWith('172.31.')
                    ) {
                        if (!ipAddresses.includes(ip)) {
                            ipAddresses.push(ip)
                        }
                    }
                }
            }

            pc.createOffer()
                .then((offer) => pc.setLocalDescription(offer))
                .catch(() => {
                    pc.close()
                    resolve([])
                })

            // Đặt timeout để đảm bảo hàm sẽ kết thúc
            setTimeout(() => {
                pc.close()
                resolve(ipAddresses)
            }, 2000)
        } catch {
            resolve([])
        }
    })
}

/**
 * Kết hợp các phương pháp để lấy thông tin mạng WiFi router
 */
export const getWifiNetworkInfo = async (): Promise<{
    routerIP: string | null
    localIPs: string[]
    subnetMask: string
    networkClass: string
}> => {
    const routerIP = await getWifiRouterIP()
    const localIPs = await getLocalNetworkInfo()

    // Xác định lớp mạng và subnet mask dựa trên IP cục bộ đầu tiên
    let subnetMask = '255.255.255.0' // Mặc định là Class C
    let networkClass = 'C'

    if (localIPs.length > 0) {
        const firstOctet = parseInt(localIPs[0].split('.')[0])

        if (firstOctet >= 1 && firstOctet <= 126) {
            networkClass = 'A'
            subnetMask = '255.0.0.0'
        } else if (firstOctet >= 128 && firstOctet <= 191) {
            networkClass = 'B'
            subnetMask = '255.255.0.0'
        }
    }

    return {
        routerIP,
        localIPs,
        subnetMask,
        networkClass
    }
}

/**
 * Lấy địa chỉ IP public và local như trong ví dụ login.tsx
 * @returns Promise với thông tin IP public và local
 */
export const getWifiAddress = async (): Promise<{
    publicIP: string | null
    localIP: string | null
}> => {
    let publicIP: string | null = null
    let localIP: string | null = null

    // Lấy IP public
    try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        publicIP = data.ip
    } catch (error) {
        console.error('Không thể lấy địa chỉ IP public:', error)
    }

    // Lấy địa chỉ IP local qua WebRTC
    try {
        // Kiểm tra môi trường
        if (typeof window === 'undefined') {
            return { publicIP, localIP }
        }

        return new Promise((resolve) => {
            const pc = new RTCPeerConnection({ iceServers: [] })
            pc.createDataChannel('')

            pc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate || !ice.candidate.candidate) return

                const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)
                if (ipMatch && ipMatch[1]) {
                    localIP = ipMatch[1]
                    pc.onicecandidate = null
                    pc.close()
                    resolve({ publicIP, localIP })
                }
            }

            pc.createOffer()
                .then((offer) => pc.setLocalDescription(offer))
                .catch(() => {
                    pc.close()
                    resolve({ publicIP, localIP })
                })

            // Đặt timeout để đảm bảo hàm sẽ kết thúc
            setTimeout(() => {
                pc.close()
                resolve({ publicIP, localIP })
            }, 2000)
        })
    } catch (error) {
        console.error('Không thể lấy địa chỉ IP local:', error)
        return { publicIP, localIP }
    }
}

/**
 * Get public IP address without using third-party APIs like ipify
 * Uses multiple fallback services to increase reliability
 * @returns Promise with public IP address or null if failed
 */
export const getPublicIPWithoutThirdParty = async (): Promise<string | null> => {
    // List of services that return IP in simple text or JSON format
    const services = [
        { url: 'https://ifconfig.me/ip', parser: async (res: Response) => await res.text() },
        { url: 'https://api.ipify.org', parser: async (res: Response) => await res.text() },
        { url: 'https://icanhazip.com', parser: async (res: Response) => (await res.text()).trim() },
        { url: 'https://wtfismyip.com/text', parser: async (res: Response) => (await res.text()).trim() },
        { url: 'https://checkip.amazonaws.com', parser: async (res: Response) => (await res.text()).trim() },
        { url: 'https://ip.seeip.org', parser: async (res: Response) => await res.text() }
    ]

    // Try each service until one succeeds
    for (const service of services) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)

            const response = await fetch(service.url, {
                signal: controller.signal,
                headers: { Accept: 'text/plain' }
            })

            clearTimeout(timeoutId)

            if (response.ok) {
                const ip = await service.parser(response)
                // Validate IP format using regex
                if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                    return ip
                }
            }
        } catch (error) {
            // Continue to next service
            console.error(`Failed to get IP from ${service.url}:`, error)
        }
    }

    return null
}

/**
 * Updated function to get both public and local IP addresses without third-party dependency
 * @returns Promise with object containing both IP addresses
 */
export const getIPAddressesWithoutThirdParty = async (): Promise<{
    publicIP: string | null
    localIP: string | null
}> => {
    const [publicIP, localIP] = await Promise.all([getPublicIPWithoutThirdParty(), getLocalIP()])

    return {
        publicIP,
        localIP
    }
}

/**
 * Get local IP address using WebRTC
 * @returns Promise with local IP address or null if failed
 */
export const getLocalIP = async (): Promise<string | null> => {
    return new Promise((resolve) => {
        try {
            const pc = new RTCPeerConnection({ iceServers: [] })
            pc.createDataChannel('')
            pc.createOffer().then((offer) => pc.setLocalDescription(offer))

            pc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate || !ice.candidate.candidate) return

                const localIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)?.[1]
                if (localIP) {
                    pc.onicecandidate = null
                    pc.close()
                    resolve(localIP)
                }
            }

            // Set timeout to ensure the promise resolves
            setTimeout(() => {
                pc.close()
                resolve(null)
            }, 2000)
        } catch (error) {
            console.error('Failed to get local IP:', error)
            resolve(null)
        }
    })
}

/**
 * Get both public and local IP addresses
 * @returns Promise with object containing both IP addresses
 */
export const getIPAddresses = async (): Promise<{
    publicIP: string | null
    localIP: string | null
}> => {
    const [publicIP, localIP] = await Promise.all([getPublicIPWithoutThirdParty(), getLocalIP()])

    return {
        publicIP,
        localIP
    }
}
