
const adminModel = require('../models/admin');
const doctorModel = require('../models/doctor');
const dgModel = require('../models/diagnostic');
const config = require('../configuration/config');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const dateformat = require('dateformat');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const generator = require('generate-password');
var request = require("request");


module.exports = {
  authentication: async (req, res, next) => {
    if (req.user.id > 0) {
      next();
    } else {
      let return_err = {
        status: 5,
        message: "Unauthorized"
      };
      return res.status(401).json({return_err});
    }
  },

  login: async (req, res, next) => {
      if(req.user.id > 0){
        
        let token = JWT.sign({
          iss: 'DocAdmin',
          sub: req.user.id,
          email: req.user.email,
          admin: 1
        }, config.jwt.secret, {expiresIn: '2460s'});

        res.status(200).json({
          status: "1",
          token: token
        });
    }else{
      res.status(400).json({
        status: 2,
        message: 'Invalid login details'
      }).end();
    }
  },
  dashboard: async(req, res, next) => {

    let rows = {};

    await doctorModel.countDoctor()
      .then(async function (data) {

        rows = {...rows, doctor: data}

        await doctorModel.countPatient()
        .then(async function (pdata) {

            rows = {...rows, patient: pdata}

            await doctorModel.countOthers()
            .then(async function (odata) {

                rows = {...rows, other: odata}

                res.status(200).json({
                  status: "1",
                  data: rows
                });

            })
            .catch(err => {
              console.log('error in query', err);
              res.status(400).json({
                status: 3,
                message: 'Something went wrong'
              }).end();
            })
        })
        .catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
        
      }).catch(err => {
        console.log('error in query', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },
  user_list: async(req, res, next) => {

      let rows = {};

      await adminModel.getUserList()
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
    },

    user_details: async(req, res, next) => {

      let rows = {};
      const id = req.params.id;

      await adminModel.getUserDetails( id )
        .then(async function (data) {

          if( data.length === 0){
            res.status(200).json({
              status: "1",
              data: []
            });
          }

          if(data.practioner == 1 && data.category == 1){
            let spl = await doctorModel.getDoctorSpeciality( data.id );
            if(spl){
              let splName = await doctorModel.getSpecialityName(spl.split(","));
              data = {...data, speciality: splName}  
            }

            let ed = await doctorModel.getDoctorEducation( data.id )
            if(ed){
              data = {...data, education: ed}
            }

            let ch = await doctorModel.getDoctorChamber( data.id )
            if( ch ){
              data = {...data, chamber: ch}
            }

            let docs = await doctorModel.getDoctorDocument( data.id )
            if( docs ){

              let files = [];
              for(let file of docs){
                files.push({ 
                  id:  file.file_id, 
                  filename: file.original_name
                })
              }

              data = {...data, document: files}
            }
          } else if(data.practioner == 0 && data.category == 1) {
            let ch = await doctorModel.getDoctorChamber( data.id )
            if( ch ){
              data = {...data, chamber: ch}
            }
          }

          if( data.category == 2 ){
            let url = '';
            if(data.filename){
              url = req.protocol + '://' + req.get('host') + '/uploads/profilepic/' + data.filename;
            }else{
              url = req.protocol + '://' + req.get('host') + '/uploads/no-image.jpg';
            }
            data = {...data, url: url}
          }

          let regCouncilName = await doctorModel.getRegCouncilName( data.reg_council )
          data = {...data, council_name: regCouncilName}

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
    },

    downloadDocument: async(req, res, next) => {
      const { file, id } = req.params;

      await doctorModel.getFileName(file, id)
      .then(( response ) => {

        res.download(`./public/uploads/${response.folder_name}/${response.original_name}`, response.original_name);

      })
      .catch((err) => {
        console.log(err)
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
      })
    },
    change_status: async(req, res, next) => {

      const { id, status } = req.value.body;

      await adminModel.updateUserStatus( id, status )
        .then(async function (data) {

          res.status(200).json({
            status: "1"
          });
          
        }).catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
    },
    change_completion: async(req, res, next) => {

      const { id, status } = req.value.body;

      await adminModel.updateUserCompletion( id, status )
        .then(async function (data) {

          res.status(200).json({
            status: "1"
          });
          
        }).catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
    },
    
}