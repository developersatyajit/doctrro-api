const db=require('../configuration/dbConn');

module.exports = {
	
	getPatientBasic: async ( id, role_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`SELECT login.email, 
				DATE_FORMAT(login.dob, '%Y-%m-%d') as dob,
				login.feet, 
				login.inch, 
				login.weight, 
				login.blood_group,
				login.full_name, 
				login.contact, 
				login.gender, 
				login.location,
				login.map,
				login.marker,
				login.alcohol, 
				login.activity_level, 
				login.smoking, 
				login.foodpref, 
				login.marital_status, 
				login.profession, 
				login.allergic,  
				login.injury, 
				login.no_chronic, 
				login.no_surgery, 
				login.surgery, 
				login.manual_injury, 
				login.manual_surgery, 
				user_photo.filename
				FROM login
				LEFT JOIN user_photo ON login.id = user_photo.uid
				WHERE login.id=? AND login.category = ?`, [id, role_id])
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting diagnostic list');
				reject(error);
		    });
		}); 
	},
	savePatientPersonalInfo: async ( id, data )=>{
		return new Promise(function(resolve, reject) {
			// db.queryAsync(`UPDATE login SET 
			// 		blood_group=?, 
			// 		email=?, 
			// 		gender=?, 
			// 		contact=?, 
			// 		dob=?, 
			// 		feet=?, 
			// 		inch=?, 
			// 		weight=?, 
			// 		location=?,
			// 		map=?,
			// 		marker=?,
			// 		update_date=? 
			// 		WHERE id = ?`, 
			// 	[data.blood_group, data.email, data.gender, data.contact, data.dob, data.feet, data.inch, data.weight,data.location, data.map, data.marker, data.update_date, id])
		 //    .then(function (result) {
		 //    	resolve(true);
		 //    })
		 //    .catch(function (err) {
		 //    	console.log(err);
			// 	var error = new Error('Error in saving patient personal data');
			// 	reject(error);
		 //    });


			 	db.queryAsync(`UPDATE login SET 
						blood_group=?, 
						email=?, 
						gender=?, 
						contact=?, 
						dob=?, 
						feet=?, 
						inch=?, 
						weight=?, 
						update_date=? 
						WHERE id = ?`, 
					[data.blood_group, data.email, data.gender, data.contact, data.dob, data.feet, data.inch, data.weight,data.update_date, id])
			    .then(function (result) {
			    	resolve(true);
			    })
			    .catch(function (err) {
			    	console.log(err);
					var error = new Error('Error in saving patient personal data');
					reject(error);
			    });
		}); 
	},
	savePatientLifestyle: async ( id, data )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`UPDATE login SET 
					activity_level=?,
					alcohol=?,
					foodpref=?,
					marital_status=?,
					profession=?,
					smoking=?,
					update_date=?
					WHERE id = ?`, 
				[
					data.activity_level, 
					data.alcohol, 
					data.foodpref, 
					data.marital_status, 
					data.profession, 
					data.smoking, 
					data.update_date, 
					id
				]
			)
		    .then(function (result) {
		    	resolve(true);
		    })
		    .catch(function (err) {
		    	console.log(err);
				var error = new Error('Error in saving patient life style');
				reject(error);
		    });
		}); 
	},
	savePatientMedical:  async ( id, data )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`UPDATE login SET 
					allergic=?,
			        injury=?,
			        surgery=?,
			        manual_injury=?,
			        manual_surgery=?,
			        no_chronic=?,
			        no_surgery=?,
					update_date=?
					WHERE id = ?`, 
				[
					data.allergic, 
					data.injury, 
					data.surgery, 
					data.manual_injury, 
					data.manual_surgery, 
					data.no_chronic,
					data.no_surgery, 
					data.update_date, 
					id
				]
			)
		    .then(function (result) {
		    	resolve(true);
		    })
		    .catch(function (err) {
		    	console.log(err);
				var error = new Error('Error in saving patient medical');
				reject(error);
		    });
		}); 
	},

	isPicUploaded: async ( uid )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`SELECT id FROM user_photo WHERE uid = ?`, [uid])
		    .then(function (data) {
		    	resolve(data.length > 0 ? true : false)
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in isPicUploaded');
				reject(error);
		    });
		}); 
	},

	changeProfilePic: async( file ) => {

		const { uid, filename, file_id } = file;

		return new Promise(async(resolve, reject) => {

			let isUploaded = await module.exports.isPicUploaded(uid)
			if(isUploaded){
				db.queryAsync(`UPDATE user_photo SET
					filename = ?,
					file_id = ? 
					WHERE uid = ?
					`, [
						filename,
						file_id,
						uid
					])
			    .then(function (data) {
			    	resolve(true);
			    })
			    .catch(function (err) {
					console.log(err)
					var error = new Error('Error in inserting document');
					reject(error);
			    });
			}else{
				db.queryAsync(`INSERT INTO user_photo SET 				
					uid = ?,
					filename = ?,
					file_id = ?
					`, [
						uid, 
						filename,
						file_id
					])
			    .then(function (data) {
			    	resolve(data.insertId);
			    })
			    .catch(function (err) {
					console.log(err)
					var error = new Error('Error in inserting document');
					reject(error);
			    });
			}
		});
	},
}
