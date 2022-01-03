var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session')
var FileStore = require('session-file-store')(session);
var path = require('path');
const util = require('util');
var speakeasy = require('speakeasy')
var fs = require("fs");
var crypto = require('crypto');

var app = express();
const port = 3000

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));

//app logic and data
var users = getFakeDB('fakeDB.json');
let counter = 0;

//my adamant account
//spatial address online situate consider slight powder network spoil moon ridge dutch
//U16554575997295564327

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/registration.html');
});
app.get('/verification', function(req, res) { //auth 2FA verification
    res.sendFile(__dirname + '/public/authCode.html');
});
app.get('/verify', function(req, res) { //registration adamant account verification
    res.sendFile(__dirname + '/public/verifyAdamant.html');
});
app.get('/home', isAuthenticated, function(req, res) {
    res.sendFile(__dirname + '/public/welcomePage.html');
})
app.get('/failed', (req, res) => {
    res.sendFile(__dirname + '/public/failed.html');
});

app.post('/login', (req, res) => {
    if (req.body.email && req.body.password && users[req.body.email] && users[req.body.email].password &&
        users[req.body.email].password == getHash(req.body.password)) {

        //setting the one time code
        users[req.body.email]['counter'] = counter++;
        users[req.body.email]['oneTimeCode'] = {
            value: speakeasy.hotp({
                counter: users[req.body.email]['counter'],
                secret: users[req.body.email].password
            }),
            createdAt: new Date().valueOf()
        }
        sendWithAdamant(users[req.body.email]["address"], users[req.body.email]['oneTimeCode'].value)
        req.session.email = req.body.email;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/verification')
    } else {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/failed')
    }
})
app.post('/register', (req, res) => {
    users[req.body.email] = { address: req.body.address, password: getHash(req.body.password) }
    setFakeDB('fakeDB.json', users);
    users[req.body.email]['counter'] = counter++;
    users[req.body.email]['oneTimeCode'] = {
        value: speakeasy.hotp({
            counter: users[req.body.email]['counter'],
            secret: users[req.body.email].password
        }),
        createdAt: new Date().valueOf()
    }
    sendWithAdamant(users[req.body.email]['address'], users[req.body.email]['code'])
    req.session.email = req.body.email;
    res.redirect('/verify');
})
app.post('/verification', (req, res) => {
    if (req.session.email) {
        const verified = speakeasy.hotp.verify({
            token: req.body.code,
            secret: users[req.session.email].password,
            counter: users[req.session.email]['counter'],
        });
        if (verified && users[req.session.email].oneTimeCode.createdAt &&
            (new Date().valueOf() - users[req.session.email].oneTimeCode.createdAt < 120000)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/home')
        } else {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/failed')
        }
    } else {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/failed')
    }
});

app.post('/verify', (req, res) => { //for registration adamant address verification
    if (req.session.email) {
        const verified = speakeasy.hotp.verify({
            token: req.body.code,
            secret: users[req.session.email].password,
            counter: users[req.session.email]['counter'],
        });
        if (verified && users[req.session.email].oneTimeCode.createdAt &&
            (new Date().valueOf() - users[req.session.email].oneTimeCode.createdAt < 120000)) {

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/')
        } else {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/failed')
        }
    } else {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/failed')
    }
});




//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res) {
    res.status(404).sendFile(__dirname + '/public/failed.html');
});
// error handler
app.use(function(err, req, res, next) {
    // render the error page
    res.status(500).sendFile(__dirname + '/public/failed.html');
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


function isAuthenticated(req, res, next) {
    if (req.session.email == null) {
        var err = new Error('Not authorized! Go back!');
        err.status = 401;
        return next(err);
    } else {
        return next();
    }
}

async function sendWithAdamant(adamantAddress, code) {
    const exec = util.promisify(require('child_process').exec);
    const command = `node ./adamant-console/index.js send message ${adamantAddress} "2FA code: ${code}"`;
    command = "ECHO 66666666666666666666666666666666666666666666666666";
    let { error, stdout, stderr } = await exec(command);
    command = "pwd";
    let o = await exec(command);
}




// handling json file (our fake DB)

function getFakeDB(filepath) {
    var file = fs.readFileSync(__dirname + '/' + filepath, 'utf8');
    return JSON.parse(file);
}

function setFakeDB(filepath, db) {
    json = JSON.stringify(db);
    fs.writeFile(__dirname + '/' + filepath, json, 'utf8', (err) => {});
}

function getHash(trs) {
    return crypto.createHash('sha256').update(trs).digest('hex');
}