
const patientModel = require('../models/patient');
const Entities = require('html-entities').AllHtmlEntities;
const config = require('../configuration/config');
const entities = new Entities();
const dateformat = require('dateformat');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userController = require('./user');
const handler = require('../configuration/sms_handler');
const userModel = require('../models/user')
const clinicModel = require('../models/diagnostic')
const JWT = require('jsonwebtoken');

module.exports = {
  authentication: async (req, res, next) => {
    if (req.user.id > 0 && req.user.role != null) {
      next();
    } else {
      let return_err = {
        status: 5,
        message: "Unauthorized"
      };
      return res.status(401).json({return_err});
    }
  },
  profile: async (req, res, next) => {
      await patientModel.getPatientBasic(req.user.id, req.user.role)
        .then(async (basic) =>  {

          if(basic[0].filename != '' && basic[0].filename != null){
            let url = req.protocol + '://' + req.get('host') + '/uploads/profilepic/' + basic[0].filename;

            basic[0] = {...basic[0], filename: url }
          }else{
            basic[0] = {...basic[0], filename: null }
          }

          res.status(200).json({
            status: "1",
            data: basic[0]
          });

        }).catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },
  save_patient_personal_info : async (req, res, next) => {
    const {
      blood_group,
      contact,
      dob,
      email,
      feet,
      gender,
      inch,
      //location,
      //map,
      //marker,
      weight
     } = req.body

      let user_arr = {
        blood_group : blood_group.value,
        email : entities.encode(email),
        contact : contact,
        gender : gender.value,
        dob : dob,
        feet: feet,
        inch : inch,
        weight: weight,
        //location : location,
        //map: map,
        //marker: marker,
        update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
      }

      await patientModel.savePatientPersonalInfo(req.user.id, user_arr)
        .then(async function (data) {
          await patientModel.getPatientBasic(req.user.id, req.user.role)
          .then(async function (data) {
            res.status(200).json({
              status: "1",
              data: data[0]
            });
          }).catch(err => {
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })
        }).catch(err => {
          console.log('err', err)
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },
  save_patient_lifestyle: async (req, res, next) => {
    const {
      activity_level,
      alcohol,
      foodpref,
      marital_status,
      profession,
      smoking
     } = req.body

      let user_arr = {
        activity_level  : activity_level.value,
        alcohol         : alcohol.value,
        foodpref        : foodpref.value,
        marital_status  : marital_status.value,
        profession      : profession.value,
        smoking         : smoking.value,
        update_date     : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
      }

      await patientModel.savePatientLifestyle(req.user.id, user_arr)
        .then(async function (data) {
          await patientModel.getPatientBasic(req.user.id, req.user.role)
          .then(async function (data) {
            res.status(200).json({
              status: "1",
              data: data[0]
            });
          }).catch(err => {
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })
        }).catch(err => {
          console.log('err', err)
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },

  save_patient_medical: async (req, res, next) => {
    const {
        allergic,
        injury,
        surgery,
        manual_injury,
        manual_surgery,
        no_chronic,
        no_surgery
       } = req.body

        let user_arr = {
          allergic: allergic.length > 0 ? allergic.join(",") : null,
          injury: injury.length > 0 ? injury.join(",") : null,
          surgery: surgery.length > 0 ? surgery.join(",") : null,
          manual_injury: manual_injury,
          manual_surgery: manual_surgery,
          no_chronic: no_chronic,
          no_surgery: no_surgery,
          update_date: dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
        }

        await patientModel.savePatientMedical(req.user.id, user_arr)
          .then(async function (data) {
            await patientModel.getPatientBasic(req.user.id, req.user.role)
            .then(async function (data) {
              res.status(200).json({
                status: "1",
                data: data[0]
              });
            }).catch(err => {
              res.status(400).json({
                status: 3,
                message: 'Something went wrong'
              }).end();
            })
          }).catch(err => {
            console.log('err', err)
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })
    },

    uploadProfilePic: async(req, res, next) => {

      try {
          if(!req.files) {
              res.status(400).json({
                status: 3,
                message: 'No file uploaded'
              }).end();
          } else {
              let profilepic = req.files.profilepic;

              /*
                  name: profilepic.name,
                  mimetype: profilepic.mimetype,
                  size: profilepic.size
              */

              profilepic.mv('./public/uploads/profilepic/' + profilepic.name);

              const fileArr = {
                uid : req.user.id,
                filename : profilepic.name,
                file_id: uuidv4()
              }

              await patientModel.changeProfilePic( fileArr )
              .then(async function (data) {
                res.status(200).json({
                  status: "1",
                  data: data
                });
              }).catch(err => {
                console.log('error in query', err);
                res.status(400).json({
                  status: 3,
                  message: 'Something went wrong'
                }).end();
              })
          }
      } catch (err) {
        console.log(err)
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
      }

    },
    checkOtpBooking: async(req, res, next) => {
      const mobile_no = req.body.contact;

        const request = {
          mobile_no: mobile_no,
          add_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
          update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
        }
        await patientModel.getPatientByMobile(request)
        .then( async( result ) => {

            const sms = {
              website : req.get('host'),
              contact : mobile_no,
              full_name : result.full_name
            }

            await handler.sendOtpVerification( sms )
            .then( async(response) => {

                await userModel.updateOTP(result.id, response.otp, response.delivery_id)
                    .then(() => {
                          res.status(200).json({
                            status: 1,
                            data: response.delivery_id
                          }).end()
                    })
                    .catch(err => {
                        res.status(400).json({
                          status: 3,
                          message: 'Something went wrong'
                        }).end();
                    })
                
            })
            .catch((err) => {
                console.log( err )
                res.status(400).json({
                  status: 3,
                  message: 'Something went wrong'
                }).end()
            })

        })
        .catch((err) => {
            console.log( err )
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end()
        })

    },

    submitOtpBooking: async(req, res, next) => {
        const mobile_no = req.body.mobile_no
        const delivery_id = req.body.id
        const otp = req.body.otp

        const request = {
          mobile_no : mobile_no,
          delivery_id : delivery_id,
          otp : otp
        }

        await patientModel.getPatientByDelivery(request)
        .then(( result ) => {

            let token = JWT.sign({
              iss: 'Doctrro',
              sub: result[0].id,
              email: result[0].email,
              role: result[0].category
            }, config.jwt.secret, {expiresIn: '2460s'});

            res.status(200).json({
              status: 1,
              data: result,
              token
            }).end()
        })
        .catch((err) => {
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end()
        })
    },

    booking: async(req, res, next) => {

      const {
        booking_for,
        booking_date,
        center_id, 
        email,
        full_name,
        mode_of_payment,
        doc_id,
        slot_id,
        other_name,
        other_email,
        other_contact
      } = req.value.body

      const request = {
        booking_id: Math.floor(Math.random() * Math.floor(Math.random() * Date.now())),
        book_for : booking_for === 'BOOKING_FOR_OTHER' ? 2 : 1,
        book_date: booking_date,
        clinic_id : center_id,
        patient_id: req.user.id,
        email,
        full_name,
        mode_of_payment,
        doc_id,
        slot_id,
        other_name,
        other_email,
        other_contact,
        booked_by: 1,
        cancelled_by: 0,
        status: 1,
        complete: 0,
        add_date: dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
        update_date: dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
      }

        await patientModel.addNewBooking(request)
        .then(async( appoitment_id ) => {

            await patientModel.getSlotTimeFromId(slot_id)
            .then(async( slotData ) => {

              await patientModel.getDoctorName( doc_id )
              .then(async( docData ) => {

                await userModel.fetchUserDetails( req.user.id, 2 )
                .then( async( userData ) => {

                    await clinicModel.getClinicOnly( center_id )
                    .then(async( clinicData ) => {

                        const sms = {
                          app_id : appoitment_id,
                          patient_full_name: booking_for === 'BOOKING_FOR_OTHER' ? other_name : full_name,
                          booking_date,
                          booking_time : slotData.schedule,
                          doctor_full_name: docData.full_name,
                          clinic_address: clinicData.location,
                          clinic_contact_number: clinicData.contact_1,
                          website: req.get('host'),
                          patient_contact_number: userData.contact
                        }

                        await handler.sendToPatientFromPatient( sms )
                        .then(( result ) => {

                            res.status(200).json({
                              status: 1,
                              data: result
                            }).end()
                        })
                        .catch((err) => {
                            res.status(400).json({
                              status: 3,
                              message: 'Something went wrong'
                            }).end()
                        })
                    })
                    .catch((err) => {
                        res.status(400).json({
                          status: 3,
                          message: 'Something went wrong'
                        }).end()
                    })
                })
                .catch((err) => {
                      res.status(400).json({
                        status: 3,
                        message: 'Something went wrong'
                      }).end()
                  })
              })
              .catch((err) => {
                  res.status(400).json({
                    status: 3,
                    message: 'Something went wrong'
                  }).end()
              })

            })
            .catch((err) => {
                res.status(400).json({
                  status: 3,
                  message: 'Something went wrong'
                }).end()
            })
        })
        .catch((err) => {
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end()
        })
    },

}