
const userModel = require('../models/user');
const config = require('../configuration/config');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const dateformat = require('dateformat');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const generator = require('generate-password');
var request = require("request");


module.exports = {
  authentication: async (req, res, next) => {
    if (req.user.id > 0 && req.user.role != null) {
      next();
    } else {
      let return_err = {
        status: 5,
        message: "Unauthorized"
      };
      return res.status(401).json({return_err});
    }
  },

  fetch_all_role: async (req, res, next) => {
      await userModel.fetchAllRole()
        .then(async function (data) {

          res.status(200).json({
            status: "1",
            data: data
          });
        }).catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },

  
  all_blood_group: async (req, res, next) => {

    await userModel.fetchAllBloodGroup()
      .then(async function (data) {
        res.status(200).json({
          status: "1",
          data: data
        });
      }).catch(err => {
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
},
  signup: async(req, res, next) => {

    const {full_name, email, contact, category_id, password} = req.body
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const db_arr = {
      full_name : entities.encode(full_name),
      email : entities.encode(email),
      contact : contact,
      password : passwordHash, 
      salt: salt,
      category : category_id,
      add_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
      update_date	 : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
    }
    await userModel.signup(db_arr)
        .then(async function (uid) {

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
			   		sender_id 	: process.env.SMS_SENDER_ID,
			    	language 	: process.env.SMS_LANGUAGE,
			    	route 		: process.env.SMS_ROUTE,
			    	numbers 	: contact,
			    	message 	: '41995' 
			    },
			  	json: true 
			}

			request(options, async function (error, response, body) {
				  if (error) {
				  	res.status(400).json({
			            status: 3,
			            message: 'Sorry!!! we are unable to send sms right now'
		          	}).end();
				  }
			  	const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

			  	if(body.return){
			  		await userModel.updateOTP(uid, otp, body.request_id)
				  	.then(() => {
				  		res.status(200).json({
							status: "1",
							otp: otp,
							id: body.request_id
						});
				  	})
				  	.catch(err => {
			          console.log('error in query', err);
			          res.status(400).json({
			            status: 3,
			            message: 'Something went wrong'
			          }).end();
			        })
			  	}else{
			  		res.status(400).json({
			            status: 3,
			            message: 'Something went wrong'
			        }).end();
			  	}
			});
        }).catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },
  submit_otp: async (req, res, next) => {

  		const {otp, id} = req.body;

		await userModel.checkOTP(otp, id)
	      .then(async function (data) {

	      	if(data === 'SUCCESS'){
	      		res.status(200).json({
		          status: "1",
		          message: 'Your account has been created successfully. Kindly login to complete your profile.'
		        }).end();
	      	}else{
	      		res.status(400).json({
			        status: 2,
			        errors: {otp: 'Invalid otp submitted'} 
		      	}).end();
	      	}
	        
	      }).catch(err => {
	        res.status(400).json({
	          status: 3,
	          message: 'Something went wrong'
	        }).end();
	      })
	},
  login: async (req, res, next) => {
      if(req.user.id > 0){
        
        let token = JWT.sign({
          iss: 'Doctrro',
          sub: req.user.id,
          email: req.user.email,
          role: req.user.role
        }, config.jwt.secret, {expiresIn: '2460s'});
        res.status(200).json({
          status: "1",
          token: token
        });
    }else{
      res.status(400).json({
        status: 2,
        message: 'Invalid login details'
      }).end();
    }
  },
  user_details: async (req, res, next) => {
    await userModel.fetchUserDetails(req.user.id, req.user.role)
      .then(async function (data) {
        res.status(200).json({
          status: "1",
          data: data
        });
      }).catch(err => {
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
    },
  forgot_password: async (req, res, next) => {
      const {email}= req.body

        //let testAccount = await nodemailer.createTestAccount();

        // let transporter = nodemailer.createTransport({
        //   host: "doctrro.com",
        //   port: 587,
        //   secure: false,
        //   auth: {
        //     user: testAccount.user,
        //     pass: testAccount.pass,
        //   },
        // });

        let transporter = nodemailer.createTransport({ sendmail: true })

        let password = generator.generate({
            length: 10,
            numbers: true
        });

        //console.log(password)

        await transporter.sendMail({
          from: 'Doctrro <dnanda.ice2@gmail.com>',
          to: email,
          subject: "Doctrro - Reset Password",
          html: `Your password has been reset by the system. Please use <b> ${password} </b> as your new password to login.`
        })
        .then( async(result) => {

          console.log( result )

          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(password, salt);
          let udata =  await userModel.getUserByEmail( email );
          const user_arr = {password: passwordHash, salt: salt, id: udata[0].id} 

          await userModel.resetPassword(user_arr)
          .then(() => {
            res.status(200).json({
              status: "1",
              data: 'Success'
            });
          })
          .catch((err) => {
            res.status(400).json({
              status: 2,
              errors: {email: 'Unable to send mail at this moment'}
            }).end();
          })
        }) 
        .catch((err) => {
          console.log(err);
            res.status(400).json({
              status: 2,
              errors: {email: 'Unable to send mail at this time'}
            }).end();
        })
  },
  reset_password: async (req, res, next) => {

      const {new_password} = req.body

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(new_password, salt);
      const user_arr = { password: passwordHash, salt: salt, id: req.user.id} 

      console.log( user_arr );

      await userModel.resetPassword(user_arr)
      .then(() => {
        res.status(200).json({
          status: "1",
          data: 'Success'
        });
      })
      .catch((err) => {
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },
}