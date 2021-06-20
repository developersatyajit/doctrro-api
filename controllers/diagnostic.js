
const dgModel = require('../models/diagnostic');

// const config = require('../configuration/config');
// const Entities = require('html-entities').AllHtmlEntities;
// const entities = new Entities();
// const dateformat = require('dateformat');
// const JWT = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

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

  all: async (req, res, next) => {
      const { limit, offset } = req.params
      await dgModel.all( limit, offset )
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
  find: async (req, res, next) => {
      const keyword = req.params.keyword
      await dgModel.findClinic(keyword, req.user.id)
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
  getTimeslot: async (req, res, next) => {
      const id = req.params.id
      await dgModel.getClinicData(id)
        .then(async function (data) {

          await dgModel.getClinicTiming( req.user.id, id )
          .then( async( rows ) => {

            if(rows.length > 0){

                for (let i = 0; i < rows.length; i++) {

                  await dgModel.getAvailableSlot( rows[i].id )
                    .then(( col ) => {
                        rows[i].available_slot = col;
                    })
                    .catch((err) => {
                      console.log('err1', err);
                        res.status(400).json({
                          status: 3,
                          message: 'Something went wrong'
                        }).end();
                    })
                }

                data = {...data[0], schedule: rows }

                res.status(200).json({
                    status: "1",
                    data: data
                });

            }else{
                res.status(200).json({
                    status: "1",
                    data: data[0]
                });
            }            
          })
          .catch(( err ) => {
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
  servicesList: async (req, res, next) => {
    await dgModel.getServicesList()
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
  delete_picture: async (req, res, next) => {
    const {id} = req.params
    await dgModel.deletePicture( id )
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
  getDoctorList: async (req, res, next) => {
    const {id} = req.params
    await dgModel.getDoctorList( id )
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
}