const express = require('express');
const router = require('express-promise-router')();
const doctorController = require('../controllers/doctor');
const passport = require('passport');
const passportConf = require('../passport');

const {
  validateBody,
  validateParam,
  schemas,
  schema_posts
} = require('../helpers/doctorValidate');
const validateDbBody = require('../helpers/doctorDbValidate');

const signature = passport.authenticate('jwt', {
  session: false
});

// start routing
router.route('/feature')
  .get(doctorController.feature);

router.route('/gender')
.get(signature, doctorController.authentication, doctorController.all_gender);

router.route('/profile')
  .get(signature, doctorController.authentication, doctorController.profile);

router.route('/other_profile')
  .get(signature, doctorController.authentication, doctorController.otherProfile);

router.route('/save_doctor_basic_info')
  .post(signature, doctorController.authentication, validateBody(schemas.saveDoctorBasic), validateDbBody.saveDoctorBasic, doctorController.save_doctor_basic_info);

router.route('/council/all')
  .get(doctorController.medicalCouncilList);

router.route('/speciality/all')
  .get(doctorController.specialityList);

router.route('/add_time_slot')
  .post(signature,doctorController.authentication,validateBody(schemas.addTimeSlot), doctorController.addTimeSlot);


router.route('/update_time_slot')
  .post(signature,doctorController.authentication,validateBody(schemas.updateTimeSlot), doctorController.updateTimeSlot);


router.route('/find_add_timeslot')
  .post(signature,doctorController.authentication,validateBody(schemas.addTimeSlot), validateDbBody.addTimeSlot, doctorController.findAddTimeSlot);

router.route('/insert_clinic')
  .post(signature,doctorController.authentication,validateBody(schemas.insertClinic), doctorController.insert_clinic);

router.route('/update_clinic')
  .put(signature,doctorController.authentication,validateBody(schemas.updateClinic),validateDbBody.updateClinic, doctorController.update_clinic);

// router.route('/update_practioner')
//   .post(signature,doctorController.authentication, doctorController.update_practioner);

router.route('/delete_clinic/:id')
  .delete(signature,doctorController.authentication,validateParam(schemas.addClinic), doctorController.delete_clinic);

router.route('/add_education')
  .post(signature,doctorController.authentication, doctorController.add_education);


router.route('/update_education')
  .put(signature,doctorController.authentication, doctorController.update_education);
  

router.route('/delete_education/:id')
  .delete(signature,doctorController.authentication,validateParam(schemas.addClinic), doctorController.delete_education);

router.route('/upload/photoid')
  .post(signature,doctorController.authentication,doctorController.photoid);

router.route('/upload/registration')
  .post(signature,doctorController.authentication,doctorController.registration);

router.route('/upload/ownership')
  .post(signature,doctorController.authentication,doctorController.ownership);

router.route('/download/:file')
  .get(signature,doctorController.authentication,doctorController.download);

router.route('/list')
  .get(doctorController.allDoctor);

router.route('/details/:id')
  .get(validateParam(schemas.viewdetails), validateDbBody.viewdetails, doctorController.doctor_details);

router.route('/upload/profilepic')
  .post(signature,doctorController.authentication,doctorController.uploadProfilePic);

router.route('/download-pic/:file')
  .get(signature,doctorController.authentication,doctorController.downloadProfPic);

router.route('/clinic_booking/:clinic_id')
  .get(signature,doctorController.authentication, doctorController.getClinicBooking);

router.route('/fetch_available_slots')
  .post(signature,doctorController.authentication, doctorController.fetchAvailableSlots);

router.route('/add_patient')
  .post(signature,doctorController.authentication, doctorController.addPatient);


router.route('/update_patient')
  .post(signature,doctorController.authentication, doctorController.updatePatient);

router.route('/date_range_user/:clinic_id/:start/:end')
  .get(signature,doctorController.authentication, doctorController.dateRangeUser);


router.route('/slot_by_date/:clinic_id/:start')
  .get(signature,doctorController.authentication, doctorController.slotByDate);


router.route('/slot_patient')
  .post(signature,doctorController.authentication, doctorController.slotPatient);


router.route('/get_booking_history')
  .get(signature,doctorController.authentication, doctorController.getBookingHistory);

router.route('/apply_leave_on_date')
  .post(signature,doctorController.authentication, doctorController.applyLeaveOnDate);

router.route('/apply_leave_on_slot')
  .post(signature,doctorController.authentication, doctorController.applyLeaveOnSlot);

router.route('/update_no_show')
  .post(signature,doctorController.authentication, doctorController.updateNoShow);  

router.route('/update_checkin')
  .post(signature,doctorController.authentication, doctorController.updateCheckIn);  

router.route('/update_checkout')
  .post(signature,doctorController.authentication, doctorController.updateCheckOut);  

router.route('/update_engage')
  .post(signature,doctorController.authentication, doctorController.updateEngage);  

router.route('/cancel_booking')
  .post(signature,doctorController.authentication, doctorController.cancelBooking);  


module.exports = router;