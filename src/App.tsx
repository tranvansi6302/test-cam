import { Bounce, ToastContainer } from 'react-toastify'
import './App.css'
import { useAsyncAuth } from './app/hooks/use-async-auth'
import { AppRoutes } from './app/routes/app.routes'

export default function App() {
    useAsyncAuth()

    const routers = AppRoutes()

    return (
        <main>
            {routers}
            <ToastContainer
                position='top-center'
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
                transition={Bounce}
            />
        </main>
    )
}
