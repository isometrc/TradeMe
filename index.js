var mysql = require('mysql');
var https = require('https');
var http = require('http');
var fs = require('fs')
var path = require('path');
var moment = require('moment');
var bodyparser = require('body-parser');
var cookieparser = require('cookie-parser');
var express = require('express');
var store = express()

store.use(cookieparser());
store.use(bodyparser.urlencoded({extended:false}));
store.use(bodyparser.json());

store.use(express.static(path.join(__dirname, 'public')));

var sql = mysql.createConnection
({
    host: "localhost",
    user: "local",
    port: 52443,
    password: "Id0ntr3@llyc@r3",
    database: "store"
});

sql.connect (function(err)
{
    if (err) throw err;
    console.log("[+] Connected to the database");
});

const options =
{
    key : fs.readFileSync('./key.pem'),
    cert : fs.readFileSync('./cert.pem')
}


var httpsserver = https.createServer(options, store).listen(443, "0.0.0.0", function()
{
    console.log("[+] Store listening at http://%s:%s", httpsserver.address().address, httpsserver.address().port);
});

var httpserver = http.createServer(store).listen(80, "0.0.0.0", function()
{
    console.log("[+] Store listening at http://%s:%s", httpserver.address().address, httpserver.address().port);
});

function make_transaction (senderID, recipientID, amount)
{
    var _senderBalance = 0.00;
    var _recipientBalance = 0.00;

    var _command = "SELECT money FROM users WHERE ID=" + senderID + ";";
    sql.query(_command, function (err, result)
    {
        if (err) throw err;
        _senderBalance = result.money;
        console.log("Sender Initial Balance: " + _senderBalance);

        _command = "SELECT money FROM users WHERE ID=" + recipientID + ";";
        sql.query(_command, function (err2, result2)
        {
            if (err2) throw err2;
            _recipientBalance = result2.money;
            console.log("Recipient Initial Balance: " + _recipientBalance);

            if (_senderBalance < amount)
            {
                console.log("[-] Not enough money in sender account")
                // TODO: Display error message on site.
            }
            else
            {
                var _newSenderBalance = _senderBalance - amount;
                var _newRecipientBalance = _recipientBalance + amount;

                _command = "UPDATE users SET money=" + _newSenderBalance + " WHERE ID=" + senderID + ";";
                sql.query(_command, function (err3, result3)
                {
                    if (err3) throw err3;
                    console.log("Sender Final Balance: " + _senderBalance);

                    _command = "UPDATE users SET money=" + _newRecipientBalance + " WHERE ID=" + recipientID + ";";
                    sql.query(_command, function (err4, result4)
                    {
                        if (err4) throw err4;
                        console.log("Recipient Final Balance: " + _recipientBalance);
                    });
                });
            }
        });
    });
}

store.get ('/', function (req, res)
{
    if (req.cookies.userID != undefined)
        res.sendFile(__dirname + '/src/views/storepage.html')
    else
        res.sendFile(__dirname + '/src/views/index.html'); 
});

store.get ('/index.html', function (req, res)
{
    res.sendFile(__dirname + '/src/views/index.html'); 
});

store.get ('/signup.html', function (req, res)
{
    res.sendFile(__dirname + '/src/views/signup.html'); 
});

store.get ('/signin.html', function (req, res)
{
    //make_transaction(1, 2, 500.00);
    res.sendFile(__dirname + '/src/views/signin.html'); 
});

store.get ('/signout.html', function (req, res)
{
    res.clearCookie("userID");
    res.sendFile(__dirname + '/src/views/index.html');
});

store.post ('/signup', function (req, res) 
{
    var _username = req.body.username;
    var _displayname = req.body.displayname;
    var _password = req.body.password;
    var _startermoney = 100.00;

    var _command = "SELECT ID FROM users WHERE username='" + _username + "'OR displayname='" + _displayname + "';";
    sql.query(_command, function(err, result)
    {
        if (err) throw err;
        if (result.length == 0)
        {
            var _command = "INSERT INTO users (username, displayname, password, money) VALUES ('" + _username + "', '" + _displayname + "', '" + _password + "', "+ _startermoney + ");";
    
            sql.query(_command, function (err2, result2)
            {
                if (err2) throw err2;
                console.log("[+] Added new user successfully")
        
                var _command = "SELECT ID FROM users WHERE username='" + _username + "'AND displayname='" + _displayname + "';";
                sql.query(_command, function (err3, result3)
                {
                    if (err3) throw err3;
        
                    res.cookie("userID", result3[0].ID);
                    res.sendFile(__dirname + '/src/views/storepage.html'); 
                });
            });
        } 
        else
        {
            res.sendFile(__dirname + '/src/views/userexists.html');
        }
    });
});

store.post ('/signin', function (req, res)
{
    var _username = req.body.username;
    var _password = req.body.password;

    var _command = "SELECT ID FROM users WHERE username='" + _username + "' AND password='" + _password + "';";
    sql.query(_command, function (err, result)
    {
        if (err)
        {
            throw err;
        } 
           
        if (result.length == 1)
        {
            res.cookie("userID", result[0].ID);
            res.sendFile(__dirname + '/src/views/storepage.html'); 
        }
        else
        {
            res.sendFile(__dirname + '/src/views/invalidcreds.html');
        }
    });
});

store.post ('/sellorder', function (req, res)
{
    var _itemname = req.body.name;
    var _items = "";

    var _command = "SELECT * FROM transactions WHERE itemname='" + _itemname + "' AND type='sell';";

    sql.query(_command, function(err, result)
    {
        if (err) throw err;

        for (i = 0; i < result.length; i++)
        {
            _command = "SELECT * FROM users WHERE ID=" + result[i].creatorID + ";"; 

            sql.query(_command, function(err2, result2)
            {
                if (err2) throw err2;
          
                for (i = 0; i < result.length; i++)
                {
                    _items += "<tr id='sellorder' href='#myModal'> <td>" + result[i].itemprice + "</td> <td>" + result[i].itemamount + "</td> <td>" + result2[i].displayname + "</td> <td>" + moment(result[i].expirydate).format('LLL') + "</td> </tr>";
                } 
                res.send(_items)
            });
        }
    });     
});

store.post ('/buyorder', function (req, res)
{
    var _itemname = req.body.name;
    var _items = "";

    var _command = "SELECT * FROM transactions WHERE itemname='" + _itemname + "' AND type='buy';";

    sql.query(_command, function(err, result)
    {
        if (err) throw err;

        for (i = 0; i < result.length; i++)
        {
            _command = "SELECT * FROM users WHERE ID=" + result[i].creatorID + ";"; 

            sql.query(_command, function(err2, result2)
            {
                if (err2) throw err2;
          
                for (i = 0; i < result.length; i++)
                {
                    _items += "<tr id='buyorder' href='#myModal4'> <td>" + result[i].itemprice + "</td> <td>" + result[i].itemamount + "</td> <td>" + result2[i].displayname + "</td> <td>" + moment(result[i].expirydate).format('LLL') + "</td> </tr>";
                } 
                res.send(_items)
            });
        }
    });     
});

store.post ('/directtransfer', function(req, res)
{

});

store.get('*', function(req, res)
{
    if (req.cookies.userID != undefined)
        res.sendFile(__dirname + '/src/views/storepage.html')
    else
        res.sendFile(__dirname + '/src/views/index.html'); 
});
