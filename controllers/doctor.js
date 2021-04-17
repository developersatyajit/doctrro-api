
const doctorModel = require('../models/doctor');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const dateformat = require('dateformat');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/user');
const patientModel = require('../models/patient');
const clinicModel = require('../models/diagnostic')
const handler = require('../configuration/sms_handler');
const generator = require('generate-password');


module.exports = {
  authentication: async (req, res, next) => {
    if (req.user.id > 0 && req.user.role != null) {
      next();
    } else {
      let return_err = {
        status: 5,
        message: "Unauthorized"
      };
      console.log('authentication', return_err);
      return res.status(401).json({return_err});
    }
  },
  feature: async (req, res, next) => {
      await doctorModel.feature()
        .then(async function (data) {
          let doctors = [];
          data.map((doctor) => {
            if( doctor.filename ){
              let url = req.protocol + '://' + req.get('host') + '/uploads/profilepic/' + doctor.filename;
              doctor.url = url;
            }
            doctors.push( doctor );
          })

          res.status(200).json({
            status: "1",
            data: doctors
          });
        }).catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },
  all_gender: async (req, res, next) => {
    await doctorModel.fetchAllGender()
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
  profile: async (req, res, next) => {
      await doctorModel.getDoctorBasic(req.user.id, req.user.role)
        .then(async (basic) =>  {

          var data = basic[0];

          if(data.file_id){
            let url = req.protocol + '://' + req.get('host') + '/uploads/profilepic/' + data.filename;
            data = {...data, image_url: url}
          }

          await doctorModel.getDoctorSpeciality(req.user.id)
          .then(async (spec) => {

            data = {...data, speciality:spec};

            	//data = {...data, spname};

		              await doctorModel.getDoctorEducation(req.user.id)
		              .then(async (ed) => {
		                data = {...data, ed};

		                  await doctorModel.getDoctorChamber(req.user.id)
		                  .then(async (ch) => {

		                    data = {...data, ch};

		                    await doctorModel.countDoctorChamber(req.user.id)
		                    .then(async (counter) => {
		                      data = {...data, total_clinic: counter};

		                      await doctorModel.getDoctorDocument(req.user.id)
		                      .then(async (doc) => {
		                        data = {...data, doc};

                            if(spec){
                              await doctorModel.getSpecialityName(spec.split(","))
                              .then(async(spname) => {
                                data = {...data, spname};
                              })
                              .catch((err) => {
                                  console.log( err)
                                  res.status(400).json({
                                    status: 3,
                                    message: 'Something went wrong'
                                  }).end();
                              })
                            }

		                        res.status(200).json({
		                          status: "1",
		                          data: data
		                        });
		                      })
		                      .catch(err => {
		                        res.status(400).json({
		                          status: 3,
		                          message: 'Something went wrong'
		                        }).end();
		                      })

		                    })
		                    .catch(err => {
		                      res.status(400).json({
		                        status: 3,
		                        message: 'Something went wrong'
		                      }).end();
		                    })
		                      
		                    
		                  })
		                  .catch(err => {
		                    res.status(400).json({
		                      status: 3,
		                      message: 'Something went wrong'
		                    }).end();
		                  })
		                

		              })
		              .catch(err => {
		                res.status(400).json({
		                  status: 3,
		                  message: 'Something went wrong'
		                }).end();
		              })
		       

          })
          .catch(err => {
            console.log(err)
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })

        }).catch(err => {
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },
  otherProfile: async (req, res, next) => {

      await doctorModel.getDoctorBasic(req.user.id, req.user.role)
        .then(async (basic) =>  {

          var data = basic[0];

          if(data.file_id){
            let url = req.protocol + '://' + req.get('host') + '/uploads/profilepic/' + data.filename;
            data = {...data, image_url: url}
          }

          await doctorModel.getDoctorSpeciality(req.user.id)
          .then(async (spec) => {

            data = {...data, speciality:spec};


              await doctorModel.getDoctorChamber(req.user.id)
              .then(async (ch) => {

                data = {...data, ch};

                await doctorModel.countDoctorChamber(req.user.id)
                .then(async (counter) => {
                  data = {...data, total_clinic: counter};

                  await doctorModel.getDoctorDocument(req.user.id)
                  .then(async (doc) => {
                    data = {...data, doc};

                    if(spec){
                      await doctorModel.getSpecialityName(spec.split(","))
                      .then((spname) => {
                        data = {...data, spname};
                      })
                      .catch((err) => {
                          console.log( err)
                          res.status(400).json({
                            status: 3,
                            message: 'Something went wrong'
                          }).end();
                      })
                    }

                    res.status(200).json({
                      status: "1",
                      data: data
                    });
                  })
                  .catch(err => {
                    res.status(400).json({
                      status: 3,
                      message: 'Something went wrong'
                    }).end();
                  })

                })
                .catch(err => {
                  res.status(400).json({
                    status: 3,
                    message: 'Something went wrong'
                  }).end();
                })
                  
                
              })
              .catch(err => {
                res.status(400).json({
                  status: 3,
                  message: 'Something went wrong'
                }).end();
              })
            

          })
          .catch(err => {
            console.log(err)
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })

        }).catch(err => {
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },
  save_doctor_basic_info: async (req, res, next) => {
      const { full_name, email, contact, password, gender, reg_no, reg_council, reg_year, speciality, experience } = req.body
      let user_arr = {
        full_name : entities.encode(full_name),
        email : entities.encode(email),
        contact : contact,
        gender : gender,
        reg_no : reg_no,
        reg_council: reg_council,
        reg_year : reg_year,
        speciality: speciality,
        year_of_exp : experience,
        update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
      }

      if(password){
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        user_arr = {...user_arr, password: passwordHash, salt: salt }  
      }

      await doctorModel.saveDoctorBasicInfo(req.user.id, user_arr)
        .then(async function (data) {
          await doctorModel.getDoctorBasic(req.user.id, req.user.role)
          .then(async function (data) {
            res.status(200).json({
              status: "1",
              data: data[0]
            });
          }).catch(err => {
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })
        }).catch(err => {
          console.log('err', err)
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
  },
  medicalCouncilList: async (req, res, next) => {
    await doctorModel.getMedicalRegCouncilList()
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
  specialityList: async (req, res, next) => {
    await doctorModel.getSpecialityList()
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

  addTimeSlot: async (req, res, next) => {

      await doctorModel.addChamberTimeslot( req.user.id, req.body )
      .then(async() => {

	  		await doctorModel.getDoctorChamber( req.user.id )
	        .then( async( chamberlist ) => {

	          await doctorModel.countDoctorChamber( req.user.id )
	          .then(( counter ) => {

	              res.status(200).json({
	                status: "1",
	                data: chamberlist,
	                total_clinic: counter
	              });
	          })
	          .catch(err => {
	            console.log('error in query', err);
	            res.status(400).json({
	              status: 3,
	              message: 'Something went wrong'
	            }).end();
	          })
	          
	        })
	        .catch(err => {
	          console.log('error in query', err);
	          res.status(400).json({
	            status: 3,
	            message: 'Something went wrong'
	          }).end();
	        })
      })
      .catch(err => {
        console.log('error in query', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },

  updateTimeSlot: async (req, res, next) => {

      await doctorModel.updateChamberTimeslot( req.body )
      .then(async() => {

        await doctorModel.getDoctorChamber( req.user.id )
          .then( async( chamberlist ) => {

            await doctorModel.countDoctorChamber( req.user.id )
            .then(( counter ) => {

                res.status(200).json({
                  status: "1",
                  data: chamberlist,
                  total_clinic: counter
                });
            })
            .catch(err => {
              console.log('error in query', err);
              res.status(400).json({
                status: 3,
                message: 'Something went wrong'
              }).end();
            })
            
          })
          .catch(err => {
            console.log('error in query', err);
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })
      })
      .catch(err => {
        console.log('error in query', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },

  findAddTimeSlot: async (req, res, next) => {

      await doctorModel.isClinicAdded( req.user.id, req.body.id )
      .then( async(response) => {

          if(!response){
            await doctorModel.addChamberTimeslot( req.user.id, req.body )
            .then(async() => {

              const doctor_fees = {
                fees: req.body.fees,
                chamber_id: req.body.id,
                doc_id: req.user.id
              }

              await doctorModel.addDoctorChamber(req.user.id, req.body.id)

              await doctorModel.updateFees(doctor_fees)

                await doctorModel.getDoctorChamber( req.user.id )
                      .then( async( chamberlist ) => {

                        await doctorModel.countDoctorChamber( req.user.id )
                        .then(( counter ) => {

                            res.status(200).json({
                              status: "1",
                              data: chamberlist,
                              total_clinic: counter
                            });
                        })
                        .catch(err => {
                          console.log('error in query', err);
                          res.status(400).json({
                            status: 3,
                            message: 'Something went wrong'
                          }).end();
                        })
                        
                      })
                      .catch(err => {
                        console.log('error in query', err);
                        res.status(400).json({
                          status: 3,
                          message: 'Something went wrong'
                        }).end();
                      })
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
                message: 'You have already added this clinic'
              }).end();
          }
          
      })
      .catch(err => {
        console.log('error in query', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },
  insert_clinic: async(req, res, next) => {

    const { fees } = req.body

    await doctorModel.insertClinic( req.body )
      .then(async( ID ) => {

        await doctorModel.insertClinicTiming( ID, req.body )
        .then(async () => {

          await userModel.isMedicalPractitioner(req.user.id)
          .then( async ( isPractitioner ) => {
              let doctor_fees = 0;
              if(isPractitioner){
                doctor_fees = fees
              }

                await doctorModel.addDoctorChamber( req.user.id, ID, doctor_fees )
                .then(() => {
                    res.status(200).json({
                        status: "1",
                        id: ID
                    });
                })
                .catch(err => {
                  console.log('error in query', err);
                  res.status(400).json({
                    status: 3,
                    message: 'Something went wrong'
                  }).end();
                })
          })
          .catch(err => {
            console.log('error in query', err);
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })

        })
        .catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
      }).catch(err => {
        console.log('error in query', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },
  update_clinic: async(req, res, next) => {

    const { fees } = req.body

    await doctorModel.updateClinic( req.body )
      .then(async() => {

        await doctorModel.updateClinicTiming( req.body )
        .then(async () => {

          await userModel.isMedicalPractitioner(req.user.id)
          .then( async ( isPractitioner ) => {
              let doctor_fees = 0;
              if(isPractitioner){
                doctor_fees = fees
              }

                await doctorModel.updateDoctorFees( req.user.id, req.body.id, doctor_fees )
                .then(() => {
                    res.status(200).json({
                        status: "1"
                    });
                })
                .catch(err => {
                  console.log('error in query', err);
                  res.status(400).json({
                    status: 3,
                    message: 'Something went wrong'
                  }).end();
                })
          })
          .catch(err => {
            console.log('error in query', err);
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })

        })
        .catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
      }).catch(err => {
        console.log('error in query', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },
  delete_clinic: async (req, res, next) => {
    const { id } = req.params;
    try{
      await doctorModel.deleteClinic( req.user.id, id )
          .then(async() => {

            await doctorModel.getDoctorChamber( req.user.id )
                  .then( async( chambers ) => {

                    await doctorModel.countDoctorChamber( req.user.id )
                    .then(( counter ) => {

                        res.status(200).json({
                          status: "1",
                          data: chambers,
                          total_clinic: counter
                        });
                    })
                    .catch(err => {
                      console.log('error in query', err);
                      res.status(400).json({
                        status: 3,
                        message: 'Something went wrong'
                      }).end();
                    })
                    
                  })
                  .catch(err => {
                    console.log('error in query', err);
                    res.status(400).json({
                      status: 3,
                      message: 'Something went wrong'
                    }).end();
                  })
          }).catch(err => {
            console.log('error in query', err);
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })
    }catch(err){
      console.log('error in code', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
    }    
  },
  delete_education: async (req, res, next) => {
    const { id } = req.params;
    try{
      await doctorModel.deleteEducation( req.user.id, id )
          .then(async() => {

            await doctorModel.getDoctorEducation(req.user.id)
            .then(async (ed) => {
              res.status(200).json({
                status: "1",
                data: ed
              });
            })
            .catch(err => {
                res.status(400).json({
                  status: 3,
                  message: 'Something went wrong'
                }).end();
            })

          }).catch(err => {
            console.log('error in query', err);
            res.status(400).json({
              status: 3,
              message: 'Something went wrong'
            }).end();
          })
    }catch(err){
      console.log('error in code', err);
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
    }     
  },
  add_education: async(req, res, next) => {
    const { pass_year, university, degree } = req.body;
    const ed = {
      doc_id: req.user.id,
      pass_year: pass_year,
      university: university,
      degree: degree,
      add_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
      update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
    }
    await doctorModel.insertEducation( ed )
      .then(async( ID ) => {
        res.status(200).json({
            status: "1",
            id: ID
        });
      }).catch(err => {
        console.log(err)
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },

  update_education: async(req, res, next) => {
    const { pass_year, university, degree, id } = req.body;
    const ed = {
      id: id,
      doc_id: req.user.id,
      pass_year: pass_year,
      university: university,
      degree: degree,
      update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
    }
    await doctorModel.updateEducation( ed )
      .then(async( ID ) => {
        res.status(200).json({
            status: "1"
        });
      }).catch(err => {
        console.log(err)
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
      })
  },

  photoid: async(req, res, next) => {

    try {
        if(!req.files) {
            res.status(400).json({
              status: 3,
              message: 'No file uploaded'
            }).end();
        } else {
            let photo_id = req.files.photo_id;
            let { type } = req.body
            /*
                name: photo_id.name,
                mimetype: photo_id.mimetype,
                size: photo_id.size
            */

            photo_id.mv('./public/uploads/photoid/' + photo_id.name);

            const fileArr = {
              doc_id : req.user.id,
              type : type,
              original_name : photo_id.name,
              file_id: uuidv4(),
              folder_name: 'photoid',
              add_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
              update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
            }

            await doctorModel.uploadDoctorDocument( fileArr )
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
        }
    } catch (err) {
      console.log(err)
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
    }

  },
  registration: async(req, res, next) => {

    try {
        if(!req.files) {
            res.status(400).json({
              status: 3,
              message: 'No file uploaded'
            }).end();
        } else {
            let reg = req.files.reg;
            let { type } = req.body

            /*
                name: reg.name,
                mimetype: reg.mimetype,
                size: reg.size
            */

            reg.mv('./public/uploads/registration/' + reg.name);

            const fileArr = {
              doc_id : req.user.id,
              type : type,
              original_name : reg.name,
              file_id: uuidv4(),
              folder_name: 'registration',
              add_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
              update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
            }

            await doctorModel.uploadDoctorDocument( fileArr )
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
        }
    } catch (err) {
      console.log(err)
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
    }

  },
  ownership: async(req, res, next) => {

    try {
        if(!req.files) {
            res.status(400).json({
              status: 3,
              message: 'No file uploaded'
            }).end();
        } else {
            let owner = req.files.owner;
            let { type } = req.body

            /*
                name: owner.name,
                mimetype: owner.mimetype,
                size: owner.size
            */

            owner.mv('./public/uploads/ownership/' + owner.name);

            const fileArr = {
              doc_id : req.user.id,
              type : type,
              original_name : owner.name,
              file_id: uuidv4(),
              folder_name: 'ownership',
              add_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
              update_date  : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
            }

            await doctorModel.uploadDoctorDocument( fileArr )
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
        }
    } catch (err) {
      console.log(err)
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
    }

  },
  download: async(req, res, next) => {
    const { file } = req.params;
    await doctorModel.getFileName(req.user.id, file)
    .then(( response ) => {

      res.download(`./public/uploads/${response.folder_name}/${response.original_name}`, response.original_name);

     // console.log(${})
      // res.download('./public/uploads/photoid/' + response.original_name, response.original_name, (err) => {
      //   if(err){
      //     res.status(400).json({
      //       status: 3,
      //       message: 'Something went wrong'
      //     }).end();
      //   }
      // }); // Set disposition and send it.
    })
    .catch((err) => {
      console.log(err)
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
    })
  },
  downloadProfPic: async(req, res, next) => {
    const { file } = req.params;
    await doctorModel.getProfilePicName(req.user.id, file)
    .then(( response ) => {

      res.download(`./public/uploads/profilepic/${response.filename}`, response.filename);

     // console.log(${})
      // res.download('./public/uploads/photoid/' + response.original_name, response.original_name, (err) => {
      //   if(err){
      //     res.status(400).json({
      //       status: 3,
      //       message: 'Something went wrong'
      //     }).end();
      //   }
      // }); // Set disposition and send it.
    })
    .catch((err) => {
      console.log(err)
        res.status(400).json({
          status: 3,
          message: 'Something went wrong'
        }).end();
    })
  },
  allDoctor: async(req, res, next) => {
    await doctorModel.getAllDoctors()
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
  doctor_details: async(req, res, next) => {
    const { id } = req.params;

    await doctorModel.getDoctorDetails( id )
      .then(async function (data) {

        if(data.filename){
          let url = req.protocol + '://' + req.get('host') + '/uploads/profilepic/' + data.filename;
          data = {...data, url: url}
        }

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
  uploadProfilePic: async(req, res, next) => {

      try {
          if(!req.files) {
              res.status(400).json({
                status: 3,
                message: 'No file uploaded'
              }).end();
          } else {
              let profilepic = req.files.profile_pic;

              /*
                  name: profilepic.name,
                  mimetype: profilepic.mimetype,
                  size: profilepic.size
              */

              profilepic.mv('./public/uploads/profilepic/' + profilepic.name);

              const fileArr = {
                uid : req.user.id,
                filename : profilepic.name,
                file_id: uuidv4()
              }

              await doctorModel.changeProfilePic( fileArr )
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
          }
      } catch (err) {
        console.log(err)
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
      }

    },
    getClinicBooking: async(req, res, next) => {
      const doc_id  = req.user.id;
      const { clinic_id } = req.params;
      await doctorModel.getClinicBooking( doc_id, clinic_id )
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
    fetchAvailableSlots: async(req, res, next) => {
      const doc_id  = req.user.id;
      const { selectedDay, clinic_id, selectedDate } = req.body

      await doctorModel.fetchAvailableSlots( doc_id, clinic_id, selectedDay, selectedDate )
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
    addPatient:  async(req, res, next) => {
      
      const doc_id  = req.user.id;

      const {
      	patient_name,
      	patient_email,
      	patient_mobile,
      	patient_slot,
      	clinic_id,
      	book_date
      } = req.body

      	let password = generator.generate({
            length: 10,
            numbers: true
        });
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

      const patientObj = {
      	full_name 	: patient_name,
		email 		: patient_email,
		contact		: patient_mobile,
		password 	: passwordHash,
		salt 		: salt,
		category 	: 2,
		practioner 	: 0,
		add_date 	: dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
		update_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
      }

      await doctorModel.patientBookingByDoctor( patientObj )
        .then(async ( patient_id ) => {

        	const bookingObj = {
        		booking_id: Math.floor(Math.random() * Math.floor(Math.random() * Date.now())),
    				doc_id: doc_id,
    				clinic_id : clinic_id,
    				patient_id : patient_id,
    				book_date : book_date,
    				book_for : 1,
    				slot_id: patient_slot,
    				mode_of_payment : 'offline',
    				full_name: patient_name,
    				email: patient_email,
    				other_name: '',
    				other_contact: '',
    				other_email : '',
    				booked_by: 3,
    				cancelled_by: 0,
    				status: 1,
    				complete : 0,
    				add_date: dateformat(new Date(), 'yyyy-mm-dd h:MM:ss'),
    				update_date : dateformat(new Date(), 'yyyy-mm-dd h:MM:ss')
        	}

        	await patientModel.addNewBooking( bookingObj )
        	.then(async( appoitment_id ) => {

        		await clinicModel.getSlotData( patient_slot )
                    .then(async( slotData ) => {


                    	await patientModel.getDoctorName( doc_id )
            			.then(async( docData ) => {

            				await clinicModel.getClinicOnly( clinic_id )
                  			.then(async( clinicData ) => {

                  				await doctorModel.getClinicBooking( doc_id, clinic_id )
                    			.then(async( rows ) => {

                      				const sms = {
    					                  app_id : appoitment_id,
    					                  patient_full_name: patient_name,
    					                  booking_date: book_date,
    					                  booking_time : slotData.schedule,
    					                  doctor_full_name: docData.full_name,
    					                  clinic_address: clinicData.location,
    					                  clinic_contact_number: clinicData.contact_1,
    					                  website: req.get('host'),
    					                  patient_contact_number: patient_mobile
    					                }

    					                await handler.sendToPatientFromDoctor( sms )
                              .then(() => {
                                  res.status(200).json({
                                      status: "1",
                                      data: rows
                                  });
                              })
                              .catch(err => {
                                console.log('error in sms', err);
                                res.status(400).json({
                                  status: 3,
                                  message: 'Something went wrong while sending sms'
                                }).end();
                              })

                    				
                    			})
                    			.catch(err => {
      						          console.log('error in query', err);
      						          res.status(400).json({
      						            status: 3,
      						            message: 'Something went wrong'
      						          }).end();
      						        })

                  			})
                  			.catch(err => {
					          console.log('error in query', err);
					          res.status(400).json({
					            status: 3,
					            message: 'Something went wrong'
					          }).end();
					        })
            			})
            			.catch(err => {
				          console.log('error in query', err);
				          res.status(400).json({
				            status: 3,
				            message: 'Something went wrong'
				          }).end();
				        })
                    })
                    .catch(err => {
			          console.log('error in query', err);
			          res.status(400).json({
			            status: 3,
			            message: 'Something went wrong'
			          }).end();
			        })
        	})
        	.catch(err => {
	          console.log('error in query', err);
	          res.status(400).json({
	            status: 3,
	            message: 'Something went wrong'
	          }).end();
	        })
        }).catch(err => {
          console.log('error in query', err);
          res.status(400).json({
            status: 3,
            message: 'Something went wrong'
          }).end();
        })
    },
    dateRangeUser: async(req, res, next) => {
      const doc_id  = req.user.id;
      const { clinic_id, start, end } = req.params;

      await doctorModel.dateRangeUser( doc_id, clinic_id, start, end )
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
    applyLeaveOnDate: async(req, res, next) => {
      const doc_id  = req.user.id;
      const { leave_start_date, leave_end_date, reason, clinic_id } = req.body

      await doctorModel.applyLeaveOnDate(leave_start_date, leave_end_date, reason, clinic_id, doc_id)
            .then(async function ( data ) {

              //cancel all appointment
              await doctorModel.doctorCancelDateAppointment(doc_id, clinic_id, leave_start_date, leave_end_date)
              .then(( result ) => {
                res.status(200).json({
                  status: "1"
                });
              })
              .catch(err => {
                console.log('error in query', err);
                res.status(400).json({
                  status: 3,
                  message: 'Something went wrong'
                }).end();
              })

            }).catch(err => {
              console.log('error in query', err);
              res.status(400).json({
                status: 3,
                message: 'Something went wrong'
              }).end();
            })
    },
    applyLeaveOnSlot: async(req, res, next) => {
      const doc_id  = req.user.id;
      const { slot_start_date, reason, slots, clinic_id } = req.body

      await doctorModel.applyLeaveOnSlot(slot_start_date, reason, clinic_id, doc_id)
            .then(async function ( data ) {

              await doctorModel.insertLeaveSlots( data, slots )
              .then(async( result ) => {

                  //cancel all appointment
                  await doctorModel.doctorCancelSlotAppointment(slot_start_date, clinic_id, doc_id)
                  .then(( result ) => {
                    res.status(200).json({
                      status: "1"
                    });
                  })
                  .catch(err => {
                    console.log('error in query', err);
                    res.status(400).json({
                      status: 3,
                      message: 'Something went wrong'
                    }).end();
                  })
              })
              .catch((err) => {
                console.log('error in query', err);
                res.status(400).json({
                  status: 3,
                  message: 'Something went wrong'
                }).end();
              })

            }).catch(err => {
              console.log('error in query', err);
              res.status(400).json({
                status: 3,
                message: 'Something went wrong'
              }).end();
            })
    },
    slotByDate: async(req, res, next) => {
      const doc_id  = req.user.id;
      const { clinic_id, start } = req.params;

      await doctorModel.slotByDate(clinic_id, doc_id, start)
            .then(async function ( data ) {

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
    slotPatient: async(req, res, next) => {
      const doc_id  = req.user.id;
      const { clinic_id, slot_id, book_date } = req.body;

      await doctorModel.slotPatient(clinic_id, doc_id, slot_id, book_date)
            .then(async function ( data ) {

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

}