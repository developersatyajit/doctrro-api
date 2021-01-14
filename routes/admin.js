const express = require('express');
const router = require('express-promise-router')();
const adminController = require('../controllers/admin');
const passport = require('passport');
const passportConf = require('../passport');

const {
  validateBody,
  validateParam,
  schemas
} = require('../helpers/adminValidate');
const validateDbBody = require('../helpers/adminDbValidate');

const signature = passport.authenticate('jwt', {
  session: false
});

router.route('/login')
  .post(validateBody(schemas.login), validateDbBody.login, adminController.login)

router.route('/dashboard')
  .get(signature, adminController.authentication, adminController.dashboard)

router.route('/user_list')
  .get(signature, adminController.authentication, adminController.user_list)


router.route('/user/:id')
  .get(signature, adminController.authentication, adminController.user_details)


router.route('/download/:file/:id')
  .get(signature, adminController.authentication, adminController.downloadDocument)

  
  router.route('/change_status')
  .post(signature, adminController.authentication, validateBody(schemas.change_status), validateDbBody.change_status, adminController.change_status)


  router.route('/change_completion')
  .post(signature, adminController.authentication, validateBody(schemas.change_completion), validateDbBody.change_completion, adminController.change_completion)


// router.route('/forgot-password')
//   .post(validateBody(schemas.forgot_password), validateDbBody.forgot_password, userController.forgot_password)

// router.route('/reset_password')
//   .post(signature, userController.authentication, validateBody(schemas.reset_password), userController.reset_password)

// router.route('/submit_otp')
//   .post(validateBody(schemas.submit_otp), userController.submit_otp)


module.exports = router;