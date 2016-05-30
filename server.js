//BASE SETUP
//=====================================

//CALL THE PACKAGES --------------------
var express	= require('express');
var app		= express();
var bodyParser	= require('body-parser');
var morgan	= require('morgan');
var mongoose	= require('mongoose');
var config	= require('./config');
var path	= require('path');

//APP CONFIGURATION --------------------
//Use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//configure our app to hadle CORS requests
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, \ Authorization');
	next();
});

//log requests to our console
app.use(morgan('dev'));

//connect to our database
mongoose.connect(config.database);

//set static files location
//used for requests that our frontend wil make
app.use(express.static(__dirname + '/public'));

//ROUTES FOR OUR API
//=======================================

//REGISTER THE ROUTES
//All our routes will be prefixed with /api
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

//basic route for home page
//MAIN CATCHALL ROUTE-----
//SEND USERS TO FRONTEND
//Has to be registered after API ROUTES!!!!
app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

//START THE SERVER
//=========================================

app.listen(config.port);
console.log('Magic happens on ' + config.port);
