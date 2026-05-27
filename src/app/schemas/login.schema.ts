import * as yup from 'yup'

// Basic customer schema
export const loginSchema = yup.object().shape({
    taxCode: yup.string().required('Mã số thuế bắt buộc nhập'),
    // Password validation with separate conditions
    password: yup.string().required('Mật khẩu bắt buộc nhập')
    // .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    // .matches(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
    // .matches(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
    // .matches(/\d/, 'Phải có ít nhất 1 số')
    // .matches(/[@$!%*?&]/, 'Phải có ít nhất 1 ký tự đặc biệt')
    // .matches(/^[A-Za-z\d@$!%*?&]*$/, 'Không được chứa tiếng Việt')
})

export type LoginForm = yup.InferType<typeof loginSchema>

// Basic customer schema
export const loginSchemaCheck = yup.object().shape({
    username: yup.string().required('Mã số thuế bắt buộc nhập'),
    // Password validation with separate conditions
    password: yup.string().required('Mật khẩu bắt buộc nhập')
    // .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    // .matches(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
    // .matches(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
    // .matches(/\d/, 'Phải có ít nhất 1 số')
    // .matches(/[@$!%*?&]/, 'Phải có ít nhất 1 ký tự đặc biệt')
    // .matches(/^[A-Za-z\d@$!%*?&]*$/, 'Không được chứa tiếng Việt')
})

export type LoginFormCheck = yup.InferType<typeof loginSchemaCheck>

