const express = require('express');
const router = require('express-promise-router')();
const patientController = require('../controllers/patient');
const passport = require('passport');
const passportConf = require('../passport');

const {
  validateBody,
  validateParam,
  schemas,
  schema_posts
} = require('../helpers/patientValidate');
const validateDbBody = require('../helpers/patientDbValidate');

const signature = passport.authenticate('jwt', {
  session: false
});

router.route('/profile')
  .get(signature, patientController.authentication, patientController.profile);

router.route('/save_personal_info')
  .post(signature, patientController.authentication, 
    validateBody(schemas.savePersonalInfo), 
    validateDbBody.savePersonalInfo, 
    patientController.save_patient_personal_info);


router.route('/save_life_style')
  .post(signature, patientController.authentication, 
    validateBody(schemas.saveLifeStyle),
    patientController.save_patient_lifestyle);


router.route('/save_medical')
  .post(signature, patientController.authentication, 
    validateBody(schemas.saveMedical),
    patientController.save_patient_medical);

router.route('/upload/profilepic')
  .post(signature,patientController.authentication,patientController.uploadProfilePic);


router.route('/check_otp_booking')
  .post(patientController.checkOtpBooking);


router.route('/submit_otp_booking')
  .post(patientController.submitOtpBooking);

router.route('/booking')
  .post(signature,patientController.authentication, validateBody(schemas.booking), validateDbBody.booking, patientController.booking);



// router.route('/council/all')
//   .get(doctorController.medicalCouncilList);

// router.route('/add_time_slot')
//   .post(signature,doctorController.authentication,validateBody(schemas.addTimeSlot), validateDbBody.addTimeSlot, doctorController.addTimeSlot);

// router.route('/find_add_timeslot')
//   .post(signature,doctorController.authentication,validateBody(schemas.addTimeSlot), validateDbBody.addTimeSlot, doctorController.findAddTimeSlot);

// router.route('/insert_clinic')
//   .post(signature,doctorController.authentication,validateBody(schemas.insertClinic), doctorController.insert_clinic);

// router.route('/update_practioner')
//   .post(signature,doctorController.authentication, doctorController.update_practioner);

// router.route('/delete_clinic/:id')
//   .delete(signature,doctorController.authentication,validateParam(schemas.addClinic), doctorController.delete_clinic);

// router.route('/add_education')
//   .post(signature,doctorController.authentication, doctorController.add_education);

// router.route('/delete_education/:id')
//   .delete(signature,doctorController.authentication,validateParam(schemas.addClinic), doctorController.delete_education);



// router.route('/upload/registration')
//   .post(signature,doctorController.authentication,doctorController.registration);

// router.route('/upload/ownership')
//   .post(signature,doctorController.authentication,doctorController.ownership);

// router.route('/download/:file')
//   .get(signature,doctorController.authentication,doctorController.download);

module.exports = router;