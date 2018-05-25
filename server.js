/* Requirements */

var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var bodyParser = require('body-parser');
require("./functions/tools.js")();

/* Setup */

var app = express();
var router = express.Router();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json());


/* DB Connection */

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "db_stf"
});


/* Parse rooms JSON */

var rooms;

ajaxGet("http://online.stationf.co/tests/rooms.json",function(response) {
 	rooms = JSON.parse(response);
});

/* Variable sanitizer */

	var dayRegExp = new RegExp('^(?:2018|2019|2020|2021|2022)-(?:01|02|03|04|05|06|07|08|09|10|11|12)-(?:01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)$');
	var hourRegExp = new RegExp('^(?:6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22)$');
	var userRegExp = new RegExp('^[a-zA-Z0-9_]+$');
	var idRoomRegExp = new RegExp('^[0-9]+$');


/* API's */


app.get('/api/reserver/',function(req,res){ 
	var id_room = req.query.id_room; //TODO : Sanitizer
	var day = req.query.day;
	var hour = req.query.hour;
	var user = req.query.user;
	var exists = 0;
	if (dayRegExp.test(day) === false)
		res.json({message: "Error : Invalid date (Select a date between 2018 and 2022)"});
	else if (hourRegExp.test(hour) === false)
		res.json({message: "Error : Invalid hour (Select an hour between 06.00 AM and 10.00 PM)"});
	else if (userRegExp.test(user) === false)
		res.json({message: "Error : Invalid username (Only alphanumeric names allowed.)"});
	else if (idRoomRegExp.test(id_room) === false || parseInt(id_room) >= rooms['rooms'].length)
		res.json({message: "Error : Invalid room selected."});
	else{
	con.connect(function(err) {
			var sql = "SELECT * FROM Reservations WHERE id_room ='"+id_room+"' AND date ='"+day+"' AND hour = '"+hour+"'";
			con.query(sql, function (err, result) {
			if (result.length === 0)
			{
//Insert a reservation
		con.connect(function(err) {
			var sql = "INSERT INTO Reservations (id_room, username, date, hour) values ('"+id_room+"','"+user+"', '"+day+"', '"+hour+"')"; // TODO : Sanitizer
 			con.query(sql, function (err, result) {
			});
		});

		//Overwriting .json File
		con.connect(function(err) {
			var sql = "SELECT * FROM Reservations";
			con.query(sql, function (err, result) {
				fs.writeFileSync("reservations.json", JSON.stringify(result), "UTF-8");
			});
		});
	res.json({message: "success"})
}
	else
		res.json({message: "Error : This booking already Exists. Please refresh your browser."});
			});
			});
	}
});


app.get('/api/available',function(req,res){ 
	var day = req.query.day;
	var hour = req.query.hour;
	if (dayRegExp.test(day) === false)
		res.json({message: "Error"});
	else if (hourRegExp.test(hour) === false)
		res.json({message: "Error"});
	else
	{
	con.connect(function(err) {
	   var sql = "SELECT id_room FROM Reservations WHERE date ='"+day+"' and hour ='"+hour+"'";
		con.query(sql, function (err, result) {
			res.json({result : result});
		});
	});
	}
});

/* Render Routes */

app.get('/', function(req, res, next) {
    res.render('index');
})


.post('/', function(req, res) {
ajaxGet("http://localhost:8080/api/available?day="+req.body.date+"&hour="+req.body.hour,function(response) {
	var taken_rooms = JSON.parse(response);
	if (taken_rooms['message'] === "Error")
	// Return index if form is corrupted
		res.render('index');
	else
	{
		var roomsFiltered = checkRooms(taken_rooms['result'], rooms['rooms']);
		    res.render('list', {name: req.body.room_name, rooms: roomsFiltered, day: req.body.date, hour: req.body.hour, capacity: req.body.capacity, tv: req.body.tv, retro: req.body.retro});
	}
		});
})

.post('/reserver', function(req, res) { //TODO : Sanitize params query

//Check if reservation doesn't exists
ajaxGet("http://localhost:8080/api/reserver?id_room="+req.body.id_room+"&day="+req.body.day+"&hour="+req.body.hour+"&user="+req.body.user,function(response)
{
var msg = JSON.parse(response);
res.render('bookConfirmation', {msg: msg['message'], roomName:req.body.room_name, day: req.body.day, hour: req.body.hour, user: req.body.user}); //Useless to sanitize room name (not stored)
});
})

/* Public folder */
.use('/static', express.static(__dirname + '/public'))


/* 404 Not found */

.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
})

.listen(8080);
