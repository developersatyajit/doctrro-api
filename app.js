var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport')
var fileUpload = require('express-fileupload');

var defaultRoute  = require('./routes/user');
var dgRoute       = require('./routes/diagnostic');
var dcRoute       = require('./routes/doctor');
var ptRoute       = require('./routes/patient');
var adminRoute       = require('./routes/admin');

var app = express();

// NEW NPM
const nocache   = require('nocache')
const helmet    = require('helmet')
const frameguard = require('frameguard')

app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag');
app.use(passport.initialize());

app.use(nocache())
app.use(helmet.noSniff())
app.use(frameguard())
app.use(helmet.xssFilter())

app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 //5MB max file(s) size
    },
}));

app.use(function(req, res, next) {

  // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
});

app.use('/api', defaultRoute);
app.use('/api/diagnostic', dgRoute);
app.use('/api/doctor', dcRoute);
app.use('/api/patient', ptRoute);
app.use('/api/admin', adminRoute);

app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  console.log('err',err);

  res.json({
    message:err.message,
    //error: req.app.get('env') === 'development' ? err : {}
    error: err
  })
});

module.exports = app;
