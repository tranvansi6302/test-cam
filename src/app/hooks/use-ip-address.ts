import { useEffect, useState } from 'react'
import { getIPAddresses } from '../utils/ip.util'

/**
 * Hook to fetch public and local IP addresses
 * @returns Object containing publicIP, localIP, and loading state
 */
export const useIpAddress = () => {
    const [publicIP, setPublicIP] = useState<string | null>(null)
    const [localIP, setLocalIP] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchIPs = async () => {
            try {
                const { publicIP, localIP } = await getIPAddresses()
                setPublicIP(publicIP)
                setLocalIP(localIP)
            } catch (error) {
                console.error('Error fetching IP addresses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchIPs()
    }, [])

    return { publicIP, localIP, loading }
}
