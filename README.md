# TradeMe
A repo for collaboration on trademe.

To self-host, nodejs and mysql (or mariadb) is required.
User, transaction and item information is stored in the mysql database, and the username and pass is set from the index.js file (yes, i know, bad design, i dont care right now).

to start:
node index.js (with root perms, as ports 80 and 443 are used)
