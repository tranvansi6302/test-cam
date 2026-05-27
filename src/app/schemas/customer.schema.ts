import * as yup from 'yup'

// Basic customer schema
export const createCustomer = yup.object().shape({
    customerName: yup.string().required('Tên KH bắt buộc nhập'),
    customerTel: yup.string().required('Số điện thoại bắt buộc nhập'),
    customerAddress: yup.string().required('Địa chỉ bắt buộc nhập')
})

// Extended schema for modal-save-customers with conditional validation
export const customerFormSchema = yup.object({
    // Fields for both modes
    staff: yup.mixed().nullable(),
    isNewCustomer: yup.boolean().default(false),

    // Existing customer fields
    customer: yup
        .mixed()
        .nullable()
        .when('isNewCustomer', {
            is: false,
            then: (schema) => schema.required('Bắt buộc chọn khách hàng')
        }),

    // New customer fields
    firstName: yup.string(),
    lastName: yup.string(),
    fullName: yup.string().trim().required('Tên khách hàng bắt buộc nhập'),
    telContact: yup
        .string()
        .trim()
        .required('Số điện thoại bắt buộc nhập')
        .matches(/^\+?\d{8,15}$/, 'Số điện thoại không hợp lệ'),
    address: yup.string().when('isNewCustomer', {
        is: true,
        then: (schema) => schema.required('Địa chỉ bắt buộc nhập')
    }),
    partnerId: yup.number().typeError('Bắt buộc chọn dành cho').required('Bắt buộc chọn dành cho')
})

export type CreateCustomerFormData = yup.InferType<typeof createCustomer>
export type CustomerModalFormData = yup.InferType<typeof customerFormSchema>
