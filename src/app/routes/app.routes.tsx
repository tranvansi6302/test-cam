import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useRoutes, useSearchParams } from 'react-router-dom'
import { beautyApi } from '../apis/beauty.api'
import { companyApi } from '../apis/company.api'
import NotFound from '../errors/NotFound'
import { useIpAddress } from '../hooks/use-ip-address'
import AIFaceAnalyzer from '../pages/ai-face-analyzer'
import AIFaceWebcam from '../pages/ai-face-webcam'
import WebcamIpad from '../pages/customer-awaiting/_components/webcam-ipad'
import CustomerAwaiting from '../pages/customer-awaiting/customer-awaiting'
import Home from '../pages/home'
import Login from '../pages/login'
import LoginCheck from '../pages/login/login-check'
import { LoginResponse } from '../types/company.type'
import { getProfileLocalStorage } from '../utils/storage'
import { useAdminStore } from '../stores/admin.store'

// Security route that checks both authentication and IP address
export const SecureRoute = () => {
    const profile = getProfileLocalStorage() as LoginResponse
    const { publicIP } = useIpAddress()
    const { admin } = useAdminStore()

    // Always call hooks at the top level, regardless of conditions
    const { data: checkCompany, isLoading: isCheckingCompany } = useQuery({
        queryKey: ['checkCompany', profile?.id],
        queryFn: () => companyApi.getCheckCompanyById(profile?.id?.toString() ?? ''),
        enabled: !!profile?.id
    })

    console.log('checkCompany', checkCompany)
    console.log('publicIP', publicIP)

    // If admin is logged in, allow access to everything without IP check
    if (admin?.id) {
        return <Outlet />
    }

    // If we don't have publicIP yet, show loading or wait
    if (!publicIP) {
        return null
    }

    // // If still checking company data, show loading
    if (isCheckingCompany) {
        return null
    }

    // If we have all data, check IP match (only for non-admin users)
    if (checkCompany?.data.data.ipNetworkDeclare !== publicIP) {
        return <NotFound />
    }

    return <Outlet />
}

// Legacy routes kept for backward compatibility
export const PrivateRoute = () => {
    const profile = getProfileLocalStorage() as LoginResponse

    if (!profile?.token) {
        return <Navigate to='/14.241.237.27' />
    }

    return <Outlet />
}

export const PrivateRouteWithIp = SecureRoute

export const PublicRoute = () => {
    const profile = getProfileLocalStorage() as LoginResponse
    if (profile?.token) {
        return <Navigate to={'/'} />
    }
    return <Outlet />
}

export const CustomerAnylzer = () => {
    const [searchParams] = useSearchParams()
    const faceId = searchParams.get('faceId')
    const { data: aiFace, isLoading } = useQuery({
        queryKey: ['AI_FACE', faceId],
        queryFn: () => beautyApi.getFaceAIById(faceId || ''),
        enabled: !!faceId
    })

    if (!isLoading && aiFace && aiFace?.data.data.isActived !== 0) {
        return <Navigate state={{ message: 'Khách hàng đã hoàn thành dịch vụ' }} to={'/ai-face-analyzer-list'} />
    }
    return <Outlet />
}

export const AppRoutes = () =>
    useRoutes([
        // Public login check
        {
            path: '/login-check',
            element: <LoginCheck />
        },
        {
            path: '/14.241.237.27',
            element: <Login />
        },

        {
            element: <SecureRoute />,
            path: '',

            children: [
                {
                    path: '/',
                    element: <Home />
                },

                {
                    path: '/ai-face',
                    element: <AIFaceWebcam onCapture={() => {}} />
                },
                {
                    element: <CustomerAnylzer />,
                    children: [
                        {
                            path: '/ai-face-analyzer',
                            element: <AIFaceAnalyzer />
                        }
                    ]
                },
                {
                    path: '/ai-face-analyzer-list',
                    element: <CustomerAwaiting />
                },

                {
                    path: '/webcam-ipad',
                    element: <WebcamIpad />
                }
            ]
        },
        {
            path: '*',
            element: <NotFound />
        }
    ])
