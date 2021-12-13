var express = require('express');
var app = express();
var path = require('path');
const port = 3000
app.use(express.static(path.join(__dirname, 'public')));




app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/registration.html');
});

app.get('/verification', function(req, res) {
    res.sendFile(__dirname + '/public/authCode.html');
});
app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/public/welcomePage.html');
})








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