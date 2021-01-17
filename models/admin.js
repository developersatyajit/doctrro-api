const db =require('../configuration/dbConn');

module.exports = {
	getUserByEmail: async (email)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from admin where email = ?", [email])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? data : false);
		    })
		    .catch(function (err) {
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		}); 
	},
	verifyAdminByEmail: async (id, email)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from admin where id=? and email = ?", [id, email])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? data : false);
		    })
		    .catch(function (err) {
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		}); 
	},
	getUserList: async ()=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
					SELECT id,full_name,email, is_verified, is_profile_complete,
					(
						CASE
							WHEN (category=1 && practioner=1) THEN 'Doctor' 
							WHEN (category=1 && practioner=0) THEN 'Other'
							ELSE 'Patient'
						END
					) as role,contact,
					(
						CASE
							WHEN (is_verified=1) THEN 'Verified'
							ELSE 'Not Verified'
						END
					) as isActive,
					(
						CASE
							WHEN (is_profile_complete=1) THEN 'Completed'
							ELSE 'Not Completed'
						END
					) as isComplete, add_date FROM login 
				`)
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {

				var error = new Error('Error in getUserList');
				reject(error);
		    });
		}); 
	},
	getSpecialityList: async ()=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
					SELECT * FROM master_speciality 
				`)
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {

				var error = new Error('Error in getUserList');
				reject(error);
		    });
		}); 
	},
	getUserDetails: async (id)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
					SELECT login.*, user_photo.file_id, user_photo.filename, master_gender.text as genderLabel,
					master_blood_group.text as bloodGroup
					FROM login
					LEFT JOIN user_photo ON user_photo.uid = login.id
					LEFT JOIN master_gender ON master_gender.id = login.gender
					LEFT JOIN master_blood_group ON master_blood_group.id = login.blood_group 
					WHERE login.id=?
				`, [id])
		    .then(function (data) {
		    	resolve(data.length > 0 ? data[0] : []);
		    })
		    .catch(function (err) {
				var error = new Error('Error in getUserList');
				reject(error);
		    });
		}); 
	},
	getUserById: async (id)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
					SELECT COUNT(*) As total
					FROM login
					WHERE id=?
				`, [id])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].total > 0 ? true : false);
		    })
		    .catch(function (err) {
				var error = new Error('Error in getUserList');
				reject(error);
		    });
		}); 
	},
	updateUserStatus: async (id, status)=>{
		return new Promise(function(resolve, reject) {
			let statusValue = status ? 1 : 0;
			db.queryAsync(`
					UPDATE login
					SET is_verified=?
					WHERE id=?
				`, [statusValue, id])
		    .then(function (data) {
		    	if(data.affectedRows > 0){
		    		resolve( true );
		    	}else{
		    		reject( false );
		    	}
		    })
		    .catch(function (err) {
				var error = new Error('Error in getUserList');
				reject(error);
		    });
		}); 
	},
	updateUserCompletion: async (id, status)=>{
		return new Promise(function(resolve, reject) {
			let statusValue = status ? 1 : 0;
			db.queryAsync(`
					UPDATE login
					SET is_profile_complete=?
					WHERE id=?
				`, [statusValue, id])
		    .then(function (data) {
		    	if(data.affectedRows > 0){
		    		resolve( true );
		    	}else{
		    		reject( false );
		    	}
		    })
		    .catch(function (err) {
				var error = new Error('Error in getUserList');
				reject(error);
		    });
		}); 
	},
	resetPassword: async( row ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("UPDATE admin SET password=?, salt=? WHERE id = ?", [row.password, row.salt, row.id])
		    .then(function (data) {
				resolve(data)
		    })
		    .catch(function (err) {
				var error = new Error('Error in reset password');
				reject(error);
		    });
		});
	},
}
