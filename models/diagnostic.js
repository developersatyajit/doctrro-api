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
}
