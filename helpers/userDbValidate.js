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
		const {	email, category_id } = req.value.body;

		let err = {};
		const isEmailExist = await userModel.emailExists(entities.encode(email));
		if (isEmailExist) {

			const isVerifiedUser = await userModel.isVerifiedUser(entities.encode(email));

			//check if the user is verified
			if( isVerifiedUser ){
				err.email = "Email already exists";
			}else{
				err.email = 'Please login to verify your account.'
			}
		}

		if(![1,2].includes(category_id)){
			err.practitioner = "Invalid medical practitioner";
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
		let send_otp = false;
		
		if(!userData){
			err.email = "Invalid login";
		}else{

			let checkPassword = await module.exports.isValidPassword(password, userData[0].password);
			if(!checkPassword){
				err.password = "Invalid password provided";
			}else{
				let isVerifiedUser = await userModel.isVerifiedUser(entities.encode(email));

				if(!isVerifiedUser){
					send_otp = true;
				}
			}
		}

		if (module.exports.isObjEmpty(err)) {

			req.user = {
				id:userData[0].id,
				email:userData[0].email,
				role: userData[0].category,
				practioner: userData[0].practioner,
				send_otp : send_otp
			}

			if(send_otp){
				req.user = {
					...req.user, 
					contact: userData[0].contact,
					full_name: userData[0].full_name
				}
			}
			
			next()
			
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},
	loginWithMobile: async (req, res, next) => {
		const {	mobile_number } = req.value.body;

		let err = {};
		let userData = await userModel.getUserByMobile( mobile_number );
		
		if(!userData){
			err.mobile_number = "Mobile number does not exist";
		}

		if (module.exports.isObjEmpty(err)) {
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},
	loginWithOtp: async (req, res, next) => {
		const {	otp, id } = req.value.body;

		let err = {};
		let userData = await userModel.getUserByOTP( otp, id );
		
		if(!userData){
			err.otp = "Invalid otp submitted";
		}

		if (module.exports.isObjEmpty(err)) {
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