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
    signup: Joi.object().keys({
      email: Joi.string().required().email().max(100),
      full_name: Joi.string().min(1).max(100).required().regex(/^[a-z][a-z\s\.]*$/i, 'full name'),
      contact: Joi.string().required().max(20),
      category_id : Joi.number().required(),
      password : Joi.string().required()
    }),
    login: Joi.object().keys({
      email: Joi.string().required().email().max(200),
      password : Joi.string().required()
    }),
    forgot_password: Joi.object().keys({
      email: Joi.string().required().email().max(100)
    }),
    reset_password: Joi.object().keys({
      new_password: Joi.string().required()
    }),
    submit_otp: Joi.object().keys({
      otp: Joi.number().required(),
      id: Joi.string().required()
    }),
  },
  
  schema_posts:{
  }
}