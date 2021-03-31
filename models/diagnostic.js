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
	}
}
