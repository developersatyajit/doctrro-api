const db =require('../configuration/dbConn');

module.exports = {
	fetchAllRole: async ()=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from master_category")
		    .then(function (data) { 
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting role list');
				reject(error);
		    });
		}); 
	},
	
	fetchAllBloodGroup: async ()=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select id as value, text as label from master_blood_group")
		    .then(function (data) { 
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting blood group');
				reject(error);
		    });
		}); 
	},
	emailExists: async (email)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from login where email = ?", [email])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? true : false);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		}); 
	},
	getUserByEmail: async (email)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from login where email = ?", [email])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? data : false);
		    })
		    .catch(function (err) {
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		}); 
	},
	isVerifiedUser: async (email)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from login where email = ? AND is_verified=1", [email])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? data : false);
		    })
		    .catch(function (err) {
				var error = new Error('Error in isVerifiedUser');
				reject(error);
		    });
		}); 
	},
	duplicateEmail: async (id, email)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from login where email = ? AND id != ?", [email, id])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? data : false);
		    })
		    .catch(function (err) {
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		}); 
	},
	signup: async (user_arr)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("INSERT INTO login SET ?", [user_arr])
		    .then(function (data) {
		    	resolve(data.insertId);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		}); 
	},
	validate:  async (email, password)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("SELECT id,category,email FROM login WHERE email = ? AND password = ?", [email,password])
		    .then(function (data) {
		    	resolve(data.length > 0 ? data : false);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		}); 
	},
	findUserRoleById: async(id, role) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("SELECT id, category as role FROM login WHERE id = ? AND category = ?", [id,role])
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				var error = new Error('Error in finding user role by id');
				reject(error);
		    });
		});
	},
	fetchUserDetails: async(id, role) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("SELECT full_name, email, contact FROM login WHERE id = ? AND category = ?", [id,role])
		    .then(function (data) {
				if(data.length > 0){
					resolve(data[0])
				}else{
					reject([]);
				}
		    })
		    .catch(function (err) {
				var error = new Error('Error in finding user role by id');
				reject(error);
		    });
		});
	},
	resetPassword: async( row ) => {
		console.log('row', row);
		return new Promise(function(resolve, reject) {
			db.queryAsync("UPDATE login SET password=?, salt=? WHERE id = ?", [row.password, row.salt, row.id])
		    .then(function (data) {
				resolve(data)
		    })
		    .catch(function (err) {
				var error = new Error('Error in reset password');
				reject(error);
		    });
		});
	},
	updateOTP: async( id, otp, delivery_id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("UPDATE login SET otp=?, delivery_id=?  WHERE id = ?", [otp, delivery_id, id])
		    .then(function (data) {
				resolve(data)
		    })
		    .catch(function (err) {
				var error = new Error('Error in update otp');
				reject(error);
		    });
		});
	},
	checkOTP: async( otp, delivery_id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("SELECT COUNT(*) AS total, id FROM login WHERE otp=? AND delivery_id=?", [otp, delivery_id])
		    .then(async (data) => {
		    	if(data.length > 0 && data[0].total > 0){
		    		await module.exports.verifiedUser(data[0].id)
		    		.then(() => {
		    			resolve('SUCCESS')
		    		})
		    		.catch((err) => {
		    			var error = new Error('Error in reset password');
						reject(error);
		    		})
		    	}else{
		    		resolve('FAILURE')
		    	}
		    })
		    .catch(function (err) {
				var error = new Error('Error in reset password');
				reject(error);
		    });
		});
	},
	verifiedUser: async( id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("UPDATE login SET is_verified=1  WHERE id = ?", [id])
		    .then(function (data) {
				resolve(data)
		    })
		    .catch(function (err) {
				var error = new Error('Error in verifiedUser');
				reject(error);
		    });
		});
	},
}
