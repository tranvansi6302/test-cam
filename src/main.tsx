import { createRoot } from 'react-dom/client'
import './index.css'

import 'primeicons/primeicons.css'

import { PrimeReactProvider } from 'primereact/api'
import 'primereact/resources/primereact.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css'

import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'

// Create a client with default options
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: false
        }
    }
})

createRoot(document.getElementById('root')!).render(
    // Removed StrictMode which can cause double-mounting of components
    // and potentially trigger reloads with certain API patterns
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <PrimeReactProvider>
                    <App />
                </PrimeReactProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>
)
