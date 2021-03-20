
var request = require("request");

module.exports = {
	sendOtpVerification: async(req, res, next) => {
		return new Promise(async(resolve, reject) => {
			await module.exports.generate_otp()
			.then(( otp ) => {

				const website = req.get('host')
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
	                    variables_values : `${req.user.full_name}|${req.user.contact}|${website}|${otp}`,
	                    flash : 0,
	                    numbers : req.user.contact,
	                    sender_id   : process.env.SMS_SENDER_ID,
	                    route     : process.env.SMS_ROUTE
	                  },
	                  json: true
	              }

	              console.log({options})

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
	}
}