const userModel = require('../models/user');
const doctorModel = require('../models/doctor');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const bcrypt = require('bcryptjs');

module.exports = {

	isObjEmpty: (object) => {
		var isEmpty=true;
		if(JSON.stringify(object)==JSON.stringify({})){
		  isEmpty = true;
		}
		else{
		  isEmpty = false;
		}
		return isEmpty;
	},
	isValidPassword:  async(givenPassword, dbPassword) => {
		return new Promise(async(resolve, reject) => {
			await bcrypt.compare(givenPassword, dbPassword)
			.then((data) => {
				resolve(data)
			})
			.catch((err) => {
				reject(err)
			})
		})
	},
	saveDoctorBasic: async (req, res, next) => {

		// validate council

		const {	email } = req.value.body;

		let err = {};
		let userData = await userModel.duplicateEmail(req.user.id, entities.encode(email));
		
		if(userData){
			err.email = "Email already exists";
		}

		if (module.exports.isObjEmpty(err)) {
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},

	savePersonalInfo: async (req, res, next) => {

		const {	email } = req.value.body;

		let err = {};
		let userData = await userModel.duplicateEmail(req.user.id, entities.encode(email));
		
		if(userData){
			err.email = "Email already exists";
		}

		if (module.exports.isObjEmpty(err)) {
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},

}