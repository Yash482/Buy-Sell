const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;