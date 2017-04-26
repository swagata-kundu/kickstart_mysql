/**
 * API errors definition
 * @type {Object}
 */
module.exports = {


    auth_token_required: {
        error_code: 'SESSIONID_REQUIRED',
        description: 'User need to login before accessing this.'
    },

    invalid_auth_token: {
        error_code: 'INVALID_SESSIONID',
        description: 'This session has been expired'
    },

    invalid_auth_credentials: {
        error_code: 'INVALID_AUTH_CRED',
        description: 'Authorization credentials are invalid'
    },

    user_disabled: {
        error_code: 'USER_DISABLED',
        description: 'User account has been disabled. API use or login is not allowed.'
    },

    already_registered: {
        error_code: 'ALREADY_REGISTERED',
        description: 'User is already registered'
    },

    invalid_operation: {
        error_code: 'INVALID_OPERATION',
        description: 'The requested operation is not allowed due to logical or business rules. Cannot proceed.'
    },

    no_resource_access: {
        error_code: 'NO_RESOURCE_ACCESS',
        description: 'User does not have required level of access to the requested resource.'
    },
    file_type_not_allowed: {
        error_code: 'INVALID_FILE_TYPE',
        description: 'This type of file cannot be uploaded.'
    },

    file_size_exceeds_limit: {
        error_code: 'FILE_SIZE_EXCEEDS_LIMIT',
        description: 'The file size exceeds the allowed limits.'
    },

    already_reserved: {
        error_code: 'RESTAURENT_ALREADY_RESERVED',
        description: 'Reservation already exists for provided time slot'
    },
    already_added_coupon: {
        error_code: 'COUPON_ALREADY_ADDED',
        description: 'You have already added this coupon'
    },
    already_subscribed: {
        error_code: 'SUBSCRIBED_ALREADY',
        description: 'Email id already subscribed'
    },
    coupon_empty: {
        error_code: 'NO_COUPONS_LEFT',
        description: 'No coupons are available'
    },
    not_allowed_login: {
        error_code: 'NOT_ALLOWED_LOGIN',
        description: 'This user is linked with a different city account. Please go to that website for login'
    },
    user_not_registered: {
        error_code: 'USER_NOT_REGISTERED',
        description: 'User does not exist'
    },
    user_not_artist: {
        error_code: 'USER_NOT_ARTIST',
        description: 'User is not an artist'
    },
    feature_not_allowed: {
        error_code: 'FEATURE_NOT_AVAIABLE',
        description: 'This feature is not available for this business'
    },
    marked_spam: {
        error_code: 'MARKED_SPAM',
        description: 'Your mail has been marked spam'
    },
    already_replied: {
        error_code: 'ALREADY_REPLIED',
        description: 'You have already replied to this review'
    },
    already_spam: {
        error_code: 'ALREADY_MARKED_SPAM',
        description: 'User already marked spam to review'
    },
    wrong_oldpassword: {
        error_code: 'WRONG_PASSWORD',
        description: 'Wrong old password'
    },
    not_allowed_login_admin: {
        error_code: 'NOT_ALLOWED_LOGIN',
        description: 'This user is linked to a business organization or band.  Please use a personal email to set up User Account and Sign In'
    }
};