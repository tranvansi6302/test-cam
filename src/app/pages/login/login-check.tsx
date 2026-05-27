import { useMutation } from '@tanstack/react-query'
import { InputText } from 'primereact/inputtext'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import adminCheck from '../../../assets/imgs/adminCheck.jpg'
import { emAccessCommandApi } from '../../apis/em-access.api'
import { employeeQueryApi } from '../../apis/employee.api'
import DotStyleLogin from '../../components/dot-style-login'
import { useIpAddress } from '../../hooks/use-ip-address'
import { EmployeeType, useAdminStore } from '../../stores/admin.store'
import { LoginEmployeeRequestType } from '../../types/api.type'
import { saveProfileAdminLocalStorage, saveProfileLocalStorage } from '../../utils/storage'

export default function LoginCheck() {
    const navigate = useNavigate()
    const { setAdmin } = useAdminStore()
    const { publicIP } = useIpAddress()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginEmployeeRequestType>({
        defaultValues: {
            empCode: '',
            password: ''
        }
    })

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: emAccessCommandApi.loginEmployee
    })
    const onSubmit = (data: LoginEmployeeRequestType) => {
        console.log(data)
        loginMutation.mutateAsync(data, {
            // Default data

            onSuccess: async (res) => {
                // Temp fix
                toast.success('Đăng nhập thành công')
                // Save profile to session storage

                saveProfileLocalStorage(res.data)
                const resp = await employeeQueryApi.getEmployeeById(res.data.id, res.data.token)
                console.log('resp', resp)
                setAdmin(resp.data as unknown as EmployeeType)
                saveProfileAdminLocalStorage(resp.data as unknown as EmployeeType)
                // Redirect to home page
                navigate('/')
            },
            onError: () => {
                toast.error('Đăng nhập thất bại')
            }
        })
    }
    return (
        <div
            className='flex flex-col items-center justify-between pt-0 pr-10 pb-0 pl-10 mt-0 mr-auto mb-0 ml-auto max-w-7xl
xl:px-5 lg:flex-row'
        >
            <div className='flex flex-col items-center w-full pt-5 pr-10 pb-20 pl-10 lg:pt-20 lg:flex-row'>
                <div className='w-full bg-cover relative max-w-md lg:max-w-2xl lg:w-7/12'>
                    <div className='flex flex-col items-center justify-center w-full h-full relative lg:pr-10'>
                        <img src={adminCheck} className='w-[60%] h-full object-cover' />
                    </div>
                </div>
                <div className='w-full mt-20 mr-0 mb-0 ml-0 relative z-10 max-w-2xl lg:mt-0 lg:w-5/12'>
                    <div
                        className='flex flex-col items-start justify-start pt-10 pr-10 pb-10 pl-10 bg-white shadow-2xl rounded-xl
      relative z-10'
                    >
                        <p className='w-full text-2xl font-medium text-center leading-snug'>Đăng nhập vào cơ sở</p>

                        {(errors.empCode || errors.password) && (
                            <div className='p-4 mt-3 text-sm text-yellow-800 rounded-lg bg-yellow-50 w-full' role='alert'>
                                <span className='font-medium'>Lỗi!</span> Vui lòng kiểm tra lại thông tin
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className='w-full mt-4 mr-0 mb-0 ml-0 flex flex-col gap-3'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm text-gray-500' htmlFor='username'>
                                    Tên đăng nhập
                                </label>
                                <InputText
                                    {...register('empCode')}
                                    placeholder='Nhập tên đăng nhập'
                                    className={`p-inputtext-sm w-full text-sm ${errors.empCode ? 'p-invalid' : ''}`}
                                    id='empCode'
                                    aria-describedby='username'
                                />
                                {errors.empCode && (
                                    <small className='text-red-500 text-xs' id='empCode'>
                                        {errors.empCode?.message}
                                    </small>
                                )}
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm text-gray-500' htmlFor='password'>
                                    Mật khẩu
                                </label>
                                <InputText
                                    {...register('password')}
                                    placeholder='Nhập mật khẩu'
                                    className={`p-inputtext-sm w-full text-sm ${errors.password ? 'p-invalid' : ''}`}
                                    id='password'
                                    aria-describedby='password'
                                    type='password'
                                />
                                {errors.password && (
                                    <small className='text-red-500 text-xs' id='password'>
                                        {errors.password?.message}
                                    </small>
                                )}
                            </div>
                            <p className='text-sm text-gray-500 text-right'>
                                <Link to='/register'>Quên mật khẩu?</Link>
                            </p>
                            <button
                                type='submit'
                                className='cursor-pointer mt-4 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'
                            >
                                Đăng nhập
                            </button>
                        </form>

                        <div className='w-full mt-6 border-t border-gray-200 pt-4'>
                            <div className='flex flex-col items-center'>
                                {publicIP && (
                                    <div className='mt-3 text-center'>
                                        <p className='text-sm text-gray-700'>Địa chỉ IP của router</p>
                                        <p className='text-md font-semibold text-green-600 mt-2'>Public IP: {publicIP}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DotStyleLogin />
                </div>
            </div>
        </div>
    )
}
