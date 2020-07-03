var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var helmet = require('helmet')


var indexRouter = require('./routes/index');
var downloadsRouter = require('./routes/downloads');
var hooksRouter = require('./routes/hooks');
var deploymentDatabaseRouter = require('./routes/deploymentDB');
var launchDatabaseRouter = require('./routes/launchDB');
var configRouter = require('./routes/configData');
var launchRouter = require('./routes/launch.js');
var gitlabApiRouter = require('./routes/gitlabAPI.js');

var app = express();

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/downloads', downloadsRouter);
app.use('/hooks', hooksRouter);
app.use('/deploymentDB', deploymentDatabaseRouter);
app.use('/launchDB', launchDatabaseRouter);
app.use('/configData', configRouter);
app.use('/launch', launchRouter);
app.use('/gitlabAPI', gitlabApiRouter);


// catch 404 and forward to error handler
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
  res.render('error');
});

module.exports = app;
