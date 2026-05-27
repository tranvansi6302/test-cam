export const VALIDATE = {
    isNumber: {
        message: 'must be a valid number'
    },
    noWhitespace: {
        message: 'No whitespace allowed',
        regex: /^\S+$/
    },
    noSpecialCharacters: {
        message: 'No special characters allowed',
        regex: /^[A-Za-z0-9\s]+$/
    },
    noNumbers: {
        message: 'No numbers allowed',
        regex: /^[A-Za-z\s]+$/
    },
    moreThan0Number: {
        message: 'must be greater than zero',
        length: 0
    },
    min1Character: {
        message: 'Min One character required',
        length: 1
    },
    max24Characters: {
        message: 'Max 24 characters allowed',
        length: 24
    },
    max32Characters: {
        message: 'Max 32 characters allowed',
        length: 32
    },
    max64Characters: {
        message: 'Max 64 characters allowed',
        length: 64
    },
    max96Characters: {
        message: 'Max 96 characters allowed',
        length: 96
    },
    max128Characters: {
        message: 'Max 128 characters allowed',
        length: 128
    },
    max256Characters: {
        message: 'Max 256 characters allowed',
        length: 256
    },
    max500Characters: {
        message: 'Max 500 characters allowed',
        length: 500
    },
    max512Characters: {
        message: 'Max 512 characters allowed',
        length: 512
    },
    required: {
        message: 'required field'
    },
    email: {
        message: 'invalid email'
    },
    phomeNumberVN: {
        message: 'Please enter a valid Vietnam phone number',
        regex: /^(0|\+84)([3|5|7|8|9])([0-9]{8})$/
    },
    citizenIdVN: {
        regex: /^([0-9]{12})$/,
        message: 'Please enter a valid 12-digit Vietnamese Citizen Identification Number'
    }
}
