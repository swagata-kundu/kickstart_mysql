/**
 * API events definitions
 * @type {Object}
 */
module.exports = {

    reservation_changed: {
        event_code: 'RESERVATION_CHANGED',
        description: 'Reservation status changed for customer',
        delivery: ['db', 'push'],
        db_code: 1
    },
    coupon_created: {
        event_code: 'COUPON_CREATED',
        description: 'Coupons created for a business',
        delivery: ['db', 'push'],
        db_code: 2
    },
    event_created: {
        event_code: 'EVENT_CREATED',
        description: 'Event created for a business',
        delivery: ['db', 'push', 'mail'],
        db_code: 3
    },
    special_created: {
        event_code: 'SPECIAL_CREATED',
        description: 'Event created for a business',
        delivery: ['db', 'push', 'mail'],
        db_code: 4
    },
    custom_notification_business: {
        event_code: 'BUSINESS_CUSTOM',
        description: 'Send custom notification to users who marked business favourite',
        delivery: ['db', 'push'],
        db_code: 5
    },
    forget_password: {
        event_code: 'FORGET_PASSWORD',
        description: 'Send forget password email',
        delivery: ['mail']
    },
    user_signup: {
        event_code: 'USER_SIGNUP',
        description: 'Send sign up mail',
        delivery: ['mail']
    },

    listing_created: {
        event_code: 'LISTING_CREATED',
        description: 'Send listing creation mail',
        delivery: ['mail']
    }
};