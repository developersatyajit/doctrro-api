const db=require('../configuration/dbConn');
const doctorModel = require('../models/doctor');

module.exports = {
	all: async ()=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from diagnostic D LEFT JOIN diagnostic_time DT on DT.ds_id = D.id")
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
	findClinic: async (keyword, doc_id)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`select * from diagnostic WHERE center_name LIKE "%${keyword}%"`)
		    .then(async (data) => {
		    	
		    	let listOfClinic = [];
				for (let i = 0; i < data.length; i++) {
				    let p = await doctorModel.isSlotAvailable(doc_id, data[i].id)
				    if(!p){
				    	listOfClinic.push(data[i]);
				    }
				}

				resolve(listOfClinic);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in finding clinic');
				reject(error);
		    });
		}); 
	},
	getClinicData: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`select * from diagnostic D 
					LEFT JOIN diagnostic_time DT ON DT.ds_id = D.id
					WHERE D.id=?`, [id])
		    .then(async (data) => {
				resolve(data);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in finding clinic');
				reject(error);
		    });
		}); 
	},
	getClinicOnly: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`select * from diagnostic
					WHERE id=?`, [id])
		    .then(async (data) => {
				resolve(data[0]);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in getClinicOnly');
				reject(error);
		    });
		}); 
	},
	getClinicTiming: async ( doc_id, clinic_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`select * from doctor_timeslot
					WHERE doc_id=? AND clinic_id=? ORDER BY day_of_week ASC`, [doc_id, clinic_id])
		    .then(async (data) => {
				resolve(data);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in getClinicTiming');
				reject(error);
		    });
		}); 
	},
	getAvailableSlot: async ( timeslot_id )=> {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`select * from available_slot
					WHERE timeslot_id=?`, [timeslot_id])
		    .then(async (data) => {
				resolve(data);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in getClinicTiming');
				reject(error);
		    });
		}); 
	},
	getSlotData: async( slot_id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`

				SELECT *			    
			    FROM available_slot
			    WHERE id=?

				`, [slot_id])
		    .then(function (data) {
		    	resolve(data[0])
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getSlotData');
				reject(error);
		    });
		});
	},
	getServicesList: async() => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select id as value, service_name as label from master_clinic_services")
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getServicesList');
				reject(error);
		    });
		}); 
	},
	insertClinicPicture: async(file) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`INSERT INTO diagnostic_photo SET 
				did = ?,
				filename = ?,
				file_id = ?
				`, [
					file.did,
					file.filename,
					file.file_id
				])
		    .then(function (data) {
		    	resolve(data.insertId);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting insertClinicPicture');
				reject(error);
		    });
		})
	},
	deleteClinicAndServiceOnFailUpload: async( id ) => {

		return new Promise(function(resolve, reject) {
				db.queryAsync('DELETE FROM diagnostic WHERE id=?', [id])
				.then(() => {
					db.queryAsync('DELETE FROM diagnostic_services WHERE clinic_id=?', [id])
					.then(() => {
						resolve( true )
					})
					.catch((err) => {
						console.log(err);
						var error = new Error('Error in deleteClinicWithServiceOnFailUpload');
						reject(error);
					})
				})
				.catch((err) => {
					console.log(err);
					var error = new Error('Error in deleteClinicWithServiceOnFailUpload');
					reject(error);
				})
		})
	},
	insertClinic: async( post_data) => {

		const {
          address_1,
          address_2,
          clinic_type,
          area,
          center_name,
          city,
          contact_1,
          contact_2,
          contact_3,
          country,
          map_lat,
          map_long,
          marker_lat,
          marker_long,
          location,
          landmark,
          pincode,
          state,
          services
        } = post_data;

        // console.log( map, marker )

        return new Promise(function(resolve, reject) {
			db.queryAsync(`INSERT INTO diagnostic SET 
				center_name = ?,
				clinic_type=?,
				area = ?,
				city = ?,	
				address_1 = ?,
				address_2 = ?,
				landmark = ?,
				pincode = ?,
				state = ?,	
				country = ?,	
				contact_1 = ?,	
				contact_2 = ?,	
				contact_3 = ?,	
				map = ?,	
				marker = ?,
				location=?
				`, [
					center_name,
					clinic_type,
					area, 
					city, 
					address_1, 
					address_2, 
					landmark, 
					pincode, 
					state, 
					country, 
					contact_1, 
					contact_2,
					contact_3, 
					`${map_lat},${map_long}`,
					`${marker_lat},${marker_long}`,
					location.join(",")
				])
		    .then(function (data) {

		    	let serviceArray = services.split(",")

		    	serviceArray.map( async( sid ) => {
					await module.exports.insertServices(data.insertId, sid)
					.then(() => {
						resolve( true );
					})
					.catch(( error ) => {
						console.log(err);
						var error = new Error('Error in inserting services');
						reject(error);
					})
				})
		    	resolve(data.insertId);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting clinic');
				reject(error);
		    });
		})

	},
	insertClinicTiming: async(ds_id, post_data) => {
		const {
          mon_end_time,
          mon_start_time,
          fri_start_time,
          fri_end_time,
          sat_end_time,
          sat_start_time,
          sun_end_time,
          sun_start_time,
          thur_end_time,
          thur_start_time,
          tue_end_time,
          tue_start_time,
          wed_end_time,
          wed_start_time
        } = post_data;


        return new Promise(function(resolve, reject) {
			db.queryAsync(`INSERT INTO diagnostic_time SET 
				ds_id = ?,
				mon_end_time = ?,
				mon_start_time = ?,
				sat_end_time = ?,
				sat_start_time = ?,
				sun_end_time = ?,
				sun_start_time = ?,
				thur_end_time = ?,
				thur_start_time = ?,
				tue_end_time = ?,
				tue_start_time = ?,
				wed_end_time = ?,
				wed_start_time = ?,
				fri_start_time = ?,
				fri_end_time = ?
				`, [
					ds_id, 
					mon_end_time,
					mon_start_time,
					sat_end_time,
					sat_start_time,
					sun_end_time,
					sun_start_time,
					thur_end_time,
					thur_start_time,
					tue_end_time,
					tue_start_time,
					wed_end_time,
					wed_start_time,
					fri_start_time,
					fri_end_time
				])
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting clinic timing');
				reject(error);
		    });
		})

	},
	insertServices: async ( clinic_id, sid )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync('INSERT INTO diagnostic_services SET clinic_id=?, sid=?', [clinic_id, sid])
			.then(( res ) => {
				resolve(true);
			})
			.catch((err) => {
				console.log(err);
				var error = new Error('Error in insertServices');
				reject(error);
			})
		}); 
	},
	updateClinic: async( post_data) => {
		const {
		  id,
          address_1,
          address_2,
          clinic_type,
          area,
          center_name,
          city,
          contact_1,
          contact_2,
          contact_3,
          country,
          map,
          marker,
          location,
          landmark,
          pincode,
          state,
          services
        } = post_data;


        return new Promise(function(resolve, reject) {
			db.queryAsync(`UPDATE diagnostic SET 
				center_name = ?,
				clinic_type=?,
				area = ?,
				city = ?,	
				address_1 = ?,
				address_2 = ?,
				landmark = ?,
				pincode = ?,
				state = ?,	
				country = ?,	
				contact_1 = ?,	
				contact_2 = ?,	
				contact_3 = ?,	
				map = ?,	
				marker = ?,
				location=?
				WHERE id = ?
				`, [
					center_name,
					clinic_type,
					area, 
					city, 
					address_1, 
					address_2, 
					landmark, 
					pincode, 
					state, 
					country, 
					contact_1, 
					contact_2,
					contact_3, 
					`${map.lat},${map.lng}`,
					`${marker.lat},${marker.lng}`,
					location,
					id
				])
		    .then(function (data) {

		    	if(services){

		    		db.queryAsync('DELETE FROM diagnostic_services WHERE clinic_id=?', [id])
					.then(() => {
						let success = 0;
						services.map( async(dsp) => {
							await module.exports.insertServices(id, dsp)
							.then(() => {
								resolve( true );
							})
							.catch(( error ) => {
								console.log(err);
								var error = new Error('Error in updating services');
								reject(error);
							})
						})
					})
					.catch((err) => {
						console.log(err);
						var error = new Error('Error in updating services');
						reject(error);
					})
		    	}

		    	resolve(data.affectedRows);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting clinic');
				reject(error);
		    });
		})

	},
	
	updateClinicTiming: async(post_data) => {
		const {
			id,
          mon_end_time,
          mon_start_time,
          fri_start_time,
          fri_end_time,
          sat_end_time,
          sat_start_time,
          sun_end_time,
          sun_start_time,
          thur_end_time,
          thur_start_time,
          tue_end_time,
          tue_start_time,
          wed_end_time,
          wed_start_time
        } = post_data;


        return new Promise(function(resolve, reject) {
			db.queryAsync(`UPDATE diagnostic_time SET 
				mon_end_time = ?,
				mon_start_time = ?,
				sat_end_time = ?,
				sat_start_time = ?,
				sun_end_time = ?,
				sun_start_time = ?,
				thur_end_time = ?,
				thur_start_time = ?,
				tue_end_time = ?,
				tue_start_time = ?,
				wed_end_time = ?,
				wed_start_time = ?,
				fri_start_time = ?,
				fri_end_time = ?
				WHERE ds_id = ?
				`, [
					mon_end_time,
					mon_start_time,
					sat_end_time,
					sat_start_time,
					sun_end_time,
					sun_start_time,
					thur_end_time,
					thur_start_time,
					tue_end_time,
					tue_start_time,
					wed_end_time,
					wed_start_time,
					fri_start_time,
					fri_end_time,
					id
				])
		    .then(function (data) {
		    	resolve(data.affectedRows);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting clinic timing');
				reject(error);
		    });
		})

	},

}
