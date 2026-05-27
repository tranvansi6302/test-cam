import { useEffect, useState } from 'react'

// Định nghĩa type cho breakpoints
type Breakpoint = 'desktop' | 'tabletLandscape' | 'tabletPortrait' | 'mobile'

// Định nghĩa cấu hình breakpoints
const breakpoints: Record<Breakpoint, string> = {
    desktop: '(min-width: 1024px)', // Máy tính
    tabletLandscape: '(min-width: 768px) and (max-width: 1023px) and (orientation: landscape)', // Máy tính bảng nằm ngang
    tabletPortrait: '(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)', // Máy tính bảng dọc
    mobile: '(max-width: 767px)' // Điện thoại
}

// Hook trả về trạng thái của các breakpoint
const useBreakpoint = (): Record<Breakpoint, boolean> => {
    const [breakpointState, setBreakpointState] = useState<Record<Breakpoint, boolean>>({
        desktop: false,
        tabletLandscape: false,
        tabletPortrait: false,
        mobile: false
    })

    useEffect(() => {
        const updateBreakpointState = () => {
            const newState: Record<Breakpoint, boolean> = {
                desktop: window.matchMedia(breakpoints.desktop).matches,
                tabletLandscape: window.matchMedia(breakpoints.tabletLandscape).matches,
                tabletPortrait: window.matchMedia(breakpoints.tabletPortrait).matches,
                mobile: window.matchMedia(breakpoints.mobile).matches
            }
            setBreakpointState(newState)
        }

        updateBreakpointState()

        const mediaQueries = Object.values(breakpoints).map((query) => window.matchMedia(query))

        mediaQueries.forEach((mq) => {
            mq.addEventListener('change', updateBreakpointState)
        })

        return () => {
            mediaQueries.forEach((mq) => {
                mq.removeEventListener('change', updateBreakpointState)
            })
        }
    }, [])

    return breakpointState
}

export default useBreakpoint
