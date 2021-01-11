const userModel = require('../models/user');
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

	signup: async (req, res, next) => {
		const {	email } = req.value.body;

		let err = {};
		const isEmailExist = await userModel.emailExists(entities.encode(email));
		if (isEmailExist) {
			err.email = "Email already exists";
		}

		if (module.exports.isObjEmpty(err)) {
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
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
	login: async (req, res, next) => {
		const {	email, password } = req.value.body;

		let err = {};
		let userData = await userModel.getUserByEmail(entities.encode(email));
		
		if(!userData){
			err.email = "Invalid login";
		}else{

			let notVerified = await userModel.isVerifiedUser(email)
			if(!notVerified){
				err.password = "Please verify your account";
			}else{
				let checkPassword = await module.exports.isValidPassword(password, userData[0].password);
				if(!checkPassword){
					err.password = "Invalid password provided";
				}
			}
		}

		if (module.exports.isObjEmpty(err)) {
			req.user = {
				id:userData[0].id,
				email:userData[0].email,
				role: userData[0].category
			}
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},
	saveBasic: async (req, res, next) => {
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
	forgot_password: async (req, res, next) => {
		const {	email } = req.value.body;

		let err = {};
		let userData = await userModel.getUserByEmail(entities.encode(email));
		
		if(!userData){
			err.email = "Email address does not exist";
		}

		if (module.exports.isObjEmpty(err)) {
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},
}