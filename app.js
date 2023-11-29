var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const MongoClient = require('mongodb').MongoClient


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mergeRouter = require('./routes/merge');
var videosRouter = require('./routes/videos');
var snapshotRouter = require('./routes/snapshot');
var srpreadSheetRouter = require('./routes/spreadsheet');
var greetingsRouter = require('./routes/greetings');

const { dbSetClient, dbSetName } = require("./db/dbOperations");

var app = express();

connectToDb().then(client => {
  dbSetClient(client);
  dbSetName(process.env.DB_NAME);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const corsOptions = {
  origin: process.env.CORS_HOST,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/merge', mergeRouter);
app.use('/videos', videosRouter);
app.use('/snapshot', snapshotRouter);
app.use('/spreadsheet', srpreadSheetRouter);
app.use('/greetings', greetingsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

async function connectToDb() {

  const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/?retryWrites=true&w=majority`;
  // const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/OverHello`;
  const client = new MongoClient(dbUri);
  await client.connect();
  console.log('Connected successfully to server');
  return client
}