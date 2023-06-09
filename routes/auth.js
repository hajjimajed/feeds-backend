const express = require('express');

const { body } = require('express-validator');

const authController = require('../controllers/auth');

const User = require('../models/user');

const isAuth = require('../middleware/is-auth')

const router = express.Router();

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('email address already used');
                    }
                })
        })
        .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
],
    authController.signup);

router.put('/user-data', isAuth, [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('name').trim().not().isEmpty(),
    body('nickname').trim().not().isEmpty()
], authController.updateUserData);


router.post('/login', authController.login)

router.get('/user-data', isAuth, authController.getData)


module.exports = router;