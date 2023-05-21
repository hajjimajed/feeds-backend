const User = require('../models/user');

const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const nickname = req.body.nickname
    const password = req.body.password;
    const imageUrl = req.file.path;

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                name: name,
                nickname: nickname,
                profileImg: imageUrl
            })
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created', userId: result._id })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('user with this email dont exist');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('wrong password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                'secretcodegenerator',
                { expiresIn: '1h' }
            )
            res.status(201).json({ token: token, userId: loadedUser._id.toString() })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


exports.getData = (req, res, next) => {
    // Assuming you have the userId available from the request or the authentication process
    const userId = req.userId;

    // Find the user by their userId in the database
    User.findById(userId)
        .then(user => {
            if (!user) {
                // User not found
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            // User found, return the user data
            res.status(200).json({ message: 'User data retrieved', user: user });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

