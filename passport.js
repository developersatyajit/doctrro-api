const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const {
  ExtractJwt
} = require('passport-jwt');
//const bcrypt = require('bcryptjs');
const Config = require('./configuration/config');
const Cryptr = require('cryptr');
//const cryptr = new Cryptr(Config.cryptR.secret);
const AdminModel = require('./models/admin');
const UserModal = require('./models/user');
/*
*
*
===================================================  
  Change at your own risk -
===================================================
*
*
*/

// isValidPassword = async function (newPassword, existingPassword) {
//   try {
//     return await bcrypt.compare(newPassword, existingPassword);
//   } catch (error) {
//     throw new Error(error);
//   }
// }

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = Config.jwt.secret;

passport.use(new JwtStrategy(opts, async function(payload, done) {

  try {

  	if(payload.admin){

  		if (!payload.sub) {
	      return done(null, {
	        id: 0
	      });
	    }

	    if (payload.admin != 1) {
	      return done(null, {
	        id: 0
	      });
	    }
	    
	    if (!payload.exp) {
	      return done(null, {
	        id: 0
	      });
	    } else {
	      var current_time = Math.round((new Date().getTime()) / 1000);
	      //console.log('current_time', current_time)
	      //console.log('payload.exp', payload.exp)

	      if (current_time > payload.exp) {
	        return done(null, {
	          id: 0
	        });
	      }
	    }

	    await AdminModel.verifyAdminByEmail(payload.sub, payload.email)
	    .then((data) => {
	      if(data.length > 0){
	      	//console.log('find user', data)
	        done(null, {id: data[0].id, role: data[0].role})
	      }else{
	      	//console.log('NO USER', data)
	        done(null, { id: 0 })
	      }
	    })
	    .catch((err) => {
	        done(error, false);
	    })

    }else{
      	if (!payload.sub) {
	      return done(null, {
	        id: 0
	      });
	    }
	    
	    if (!payload.role) {
	      return done(null, {
	        id: 0
	      });
	    }
	    if (!payload.exp) {
	      return done(null, {
	        id: 0
	      });
	    } else {
	      var current_time = Math.round((new Date().getTime()) / 1000);
	      if (current_time > payload.exp) {
	        return done(null, {
	          id: 0
	        });
	      }
	    }

	    await UserModal.findUserRoleById(payload.sub, payload.role)
	    .then((data) => {
	      if(data.length > 0){
	        done(null, {id: data[0].id, role: data[0].role, practioner: data[0].practioner })
	      }else{
	        done(null, { id: 0 })
	      }
	    })
	    .catch((err) => {
	        done(error, false);
	    })
    }

  } catch (error) {
    console.log('try catch error in passport', error)
    done(error, false);
    // done(null, user[0]);
  }
}));