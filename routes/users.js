const express = require('express');
const { register } = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');
const { isLoggedIn } = require('../middleware');

const users = require('../controllers/users')

const router = express.Router();

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    // keep session info: true is not secure, pass returnTo as query string in future
    // https://www.youtube.com/watch?v=i0q8YCCffoM
    .post(passport.authenticate('local',
        { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }),
        users.login);

router.get('/logout', users.logout);

module.exports = router;