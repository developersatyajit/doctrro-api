const clinicModel = require('../models/diagnostic');

module.exports = {
	deletePicture:  async(req, res, next) => {
		const {	id } = req.params;

		let isPictureExist = await clinicModel.isPictureExist(id);
		if(isPictureExist){
			next()
		}else{
			return res.status(400).json({ 'status' : 2, 'message' : "Picture does not exist"});
		}
	},
}