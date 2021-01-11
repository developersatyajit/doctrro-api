const Joi = require('joi');
const dateFormat = require('dateformat');

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
    saveDoctorBasic:Joi.object().keys({
      email: Joi.string().required().email().max(100),
      full_name: Joi.string().min(1).max(100).required().regex(/^[a-z][a-z\s\.]*$/i, 'full name'),
      contact: Joi.string().required().max(20),
      password : Joi.string().required().allow("").optional(),
      gender: Joi.number().required(),
      reg_no: Joi.string().required(),
      reg_council: Joi.number().required(),
      reg_year: Joi.number().required()
    }),
    savePersonalInfo: Joi.object().keys({
      blood_group: Joi.object().keys({ 
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
      contact: Joi.number().required(),
      dob: Joi.date().raw(), 
      email: Joi.string().required().email().max(100),
      feet: Joi.number().required(),
      gender: Joi.object().keys({
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
      inch: Joi.number().required(),
      //location: Joi.string().required(),
      weight: Joi.number().required(),
      //map: Joi.string().required(),
      //marker: Joi.string().required()
    }),

    saveLifeStyle: Joi.object().keys({
      activity_level: Joi.object().keys({ 
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
      alcohol: Joi.object().keys({ 
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
      foodpref: Joi.object().keys({ 
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
      marital_status: Joi.object().keys({ 
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
      profession: Joi.object().keys({ 
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
      smoking: Joi.object().keys({ 
          value : Joi.number().required(), 
          label: Joi.string().required()
      }),
    }),

    saveMedical: Joi.object().keys({
      allergic: Joi.array().items(Joi.number().required()),
      injury: Joi.array().items(Joi.string().required().allow("").optional()),
      surgery: Joi.array().items(Joi.string().required().allow("").optional()),
      manual_injury: Joi.string().required().allow("").optional(),
      manual_surgery: Joi.string().required().allow("").optional(),
      no_chronic: Joi.number().required().allow("").optional(),
      no_surgery: Joi.number().required().allow("").optional()
    }),
  },
  
  schema_posts:{
  }
}