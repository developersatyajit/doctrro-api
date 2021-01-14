const express = require('express');
const router = require('express-promise-router')();
const userController = require('../controllers/user');
const passport = require('passport');
const passportConf = require('../passport');

const {
  validateBody,
  validateParam,
  schemas,
  schema_posts
} = require('../helpers/userValidate');
const validateDbBody = require('../helpers/userDbValidate');

const signature = passport.authenticate('jwt', {
  session: false
});

// start routing
router.route('/roles')
  .get(userController.fetch_all_role);

router.route('/signup')
  .post(validateBody(schemas.signup), validateDbBody.signup, userController.signup)

router.route('/login')
  .post(validateBody(schemas.login), validateDbBody.login, userController.login)

router.route('/bloodgroup/all')
.get( userController.all_blood_group);

router.route('/user_details/:id')
  .get(signature, userController.authentication, userController.user_details);

router.route('/forgot-password')
  .post(validateBody(schemas.forgot_password), validateDbBody.forgot_password, userController.forgot_password)

router.route('/reset_password')
  .post(signature, userController.authentication, validateBody(schemas.reset_password), userController.reset_password)

router.route('/submit_otp')
  .post(validateBody(schemas.submit_otp), userController.submit_otp)

router.route('/otp_login')
  .post(validateBody(schemas.submit_otp), userController.otp_login)


module.exports = router;