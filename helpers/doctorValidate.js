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
    saveDoctorBasic:Joi.object().keys({
		email: Joi.string().required().email().max(100),
		full_name: Joi.string().min(1).max(100).required().regex(/^[a-z][a-z\s\.]*$/i, 'full name'),
		contact: Joi.string().required().max(20),
		password : Joi.string().required().allow("").optional(),
		gender: Joi.number().required(),
		reg_no: Joi.string().required(),
		reg_council: Joi.number().required(),
		reg_year: Joi.number().required(),
		speciality: Joi.array().items(Joi.number().required()),
		experience: Joi.number().required(),
    }),
    addTimeSlot: Joi.object().keys({

      mslot: Joi.array().items(
        Joi.object().keys({
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional(),

      aslot: Joi.array().items(
        Joi.object().keys({
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional(),

      eslot: Joi.array().items(
        Joi.object().keys({
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional(),

      nslot: Joi.array().items(
        Joi.object().keys({
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional(),

      day_of_week: Joi.number().required(),
      start : Joi.string().required(),
      end : Joi.string().required(),
      interval: Joi.number().required(),
      id: Joi.number().required()
    }),
    updateTimeSlot: Joi.object().keys({
      mslot: Joi.array().items(
        Joi.object().keys({
          id: Joi.number().required(),
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional(),

      aslot: Joi.array().items(
        Joi.object().keys({
          id: Joi.number().required(),
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional(),

      eslot: Joi.array().items(
        Joi.object().keys({
          id: Joi.number().required(),
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional(),

      nslot: Joi.array().items(
        Joi.object().keys({
          id: Joi.number().required(),
          time : Joi.string().required(),
          disable: Joi.boolean().required()
        })
      ).allow("").optional()
    }),
    addClinic: Joi.object().keys({
      id: Joi.number().required()
    }),
    viewdetails: Joi.object().keys({
      id: Joi.number().required()
    }),
    insertClinic: Joi.object().keys({
      address_1: Joi.string().required(),
      address_2: Joi.string().required(),
      area: Joi.string().required().allow("").optional(),
      clinic_type: Joi.number().required(),
      center_name: Joi.string().required(),
      services: Joi.array().items(Joi.number().required()),
      city: Joi.string().required().allow("").optional(),
      contact_1: Joi.number().required(),
      contact_2: Joi.number().required().allow("").optional(),
      contact_3: Joi.number().required().allow("").optional(),
      country: Joi.string().required().allow("").optional(),
      fri_end_time: Joi.string().required(),
      fri_start_time: Joi.string().required(),
      landmark: Joi.string().required(),
      map: Joi.object().keys({
      	lat : Joi.number().required(),
      	lng : Joi.number().required()
      }),
      marker: Joi.object().keys({
      	lat : Joi.number().required(),
      	lng : Joi.number().required()
      }),
      fees: Joi.number().required().allow("").optional(),
      location: Joi.string().required(),
      mon_end_time: Joi.string().required(),
      mon_start_time: Joi.string().required(),
      pincode: Joi.number().required(),
      sat_end_time: Joi.string().required(),
      sat_start_time: Joi.string().required(),
      state: Joi.string().required().allow("").optional(),
      sun_end_time: Joi.string().required(),
      sun_start_time: Joi.string().required(),
      thur_end_time: Joi.string().required(),
      thur_start_time: Joi.string().required(),
      tue_end_time: Joi.string().required(),
      tue_start_time: Joi.string().required(),
      wed_end_time: Joi.string().required(),
      wed_start_time: Joi.string().required()
    }),
    updateClinic: Joi.object().keys({
      id: Joi.number().required(),
      address_1: Joi.string().required(),
      address_2: Joi.string().required(),
      area: Joi.string().required().allow("").optional(),
      clinic_type: Joi.number().required(),
      center_name: Joi.string().required(),
      services: Joi.array().items(Joi.number().required()),
      city: Joi.string().required().allow("").optional(),
      contact_1: Joi.number().required(),
      contact_2: Joi.number().required().allow("").optional(),
      contact_3: Joi.number().required().allow("").optional(),
      country: Joi.string().required().allow("").optional(),
      fri_end_time: Joi.string().required(),
      fri_start_time: Joi.string().required(),
      landmark: Joi.string().required(),
      map: Joi.object().keys({
        lat : Joi.number().required(),
        lng : Joi.number().required()
      }),
      marker: Joi.object().keys({
        lat : Joi.number().required(),
        lng : Joi.number().required()
      }),
      fees: Joi.number().required().allow("").optional(),
      location: Joi.string().required(),
      mon_end_time: Joi.string().required(),
      mon_start_time: Joi.string().required(),
      pincode: Joi.number().required(),
      sat_end_time: Joi.string().required(),
      sat_start_time: Joi.string().required(),
      state: Joi.string().required().allow("").optional(),
      sun_end_time: Joi.string().required(),
      sun_start_time: Joi.string().required(),
      thur_end_time: Joi.string().required(),
      thur_start_time: Joi.string().required(),
      tue_end_time: Joi.string().required(),
      tue_start_time: Joi.string().required(),
      wed_end_time: Joi.string().required(),
      wed_start_time: Joi.string().required()
    }),
  },
  
  schema_posts:{
  }
}