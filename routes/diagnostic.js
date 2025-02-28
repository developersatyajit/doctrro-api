const express = require('express');
const router = require('express-promise-router')();
const dgController = require('../controllers/diagnostic');
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
router.route('/all')
  .get(dgController.all);

router.route('/services/all')
  .get(dgController.servicesList);

router.route('/find/:keyword')
	.get(signature, dgController.authentication,dgController.find)

router.route('/:id')
	.get(signature, dgController.authentication, dgController.getTimeslot)

// router.route('/signup')
//   .post(validateBody(schemas.signup), validateDbBody.signup, userController.signup)

// router.route('/login')
//   .post(validateBody(schemas.login), validateDbBody.login, userController.login)

// router.route('/user_details/:id')
//   .get(signature, userController.authentication, userController.user_details);

// router.route('/save_user_basic')
//   .post(signature, userController.authentication, validateBody(schemas.saveBasic), validateDbBody.saveBasic, userController.save_user_basic);

module.exports = router;