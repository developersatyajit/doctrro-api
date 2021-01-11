const Joi = require('joi');

module.exports = {
  validateBody: (schema) => {
    return (req, res, next) => {

        const result = Joi.validate(req.body, schema,{abortEarly: false});
        if (result.error) {
        let err_msg = {};
        for (let counter in result.error.details) {

          let k   = result.error.details[counter].context.key;
          let val = result.error.details[counter].message;
          err_msg[k] = val;
        }
        let return_err = {status:2,errors:err_msg};
        return res.status(400).json(return_err);
        }

        if (!req.value) { req.value = {}; }
        req.value['body'] = result.value;
        next();
    }
  },
  validateParam: (schema) => {
    return (req, res, next) => {
      const result = Joi.validate(req.params, schema);
      if (result.error) {
        let return_err = {status:2,errors:"Invalid argument"};
        return res.status(400).json(return_err);
      }
      if (!req.value) { req.value = {}; }
      req.value['params'] = result.value;
      next();
    }
  },
  schemas: {
    login: Joi.object().keys({
      username: Joi.string().required().email().max(200),
      password : Joi.string().required()
    }),
    change_status: Joi.object().keys({
      id: Joi.number().required(),
      status: Joi.boolean().required()
    }),

    // forgot_password: Joi.object().keys({
    //   email: Joi.string().required().email().max(100)
    // }),
    // reset_password: Joi.object().keys({
    //   new_password: Joi.string().required()
    // }),
    // submit_otp: Joi.object().keys({
    //   otp: Joi.number().required(),
    //   id: Joi.string().required()
    // }),
  }
}