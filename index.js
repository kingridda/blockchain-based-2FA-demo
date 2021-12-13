var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const util = require('util');
var speakeasy = require('speakeasy')

var app = express();
const port = 3000

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//app logic and data
var users = {};
let counter = 0;


//spatial address online situate consider slight powder network spoil moon ridge dutch
//U16554575997295564327

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/registration.html');
});
app.get('/verification', function(req, res) {
    res.sendFile(__dirname + '/public/authCode.html');
});
app.get('/verify', function(req, res) {
    res.sendFile(__dirname + '/public/verifyAdamant.html');
});
app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/public/welcomePage.html');
})

app.post('/login', (req, res) => {
    if (req.body.email && users[req.body.email] && users[req.body.email].password == req.body.password) {
        //setting the one time code
        users[req.body.email]['code'] = speakeasy.hotp({
            counter,
            secret: users[req.body.email].password,
        });
        sendWithAdamant(users[req.body.adamantAddress], users[req.body.email]['code'])
        counter++;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/verification')
    }

    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: false, status: 'Login Unsuccessful!' });
})
app.post('/verification', (req, res) => {
    const verified = speakeasy.hotp.verify({
        token: req.body.code,
        secret: users[req.body.email].code,
        counter: counter
    })
    if (verified) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/home')
    }
});
app.post('/register', (req, res) => {
    users[req.body.email] = { address: req.body.address, password: req.body.password }
    res.redirect('/verify')
})
app.post('/verify', (req, res) => { //for registration address verification
    if (req.body.code) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/')
    }
});



//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res) {
    res.status(404).send('404');
});
// error handler
app.use(function(err, req, res, next) {
    // render the error page
    res.status(500).send('ERROR 500');
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


function isAuthenticated(req, res, next) {
    return true;
}

async function sendWithAdamant(adamantAddress, code) {
    const exec = util.promisify(require('child_process').exec);

    const command = `adm send message ${adamantAddress} "2FA code: ${code}"`;
    let { error, stdout, stderr } = await exec(command);
}