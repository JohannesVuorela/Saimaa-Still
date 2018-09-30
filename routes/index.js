var express = require('express');
var router = express.Router();
var pg = require('pg');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');

var pool = new pg.Pool();
var mysql = require('mysql');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var yhteys = mysql.createPool({
  connectionLimit: 10,
  host: 'us-cdbr-iron-east-05.cleardb.net',
  user: 'b00c49b7bdca25',
  password: '389607ac',
  database: 'heroku_18d39e865fa4d72',
  multipleStatements: true
});

var generalOptions = {
  appHandler: app,
  hostUrl: "http://localhost:5000"
};

var maksunappi = require('maksunappi').create(generalOptions);

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(id, done) {
    var komento = "SELECT * FROM saimaastill_users WHERE id = ?";
    connection.query(komento, id, function(err, rows) {
      done(err, rows[0]);
    });
  });
}

router.get('/', function(req, res, next) {
  var komento = "SELECT * FROM saimaastill_tuotteet;";
  yhteys.query(komento, function(err, results) {
    if(err) { console.log("Tapahtui virhe: " + err); throw err; }
    res.render('index', { tiedot: results });
  });
});

router.get('/kirjautunut', function(req, res, next) {
  if(!req.session.kirjautunut) {
    res.render("login");
  } else {
    var komento = "SELECT * FROM saimaastill_users WHERE id = ?";
    yhteys.query(komento, [req.session.kirjautunut], function(err, results) {
      res.render("accountbox", { tiedot: results[0] });
    });
  }
});

router.get('/onkonimijoolemassa/:nimi', function(req, res, next) {
  yhteys.query("SELECT username FROM saimaastill_users WHERE username = ?", req.params.nimi, function(err, results) {
    res.send(results);
  });
});

router.get('/onkoemailjoolemassa/:email', function(req, res, next) {
  yhteys.query("SELECT spostiosoite FROM saimaastill_users WHERE spostiosoite = ?", req.params.email, function(err, results) {
    res.send(results);
  });
});

router.get('/luotaulu', function(req, res, next) {
  var komento = "SELECT * FROM saimaastill_kuitit; SELECT * FROM saimaastill_tavaratilaukset";
  yhteys.query(komento, function(err, rows, fields) {
    if(err) { console.log("Tapahtui virhe: " + err); throw err; }
    res.send(rows);
  });
});

router.get('/tuotteet', function(req, res, next) {
  var komento = "SELECT * FROM saimaastill_tuotteet";
  yhteys.query(komento, function(err, rows, fields) {
    if(err) { console.log("Tapahtui virhe: " + err); throw err; }
    res.send(rows);
  });
});

router.get('/register', function(req, res, next) {
  yhteys.query("SELECT username, spostiosoite FROM saimaastill_users", function(err, results) {
    res.render("register", { users: results });
  });
});

router.post('/register', function(req, res, next) {
  bcrypt.hash(req.body.salasana, 10).then(function(hash) {
    var komento = "INSERT INTO saimaastill_users (username, encrypted_password, spostiosoite, staffstatus) VALUES (?, ?, ?, ?)";
    yhteys.query(komento, [req.body.username, hash, req.body.email, 0], function(err, results) {
      if(err) { res.send("Something went wrong... Please try again later."); } else {
        res.send("Success");
      }
    });
  });
});

router.get('/registersuccess', function(req, res, next) {
  res.render("register-success");
});

router.post('/login', function(req, res, next) {
  var komento = "SELECT * FROM saimaastill_users WHERE username = ?";
  yhteys.query(komento, [req.body.tunnus], function(err, results) {
    if(err) { res.send("Something went wrong... Try again later.") } else {
      bcrypt.compare(req.body.salasana, results[0].encrypted_password, function(err, oikein) {
        if(oikein) {
          req.session.kirjautunut = results[0].id;
          res.send("Success");
        } else {
          res.send("Something went wrong... Try again later.");
        }
      });
    }
  });
});

router.get('/logout', function(req, res, next) { req.session.destroy(); res.redirect('/'); });

router.get('/checkout', function(req, res, next) {
  var komento = "SELECT * FROM saimaastill_tuotteet";
  yhteys.query(komento, function(err, results) {
    if(err) { console.log("Tapahtui virhe: " + err); }
    res.render('checkout', { tiedot: results });
  });
});

router.get('/maksa', function(req, res, next) {
  res.send(maksunappi.paymentButton("nordea", {
    requestId: "1212121121212",
    amount: 25,
    messageForBankStatement: "Saimaa Still Order",
    reference: maksunappi.referenceNumbers.toFinnishPaymentReference('323223323223'),
    language: 'FI'
  }));
});

router.post('/tilaa', function(req, res, next) {
  var komento = "INSERT INTO saimaastill_kuitit (etunimi, sukunimi, hinta, pvm, spostiosoite, postiosoite, postinumero, postitoimipaikka) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  yhteys.query(komento, [req.body.etunimi, req.body.sukunimi, 0, new Date(), req.body.spostiosoite, req.body.postiosoite, req.body.postinumero, req.body.postitoimipaikka], function(err, results) {
    if(!err) {
      console.log(results.insertId);
      var tavarat = req.body.tavaramerkkijono.split(",");
      for(var i = 0; i < tavarat.length; i += 2) {
        yhteys.query("INSERT INTO saimaastill_tavaratilaukset (kuitti, tuote, lkm) VALUES (?, ?, ?);", [results.insertId, tavarat[i], tavarat[i+1]], function(err, results) {
          if(err) { console.log(err); }
        });
      }
      res.send("Success");
    } else {
      res.send(err);
    }
  });
});

router.get('/ordersuccess', function(req, res, next) { res.render('ordersuccess'); });

router.get('/staff', function(req, res, next) {
  var komento = "SELECT * FROM saimaastill_kuitit; SELECT * FROM saimaastill_tavaratilaukset; SELECT * FROM saimaastill_tuotteet;";
  yhteys.query(komento, function(err, results) {
    res.render('staff', { kuitit: results[0], tavaratilaukset: results[1], tuotteet: results[2] });
  });
});

/*
router.post('/tuotteet', function(req, res, next) {
  var komento = "INSERT INTO saimaastill_tuotteet (tuotenimi, kategoria, hinta, kuvaurl) VALUES (?, ?, ?, ?);";
});

router.post('/', function(req, res, next) {
  var komento = "";
  yhteys.query(komento, function(err, rows, fields) {
    if(err) { console.log("Tapahtui virhe: " + err); throw err; }
    res.send(rows);
  });
});
*/

module.exports = router;
