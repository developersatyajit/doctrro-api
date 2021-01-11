
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
      await dgModel.all()
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
}