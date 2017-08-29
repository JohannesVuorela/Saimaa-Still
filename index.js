var cool = require('cool-ascii-faces');
var pg = require('pg');
var express = require('express');
var app = express();

var pool = new pg.Pool();
var mysql = require('mysql');

var yhteys = mysql.createConnection({
  host: 'us-cdbr-iron-east-05.cleardb.net',
  user: 'b00c49b7bdca25',
  password: '389607ac',
  database: 'heroku_18d39e865fa4d72'
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', function(request, response) {
  response.render('pug/index');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/luotaulu', function(req, res) {
  var komento = "SELECT * FROM esimerkki";
  yhteys.query(komento, function(err, rows, fields) {
    if(err) { console.log("Tapahtui virhe: " + err); throw err; }
    res.send(rows);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
