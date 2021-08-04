const db=require('../configuration/dbConn');
const doctorModel = require('../models/doctor');

module.exports = {
	all: async (limit, offset)=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`SELECT D.center_name, D.id as clinic_id,
								D.clinic_type, 
								D.area, D.city, D.address_1, D.address_2, 
								D.landmark, D.pincode, D.state, D.country, D.contact_1, 
								D.contact_2, D.contact_3, D.map, D.marker, D.location, 
								GROUP_CONCAT(DS.sid SEPARATOR',') AS services,
								GROUP_CONCAT(DSP.spl_id SEPARATOR',') AS speciality,
								L.reg_no, L.email,
								DT.*
							FROM diagnostic D 
							LEFT JOIN diagnostic_time DT ON DT.ds_id = D.id
							LEFT JOIN diagnostic_services DS ON DS.clinic_id = D.id
							LEFT JOIN doctor_chamber DC ON DC.chamber_id = D.id
							LEFT JOIN login L ON L.id = DC.doc_id
							LEFT JOIN doctor_speciality DSP ON DSP.doc_id = L.id
							WHERE 1 GROUP BY DS.clinic_id, DSP.doc_id
							LIMIT ?,?
							`,  [parseInt(offset), parseInt(limit)])
		    .then(async (data) => {

		    	let allData = await Promise.all(
		    		data.map( async(item) => {
		    			let servicesNames = await module.exports.getClinicService( item.services )
			    		.then(( rows ) => {
			    			return rows
			    		})
			    		.catch((err) => {
							console.log('Model error', err)
							var error = new Error('Error in getting getClinicService');
							reject(error);
					    })

					    let allphotos = await module.exports.getClinicPhotos( item.clinic_id )
			    		.then(( photos ) => {
			    			return photos
			    		})
			    		.catch((err) => {
							console.log('Model error', err)
							var error = new Error('Error in getting getClinicPhotos');
							reject(error);
					    })

					    let allspeciality = await module.exports.getClinicSpeciality( item.speciality )
			    		.then(( spl ) => {
			    			return spl
			    		})
			    		.catch((err) => {
							console.log('Model error', err)
							var error = new Error('Error in getting getClinicSpeciality');
							reject(error);
					    })

					    return {...item, service_name: servicesNames, gallery: allphotos, speciality: allspeciality }
		    		})
		    	)
		    	

		    	resolve(allData);
		    })
		    .catch((err) => {
				console.log('Model error', err)
				var error = new Error('Error in getting diagnostic list');
				reject(error);
		    });
		}); 
	},
	getClinicPhotos: async ( id )=> {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`select file_id, filename from diagnostic_photo
					WHERE did = ?`, [id])
		    .then(async (data) => {
				resolve(data);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in getClinicService');
				reject(error);
		    });
		}); 
	},
	getClinicService: async ( serviceArr )=> {
		if(serviceArr == null || serviceArr.length == 0) return []
		return new Promise(function(resolve, reject) {
			let splitArr = serviceArr.split(",")
			db.queryAsync(`select service_name from master_clinic_services 
					WHERE id IN (?)`, [splitArr])
		    .then(async (data) => {
		    	let servArr = [];
		    	data.map(item => {
		    		return servArr.push(item.service_name)
		    	})
				resolve(servArr);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in getClinicService');
				reject(error);
		    });
		}); 
	},
	getClinicSpeciality: async ( splarr )=> {
		if(splarr == null || splarr.length == 0) return []
		return new Promise(function(resolve, reject) {
			let splitArr = splarr.split(",")
			db.queryAsync(`select sp_name from master_speciality 
					WHERE id IN (?)`, [splitArr])
		    .then(async (data) => {
		    	let servArr = [];
		    	data.map(item => {
		    		return servArr.push(item.sp_name)
		    	})
				resolve(servArr);
		    })
		    .catch( (err) => {
				console.log('Model error', err)
				var error = new Error('Error in getClinicSpeciality');
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
					`${map_lat},${map_long}`,
					`${marker_lat},${marker_long}`,
					location,
					id
				])
		    .then(function (data) {

		    	if(services){

		    		db.queryAsync('DELETE FROM diagnostic_services WHERE clinic_id=?', [id])
					.then(() => {
						let success = 0;
						let serviceArray = services.split(",")
						serviceArray.map( async(dsp) => {
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
				var error = new Error('Error in updating clinic');
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

	isPictureExist: async ( file_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync('SELECT COUNT(*) AS total FROM diagnostic_photo WHERE file_id=?', [file_id])
			.then(( res ) => {
				console.log('delete', res)
				resolve(res[0].total > 0 ? true : false);
			})
			.catch((err) => {
				console.log(err);
				var error = new Error('Error in isPictureExist');
				reject(error);
			})
		}); 
	},
	deletePicture: async ( file_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync('DELETE FROM diagnostic_photo WHERE file_id=?', [file_id])
			.then(( res ) => {
				resolve( true );
			})
			.catch((err) => {
				console.log(err);
				var error = new Error('Error in deletePicture');
				reject(error);
			})
		}); 
	},
	getDoctorList: async( clinic_id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
				SELECT DC.*, L.full_name, D.center_name, GROUP_CONCAT(MS.sp_name SEPARATOR',') AS speciality,
				UP.filename, UP.file_id
				FROM doctor_chamber DC 
				LEFT JOIN login L ON L.id = DC.doc_id 
				LEFT JOIN diagnostic D ON D.id = DC.chamber_id 
				LEFT JOIN doctor_speciality DS ON DS.doc_id = DC.doc_id
				LEFT JOIN master_speciality MS ON MS.id = DS.spl_id
				LEFT JOIN user_photo UP ON UP.uid = DC.doc_id
				WHERE DC.chamber_id=? AND DC.visiting_clinic=1 GROUP BY DS.doc_id
				`, [clinic_id])
		    .then(function (data) {
				resolve(data)
		    })
		    .catch(function (err) {
				var error = new Error('Error in getDoctorList');
				reject(error);
		    });
		});
	},
	getDoctorBooking: async ( doc_id, clinic_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`

				SELECT APT.id, APT.book_date, APT.mode_of_payment, 
				APT.slot_id, AVS.schedule, DT.duration, APT.booking_id, APT.visit_status, APT.status,
			    CASE APT.book_for
			    	WHEN 1 THEN APT.full_name
			    	WHEN 2 THEN APT.other_name
			    END patient_name,    
			    CASE APT.book_for
			    	WHEN 1 THEN APT.email
			        WHEN 2 THEN APT.other_email
			    END patient_email,
			    CASE APT.book_for
			    	WHEN 1 THEN L.contact
			        WHEN 2 THEN APT.other_contact
			    END patient_contact    
			    FROM appointment APT
			    LEFT JOIN available_slot AVS ON AVS.id = APT.slot_id
			    LEFT JOIN doctor_timeslot DT ON DT.id = AVS.timeslot_id
			    LEFT JOIN login L ON L.id = APT.patient_id
			    WHERE APT.doc_id=? AND APT.clinic_id=?
			    
				`, [doc_id, clinic_id])
		    .then(function (data) {
		    	resolve(data)
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getDoctorBooking');
				reject(error);
		    });
		}); 
	},
}
