const db=require('../configuration/dbConn');

module.exports = {
	feature: async ()=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
				select L.full_name, L.id, GROUP_CONCAT(DE.degree SEPARATOR', ') AS deg,
				GROUP_CONCAT(MS.sp_name SEPARATOR', ') as specname,
				UP.filename
				from login L
			 	LEFT JOIN doctor_education DE ON DE.doc_id = L.id
			 	LEFT JOIN doctor_speciality DS ON DS.doc_id = L.id
			 	LEFT JOIN master_speciality MS ON MS.id = DS.spl_id
			 	LEFT JOIN user_photo UP ON UP.uid = L.id
			 	where L.category = '1' and L.practioner='1'
			 	GROUP BY L.id
			 `)
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
	fetchAllGender: async ()=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select id as value, text as label from master_gender")
		    .then(function (data) { 
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting gender list');
				reject(error);
		    });
		}); 
	},
	getUserDetails: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`SELECT email, full_name, contact, reg_council, reg_no, reg_year, year_of_exp, gender, practioner 
				FROM login
				WHERE id=?`, [id])
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
	getDoctorBasic: async ( id, role_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
				SELECT 
				L.email, L.full_name, 
				L.contact, L.reg_council, 
				L.reg_no, L.reg_year, 
				L.year_of_exp, L.gender, 
				L.practioner, UP.filename, UP.file_id
				FROM login L
				LEFT JOIN user_photo UP ON UP.uid = L.id
				WHERE L.id=? AND L.category = ?`, [id, role_id])
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
	getDoctorSpeciality: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select GROUP_CONCAT(spl_id) as speciality from doctor_speciality where doc_id=?", [id])
		    .then(function (data) {
		    	resolve(data.length > 0 ? data[0].speciality : []);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting speciality');
				reject(error);
		    });
		}); 
	},
	getDoctorEducation: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from doctor_education where doc_id=? ORDER BY id DESC", [id])
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting education');
				reject(error);
		    });
		}); 
	},
	getDoctorChamber: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`SELECT * FROM doctor_chamber DC 
				LEFT JOIN diagnostic DG ON DG.id = DC.chamber_id
				LEFT JOIN diagnostic_time DT ON DT.ds_id = DC.chamber_id
				WHERE DC.doc_id=? ORDER BY DC.id DESC`, [id])
		    .then(async (data) => {

		    	if(data.length > 0){
		    		await module.exports.getUserDetails(id)
			    	.then( async( basic ) => {

			    		if(basic[0].practioner > 0){

			    			let clinic = [];

			    			for (let chambers of data) {
							    let ts = await module.exports.getDoctorTimeslot(id, chambers.chamber_id)
							    chambers = {...chambers, timeslot: ts}

							    clinic.push( chambers )
							}

							resolve(clinic) 

			    		}else{
			    			resolve(data);
			    		}
			    	})
			    	.catch(function (err) {
						console.log('basic error', err)
						var error = new Error('Error in getting chamber');
						reject(error);
				    });	
			    }else{
		    		resolve([]);
		    	}
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting chamber');
				reject(error);
		    });
		}); 
	},
	getDoctorTimeslot: async( doc_id, clinic_id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`SELECT * FROM 
    			doctor_timeslot 
    			WHERE doc_id=? AND clinic_id=?`, [doc_id, clinic_id])
	    	.then(( timeslot) => {
	    		resolve(timeslot)
	    	})
	    	.catch(function (err) {
				var error = new Error('Error in doctor timeslot');
				reject(error);
		    });
		})
	},
	countDoctorChamber: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`SELECT COUNT(*) AS total FROM doctor_chamber DC 
				LEFT JOIN diagnostic DG 
				ON DC.chamber_id = DG.id
				WHERE DC.doc_id=?`, [id])
		    .then(function (data) {
		    	resolve(data[0].total);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting education');
				reject(error);
		    });
		}); 
	},
	getDoctorDocument: async ( id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from doctor_document where doc_id=?", [id])
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting education');
				reject(error);
		    });
		}); 
	},
	insertSpeciality: async ( doc_id, spl_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync('INSERT INTO doctor_speciality SET doc_id=?, spl_id=?', [doc_id, spl_id])
			.then(( res ) => {
				resolve(true);
			})
			.catch((err) => {
				console.log(err);
				var error = new Error('Error in updating password');
				reject(error);
			})
		}); 
	},
	saveDoctorBasicInfo: async(id, data) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync('UPDATE login SET full_name=?, email=?, gender=?, contact=?, reg_no=?, reg_council=?, reg_year=?, year_of_exp=? WHERE id = ?', 
				[data.full_name, data.email, data.gender, data.contact, data.reg_no, data.reg_council, data.reg_year, data.year_of_exp, id])
		    .then(function (result) {

		    	if(data.speciality){

		    		console.log( data.speciality );

		    		db.queryAsync('DELETE FROM doctor_speciality WHERE doc_id=?', [id])
					.then(() => {
						let success = 0;
						data.speciality.map( async(dsp) => {
							await module.exports.insertSpeciality(id, dsp)
							.then(() => {
								resolve( true );
							})
							.catch(( error ) => {
								console.log(err);
								var error = new Error('Error in updating information');
								reject(error);
							})
						})
					})
					.catch((err) => {
						console.log(err);
						var error = new Error('Error in updating information');
						reject(error);
					})
		    	}

		    	if(data.password && data.salt){
					db.queryAsync('UPDATE login SET password=?, salt=? WHERE id = ?', [data.password, data.salt, id])
					.then(( res ) => {
						resolve(true);
					})
					.catch((err) => {
						console.log(err);
						var error = new Error('Error in updating password');
						reject(error);
					})
				}else{
					resolve(true);
				}

		    })
		    .catch(function (err) {
				var error = new Error('Error in saving user data');
				reject(error);
		    });
		});
	},
	getMedicalRegCouncilList : async() => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select id as value, cn_name as label from master_medical_reg_council")
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting education');
				reject(error);
		    });
		}); 
	},
	getRegCouncilName : async( id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select cn_name from master_medical_reg_council where id = ? ", [id])
		    .then(function (data) {
		    	resolve(data.length > 0 ? data[0].cn_name : []);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getRegCouncilName');
				reject(error);
		    });
		}); 
	},
	getSpecialityList: async() => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select id as value, sp_name as label from master_speciality")
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting speciality list');
				reject(error);
		    });
		}); 
	},
	checkClinic: async(id) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from diagnostic where id=?", [id])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? true : false);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getting education');
				reject(error);
		    });
		}); 
	},
	isClinicAdded: async(doc_id, chamber_id) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from doctor_chamber where doc_id=? and chamber_id=?", [doc_id, chamber_id])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? true : false);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in fetching clinic details');
				reject(error);
		    });
		}); 
	},
	isSlotAvailable: async(doc_id, clinic_id) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from doctor_timeslot where doc_id=? and clinic_id=?", [doc_id, clinic_id])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].id > 0 ? true : false);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in fetching slot');
				reject(error);
		    });
		}); 
	},
	addDoctorChamber: async(doc_id, chamber_id, fees) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("INSERT INTO doctor_chamber SET doc_id = ?, chamber_id=?, fees=?", [doc_id, chamber_id, fees])
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		})
	},
	updateDoctorFees: async(doc_id, chamber_id, fees) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("UPDATE doctor_chamber SET fees=? WHERE doc_id=? AND chamber_id=?", [fees, doc_id, chamber_id])
		    .then(function (data) {
		    	resolve(data.affectedRows);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting email id');
				reject(error);
		    });
		})
	},
	addChamberTimeslot: async(doc_id, post_data) => {
		return new Promise(function(resolve, reject) {

			db.queryAsync(`INSERT INTO doctor_timeslot
				SET clinic_id=?, 
					doc_id=?, 
					day_of_week=?,
					start=?, 
					end=?, 
					duration=?`, [post_data.id, doc_id, post_data.day_of_week, post_data.start, post_data.end, post_data.interval])
		    .then(function (data) {

		    	let timeslot_id = data.insertId
		    	
		    	// morning slot
		    	let mvalues = [];
				post_data.mslot.map( mitem => {
					mvalues.push(
						[timeslot_id, 'M', mitem.time, mitem.disable === true ? 1 : 0]
					)
				})

				if(mvalues.length > 0){
					db.queryAsync(`INSERT INTO available_slot(timeslot_id, slot, schedule, status) VALUES ?`, [mvalues])
				    .then(function (morn) {
				    	resolve(morn);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in getting email id');
						reject(error);
				    });
				}
		    	//====

		    	// afternoon slot
		    	let avalues = [];
				post_data.aslot.map( aitem => {
					avalues.push(
						[timeslot_id, 'A', aitem.time, aitem.disable === true ? 1 : 0]
					)
				})


				if(avalues.length > 0){
					db.queryAsync(`INSERT INTO available_slot(timeslot_id, slot, schedule, status) VALUES ?`, [avalues])
				    .then(function (noon) {
				    	resolve(noon);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in getting email id');
						reject(error);
				    });
				}
		    	// end

		    	//evening slot
		    	let evalues = [];
				post_data.eslot.map( eitem => {
					evalues.push(
						[timeslot_id, 'E', eitem.time, eitem.disable === true ? 1 : 0]
					)
				})

				if(evalues.length > 0){
					db.queryAsync(`INSERT INTO available_slot(timeslot_id, slot, schedule, status) VALUES ?`, [evalues])
				    .then(function (eve) {
				    	resolve(eve);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in getting email id');
						reject(error);
				    });
				}
		    	//end

		    	//night slot
		    	let nvalues = [];
				post_data.nslot.map( nitem => {
					nvalues.push(
						[timeslot_id, 'N', nitem.time, nitem.disable === true ? 1 : 0]
					)
				})

				if(nvalues.length > 0){
					db.queryAsync(`INSERT INTO available_slot(timeslot_id, slot, schedule, status) VALUES ?`, [nvalues])
				    .then(function (nt) {
				    	resolve(nt);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in getting email id');
						reject(error);
				    });
				}
		    	//end
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in getting email id');
				reject(error);
		    });


		})
	},
	updateChamberTimeslot: async(post_data) => {
		return new Promise(function(resolve, reject) {


		    	// morning slot
				post_data.mslot.map( mitem => {
					let mstatus = mitem.disable === true ? 1 : 0
					db.queryAsync(`UPDATE available_slot 
						SET status = ?
						WHERE id = ?`, [mstatus, mitem.id])
				    .then(function (morn) {
				    	resolve(morn);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in updating morning');
						reject(error);
				    });
				})

		    	post_data.aslot.map( aitem => {
					let astatus = aitem.disable === true ? 1 : 0
					db.queryAsync(`UPDATE available_slot 
						SET status = ?
						WHERE id = ?`, [ astatus, aitem.id])
				    .then(function (af) {
				    	resolve(af);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in updating afternoon');
						reject(error);
				    });
				})

		    	post_data.eslot.map( eitem => {
					let estatus = eitem.disable === true ? 1 : 0
					db.queryAsync(`UPDATE available_slot 
						SET status = ?
						WHERE id = ?`, [estatus, eitem.id])
				    .then(function (eve) {
				    	resolve(eve);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in updating evening');
						reject(error);
				    });
				})

				post_data.nslot.map( nitem => {
					let nstatus = nitem.disable === true ? 1 : 0
					db.queryAsync(`UPDATE available_slot 
						SET status = ?
						WHERE id = ?`, [nstatus, nitem.id])
				    .then(function (nt) {
				    	resolve(nt);
				    })
				    .catch(function (err) {
						console.log(err)
						var error = new Error('Error in updating night');
						reject(error);
				    });
				})

		})
	},
	updateFees: async( data ) => {

		return new Promise(function(resolve, reject) {
			db.queryAsync('UPDATE doctor_chamber SET fees=? WHERE doc_id = ? AND chamber_id=?',	
				[data.fees, data.doc_id, data.chamber_id])
		    .then(function (result) {
		    	resolve(true);
		    })
		    .catch(function (err) {
				var error = new Error('Error in updating fees');
				reject(error);
		    });
		});
	},
	deleteClinic: async(doc_id, ch_id) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`DELETE FROM doctor_chamber WHERE doc_id = ? AND chamber_id = ? `, [doc_id, ch_id])
		    .then(function () {
		    	db.queryAsync(`DELETE FROM doctor_timeslot WHERE doc_id = ? AND clinic_id = ? `, [doc_id, ch_id])
		    	.then(function( data ){
		    		resolve(data);
		    	})
		    	.catch(function (err) {
					console.log(err)
					var error = new Error('Error in deleting doctor timeslot');
					reject(error);
			    })
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in deleting clinic');
				reject(error);
		    });
		})
	},
	deleteEducation: async(doc_id, id) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`DELETE FROM doctor_education WHERE doc_id = ? AND id = ? `, [doc_id, id])
		    .then(function (data) {
		    	resolve(data);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in deleting education');
				reject(error);
		    });
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
          map,
          marker,
          location,
          landmark,
          pincode,
          state
        } = post_data;


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
					`${map.lat},${map.lng}`,
					`${marker.lat},${marker.lng}`,
					location
				])
		    .then(function (data) {
		    	resolve(data.insertId);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting clinic');
				reject(error);
		    });
		})

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
          state
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
		    	resolve(data.affectedRows);
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
	updatePractioner: async(id, practioner) => {

		return new Promise(function(resolve, reject) {
			db.queryAsync('UPDATE login SET practioner=? WHERE id = ?',	[practioner, id])
		    .then(function (result) {
		    	resolve(true);
		    })
		    .catch(function (err) {
				var error = new Error('Error in updating user data');
				reject(error);
		    });
		});
	},
	insertEducation: async(postData) => {

		const { doc_id, degree, university, pass_year, add_date, update_date } = postData;

		return new Promise(function(resolve, reject) {
			db.queryAsync(`INSERT INTO doctor_education SET 				
				doc_id = ?,
				degree = ?,
				university = ?,
				pass_year = ?,
				add_date = ?,
				update_date = ?
				`, [
					doc_id, 
					degree,
					university,
					pass_year,
					add_date,
					update_date
				])
		    .then(function (data) {
		    	resolve(data.insertId);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting education');
				reject(error);
		    });
		});
	},

	updateEducation: async(postData) => {

		const { id, doc_id, degree, university, pass_year, update_date } = postData;

		return new Promise(function(resolve, reject) {
			db.queryAsync(`UPDATE doctor_education SET 
				degree = ?,
				university = ?,
				pass_year = ?,
				update_date = ?
				WHERE id = ? AND doc_id = ?
				`, [
					degree,
					university,
					pass_year,
					update_date,
					id,
					doc_id
				])
		    .then(function (data) {
		    	resolve(data.affectedRows);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting education');
				reject(error);
		    });
		});
	},

	uploadDoctorDocument: async( file ) => {

		const { doc_id, type, file_id, folder_name, original_name, add_date, update_date } = file;

		return new Promise(function(resolve, reject) {
			db.queryAsync(`INSERT INTO doctor_document SET 				
				doc_id = ?,
				type = ?,
				file_id = ?,
				folder_name = ?,
				original_name = ?,
				add_date = ?,
				update_date = ?
				`, [
					doc_id, 
					type,
					file_id,
					folder_name,
					original_name,
					add_date,
					update_date
				])
		    .then(function (data) {
		    	resolve(data.insertId);
		    })
		    .catch(function (err) {
				console.log(err)
				var error = new Error('Error in inserting document');
				reject(error);
		    });
		});
	},
	getFileName: async(doc_id, file_id) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from doctor_document where file_id=? and doc_id=?", [file_id, doc_id])
		    .then(function (data) {
		    	resolve({
		    		original_name: data[0].original_name,
		    		folder_name: data[0].folder_name
		    	});
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in fetching slot');
				reject(error);
		    });
		}); 
	},
	getProfilePicName: async(uid, file_id) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select * from user_photo where file_id=? and uid=?", [file_id, uid])
		    .then(function (data) {
		    	resolve({filename: data[0].filename});
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in fetching slot');
				reject(error);
		    });
		}); 
	},
	getAllDoctors: async() => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
					select L.full_name, L.id, L.year_of_exp, GROUP_CONCAT(DE.degree SEPARATOR', ') AS deg,
					GROUP_CONCAT(MS.sp_name SEPARATOR', ') as specname
					from login L
				 	LEFT JOIN doctor_education DE ON DE.doc_id = L.id
				 	LEFT JOIN doctor_speciality DS ON DS.doc_id = L.id
				 	LEFT JOIN master_speciality MS ON MS.id = DS.spl_id
				 	where L.category = '1' and L.practioner='1'
				 	GROUP BY L.id
				`)
		    	.then(function (data) {

		    		db.queryAsync(`
						select D.center_name
						from login L
					 	LEFT JOIN doctor_chamber DC ON DC.doc_id = L.id
					 	LEFT JOIN diagnostic D ON D.id = DC.chamber_id
					 	where L.category = '1' and L.practioner='1'
					 	GROUP BY L.id
					`)
					.then(function (ch) {

						console.log( ch );

						data = {...data, ch: ch}

						resolve(data);

					})
					.catch(function (err) {
						console.log('Model error', err)
						var error = new Error('Error in fetching slot');
						reject(error);
				    });
			    	
			    })
			    .catch(function (err) {
					console.log('Model error', err)
					var error = new Error('Error in fetching slot');
					reject(error);
			    });
		}); 
	},
	countDoctor: async() => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select COUNT(*) as total from login where category=1 and practioner = 1")
		    .then(function (data) {
		    	resolve(data[0].total);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in countDoctor');
				reject(error);
		    });
		}); 
	},
	countPatient: async() => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select COUNT(*) as total from login where category=2")
		    .then(function (data) {
		    	resolve(data[0].total);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in countPatient');
				reject(error);
		    });
		}); 
	},
	countOthers: async() => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select COUNT(*) as total from login where category=1 and practioner = 0")
		    .then(function (data) {
		    	resolve(data[0].total);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in countOthers');
				reject(error);
		    });
		}); 
	},
	getSpecialityName: async( speciality ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select sp_name from master_speciality where id IN (?)", [speciality])
		    .then(function (speciality) {
		    	resolve(speciality);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getSpecialityName');
				reject(error);
		    });
		})
	},
	getDoctorDetails: async( id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync(`
				select L.full_name, L.id, L.year_of_exp,
				GROUP_CONCAT(MS.sp_name SEPARATOR', ') as specname,
				UP.filename, UP.file_id
				from login L
			 	LEFT JOIN doctor_speciality DS ON DS.doc_id = L.id
			 	LEFT JOIN master_speciality MS ON MS.id = DS.spl_id
			 	LEFT JOIN user_photo UP ON UP.uid = L.id
			 	where L.id = ?
			 	GROUP BY L.id`, 
			[id])
		    .then(async (data) => {

		    	if(data.length > 0){

		    		db.queryAsync(`
						select D.center_name, D.location, D.id, DC.fees,
						DT.mon_start_time, DT.tue_start_time, 
						DT.wed_start_time, DT.thur_start_time, 
						DT.fri_start_time, DT.sat_start_time, 
						DT.sun_start_time, DT.mon_end_time, 
						DT.tue_end_time, DT.wed_end_time, 
						DT.thur_end_time, DT.fri_end_time, 
						DT.sat_end_time, DT.sun_end_time
						from doctor_chamber DC
					 	LEFT JOIN diagnostic D ON D.id = DC.chamber_id
					 	LEFT JOIN diagnostic_time DT ON DT.ds_id = DC.chamber_id
					 	where DC.doc_id = ?
					`, [id])
					.then(async (allchamber) => {

							let chamberDetails = await Promise.all(
								allchamber.map(async chamber => {

								    return await module.exports.getAllWeek(chamber.id, id)
									.then( async( dayofweek ) => {

										let available_slot = await Promise.all(
											dayofweek.map( async( item ) => {

												return await module.exports.getAllSlot( item.id, id )
														.then((row) => {
															return {...item, slot: row};
														})
														.catch((err) => {
															console.log('Model error', err)
															var error = new Error('Error in getDoctorDetails');
															reject(error);
														})
											})
										)

										return {...chamber, available_slot };

									})
									.catch((err) => {
										console.log('Model error', err)
										var error = new Error('Error in getDoctorDetails');
										reject(error);
									})
							  	}
							));


							resolve({...data[0], ch: chamberDetails });
					})
					.catch(function (err) {
						console.log('Model error', err)
						var error = new Error('Error in getDoctorDetails');
						reject(error);
				    });

		    	}else{
		    		resolve( [] ); 
		    	}
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getDoctorDetails');
				reject(error);
		    });
		})
	},

	getAllWeek: async(clinic_id, doc_id) => {
		return new Promise( (resolve, reject) => {
			db.queryAsync(`SELECT DT.day_of_week, DT.id FROM doctor_timeslot DT WHERE DT.clinic_id = ? AND DT.doc_id=?`,[clinic_id, doc_id])
			.then(( week ) => {
				resolve(week);
			})
			.catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getAllWeek');
				reject(error);
		    });
		})
	},

	getAllSlot: async(timeslot_id, doc_id) => {
		return new Promise((resolve, reject) => {
			db.queryAsync(`
				SELECT S.id, S.slot, S.schedule, S.status, APT.id as booking_id, APT.status as booking_status
				FROM available_slot S 
				LEFT JOIN appointment APT ON APT.slot_id = S.id 
				WHERE S.timeslot_id=?`,[timeslot_id, doc_id])
			.then(( slots ) => {
				resolve(slots);
			})
			.catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getAllSlot');
				reject(error);
		    });
		})
	},

	checkDoctor: async( id ) => {
		return new Promise(function(resolve, reject) {
			db.queryAsync("select COUNT(*) as total from login where id = ? AND category = 1 and practioner = 1", [id])
		    .then(function (data) {
		    	resolve(data.length > 0 && data[0].total > 0 ? true : false);
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getSpecialityName');
				reject(error);
		    });
		})
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
	getClinicBooking: async ( doc_id, clinic_id )=>{
		return new Promise(function(resolve, reject) {
			db.queryAsync(`

				SELECT APT.id, APT.book_date, APT.mode_of_payment, 
				APT.slot_id, AVS.schedule, DT.duration,
			    CASE APT.book_for
			    	WHEN 1 THEN APT.full_name
			    	WHEN 2 THEN APT.other_name
			    END patient_name,    
			    CASE APT.book_for
			    	WHEN 1 THEN APT.email
			        WHEN 2 THEN APT.other_email
			    END patient_email			    
			    FROM appointment APT
			    LEFT JOIN available_slot AVS ON AVS.id = APT.slot_id
			    LEFT JOIN doctor_timeslot DT ON DT.id = AVS.timeslot_id
			    WHERE APT.doc_id=? AND APT.clinic_id=? AND APT.status = 1 AND APT.complete=0

				`, [doc_id, clinic_id])
		    .then(function (data) {
		    	resolve(data)
		    })
		    .catch(function (err) {
				console.log('Model error', err)
				var error = new Error('Error in getClinicBooking');
				reject(error);
		    });
		}); 
	},
	
}
