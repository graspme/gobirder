//Mysql
var feedData = require('./feedData.js');
var fetchBirdData = require('./browseEditBirds.js');
var searchBirdData = require('./search.js');
var mysql = require('mysql');
var bodyParser = require('body-parser')
var timestamp = require('console-timestamp');
var fileupload = require("express-fileupload");
var fs = require('fs');
var globalDir = "./Media/";
!fs.existsSync(globalDir) && fs.mkdirSync(globalDir);

var db_config = { host : 'localhost', user : 'root', password : 'dbpassword', database : 'birds',};
var con = mysql.createConnection(db_config);
con.connect(function(err) 
{
	if (err) 
		throw err;
	console.log(timestamp('DD-MM-YYYY hh:mm:ss:iii'),"DB Connected!");
});
//Mysql

const express = require('express');
const app = express();
//app.set("view engine","jade");

app.use(bodyParser.urlencoded({extended: true}))
//app.use(bodyParser.json());
app.use(fileupload());

//for favicon to be picked up
app.use('/Media', express.static(__dirname + '/Media'));
app.use(express.static('public'));

var server = app.listen(2000, function () 
{
	var host = server.address().address;
	var port = server.address().port;
	console.log(timestamp('DD-MM-YYYY hh:mm:ss:iii'),"GoBirder app listening at http://"+host+":"+port);
})

app.get('/', function(req,res) 
{
	res.sendFile(__dirname + '/index.html');
});

app.get('/browseBirds', (req, res) => 
{
	//fetch the CommonNames and populate a drop down
	fetchBirdData.fetchBirdNames(res, con);
});

app.post('/search', (req, res) => 
{
	//fetch the CommonNames and populate a drop down
	searchBirdData.search(req, res, con);
});

app.get('/searchBirds', (req, res) => 
{
	//fetch the CommonNames and populate a drop down
	res.sendFile(__dirname + '/searchBirds.html');
});

app.get('/checkIfExists', (req, res) => 
{
	fetchBirdData.checkIfExists(req, res, con);
});

app.get('/feedBirds', (req, res) => 
{
	//serve the html page
	fetchBirdData.fetchBirdDetailsByCName(req, res, con);
});
app.post('/feedData', (req, res) => 
{
	//submit request from html page
	console.log(req.body);
	if (!req.files)
		return res.status(400).send('No files were uploaded.');
	var name = req.body.Name;
	var mediaDir = globalDir+name+"/";	
	!fs.existsSync(mediaDir) && fs.mkdirSync(mediaDir);

	//handle Media files
	feedData.copyMediaFiles(req.files.Photo, mediaDir+"Photos/", fs);
	feedData.copyMediaFiles(req.files.Sounds, mediaDir+"Sounds/", fs);
	feedData.copyMediaFiles(req.files.Map, mediaDir+"Map/", fs);

	//handle rest of the text data
	feedData.insertData (req, res, con, mediaDir);

}); 