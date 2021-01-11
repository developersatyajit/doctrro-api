
const patientModel = require('../models/patient');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const dateformat = require('dateformat');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

}