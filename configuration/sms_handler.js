
var request = require("request");

module.exports = {
	sendOtpVerification: async( sms ) => {
		return new Promise(async(resolve, reject) => {
			await module.exports.generate_otp()
			.then(( otp ) => {

				var options = {
	                method: 'POST',
	                  url: process.env.SMS_URL,
	                  headers: 
	                  {
	                    'cache-control': 'no-cache',
	                    'content-type': 'application/json',
	                    'authorization': process.env.SMS_KEY
	                  },
	                  body: 
	                  {
	                    message : "110735",
	                    variables_values : `${sms.full_name}|${sms.contact}|${sms.website}|${otp}`,
	                    flash : 0,
	                    numbers : sms.contact,
	                    sender_id   : process.env.SMS_SENDER_ID,
	                    route     : process.env.SMS_ROUTE
	                  },
	                  json: true
	              }

	              console.log( {options })

	              request(options, async function (error, response, body) {

						if (error) {
						  reject(error)
						}

	                  if( body && body.return){
	                      resolve({
	                      	delivery_id : body.request_id,
	                      	otp : otp
	                      }) 
	                  }else{
	                    reject("error in sending sms")
	                  }
	              });
			})
			.catch((err) => {
				reject(err)
			})
		})		
	},
	generate_otp: async () => {
		let digits = '0123456789';
	    let OTP = ''; 
	    for (let i = 0; i < 6; i++ ) {
	        OTP += digits[Math.floor(Math.random() * 10)]; 
	    } 
	    return OTP; 
	},

	sendToPatientFromPatient: async( sms ) => {
		return new Promise(async(resolve, reject) => {

			const app_id = sms.app_id
			const patient_full_name = sms.patient_full_name
			const booking_date = sms.booking_date
			const booking_time =  sms.booking_time
			const doctor_full_name =  sms.doctor_full_name
			const clinic_address =  sms.clinic_address
			const clinic_contact_number =  sms.clinic_contact_number
			const website = sms.website
			const patient_contact_number = sms.patient_contact_number


			var options = {
	            method: 'POST',
	              url: process.env.SMS_URL,
	              headers: 
	              {
	                'cache-control': 'no-cache',
	                'content-type': 'application/json',
	                'authorization': process.env.SMS_KEY
	              },
	              body: 
	              {
	                message : "110725",
	                variables_values : `${app_id}|${patient_full_name}|${booking_date}|${booking_time}|${doctor_full_name}|${clinic_address}|${clinic_contact_number}|${website}`,
	                flash : 0,
	                numbers : patient_contact_number,
	                sender_id : process.env.SMS_SENDER_ID,
	                route     : process.env.SMS_ROUTE
	              },
	              json: true
	          }

	          request(options, async function (error, response, body) {

					if (error) {
					  reject(error)
					}

	              if( body && body.return){
	                  resolve({
	                  	delivery_id : body.request_id
	                  }) 
	              }else{
	                reject("error in sending sms")
	              }
	          });
		})
	},
	sendToPatientFromDoctor: async( sms ) => {
		return new Promise(async(resolve, reject) => {

			const app_id = sms.app_id
			const patient_full_name = sms.patient_full_name
			const booking_date = sms.booking_date
			const booking_time =  sms.booking_time
			const doctor_full_name =  sms.doctor_full_name
			const clinic_address =  sms.clinic_address
			const clinic_contact_number =  sms.clinic_contact_number
			const website = sms.website
			const patient_contact_number = sms.patient_contact_number


			var options = {
	            method: 'POST',
	              url: process.env.SMS_URL,
	              headers: 
	              {
	                'cache-control': 'no-cache',
	                'content-type': 'application/json',
	                'authorization': process.env.SMS_KEY
	              },
	              body: 
	              {
	                message : "110725",
	                variables_values : `${app_id}|${patient_full_name}|${booking_date}|${booking_time}|${doctor_full_name}|${clinic_address}|${clinic_contact_number}|${website}`,
	                flash : 0,
	                numbers : patient_contact_number,
	                sender_id : process.env.SMS_SENDER_ID,
	                route     : process.env.SMS_ROUTE
	              },
	              json: true
	          }

	          request(options, async function (error, response, body) {

					if (error) {
					  reject(error)
					}

	              if( body && body.return){
	                  resolve({
	                  	delivery_id : body.request_id
	                  }) 
	              }else{
	                reject("error in sending sms")
	              }
	          });
		})
	},
	sendToPatientCancelByClinic: async( sms ) => {
		return new Promise(async(resolve, reject) => {

			const app_id = sms.app_id
			const patient_full_name = sms.patient_full_name
			const booking_date = sms.booking_date
			const booking_time =  sms.booking_time
			const doctor_full_name =  sms.doctor_full_name
			const clinic_name =  sms.clinic_name
			const clinic_contact_number =  sms.clinic_contact_number
			const website = sms.website
			const patient_contact_number = sms.patient_contact_number


			var options = {
	            method: 'POST',
	              url: process.env.SMS_URL,
	              headers: 
	              {
	                'cache-control': 'no-cache',
	                'content-type': 'application/json',
	                'authorization': process.env.SMS_KEY
	              },
	              body: 
	              {
	                message : "110730",
	                variables_values : `${doctor_full_name}|${app_id}|${patient_full_name}|${booking_date}|${booking_time}|${clinic_name}|${doctor_full_name}|${clinic_contact_number}|${website}`,
	                flash : 0,
	                numbers : patient_contact_number,
	                sender_id : process.env.SMS_SENDER_ID,
	                route     : process.env.SMS_ROUTE
	              },
	              json: true
	          }

	          request(options, async function (error, response, body) {

					if (error) {
					  reject(error)
					}

	              if( body && body.return){
	                  resolve({
	                  	delivery_id : body.request_id
	                  }) 
	              }else{
	                reject("error in sending sms")
	              }
	          });
		})
	},

}