const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
    User.find({}, (err, users) => {
        if (err) throw err;
        res.json(users);
    });
});
router.post('/signup', cors.corsWithOptions, (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err });
        } else {
            if (req.body.firstname) user.firstname = req.body.firstname;
            if (req.body.lastname) user.lastname = req.body.lastname;
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err });
                    return;
                }
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Registration successful!' });
                });
            });
        }
    });
});
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token, status: 'You are successfully logged in!' });
});

router.get('/logout', cors.corsWithOptions, (req, res) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        const err = new Error('you are not logged in!');
        err.status = 403;
        next(err);
    }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
    if (req.user) {
        var token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, token: token, status: 'You are successfully logged in!' });
    }
});

module.exports = router;
