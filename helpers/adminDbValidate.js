const adminModel = require('../models/admin');
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
	login: async (req, res, next) => {
		const {	username, password } = req.value.body;

		let err = {};
		let userData = await adminModel.getUserByEmail(entities.encode(username));
		
		if(!userData){
			err.username = "Invalid login";
		}else{
			let checkPassword = await module.exports.isValidPassword(password, userData[0].password);
			if(!checkPassword){
				err.password = "Invalid password provided";
			}
		}

		if (module.exports.isObjEmpty(err)) {
			req.user = {
				id:userData[0].id,
				email:userData[0].email
			}
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},
	change_status: async (req, res, next) => {
		const {	id, status } = req.value.body;

		let err = {};
		let userData = await adminModel.getUserById( id );
		
		if(!userData){
			err.username = "Invalid user submitted";
		}

		if (module.exports.isObjEmpty(err)) {
			next()
		} else {
			return res.status(400).json({ 'status' : 2, 'errors' : err});
		}
	},
}