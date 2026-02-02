# TradeMe
A repo for collaboration on TradeMe, a general marketplace for our school.
![storepage](https://files.catbox.moe/fa1k0k.png "storepage")

### To self-host, Node.js and MySQL (or MariaDB) is required.
The database needs two tables:
1. 'users', which is comprised of an ID (int, auto-incrementing, primary key), displayname (varchar, size 20), password (varchar, size 20), money (double) and username (varchar, size 20).
2. 'transactions', which is comprised of an ID (int, auto-incrementing, primary key), creatorID (int), itemname (varchar, size 40), type (varchar, size 20), itemprice (double), itemamount (double), exiprydate (datetime). 

### To start:
* Change database credentials or port to your liking.
* node index.js (with root perms, as ports 80 and 443 are used)

![signup](https://files.catbox.moe/6ab4mj.png "signup") 
![sellorder](https://files.catbox.moe/hwztyh.png "sellorder")
![direct](https://files.catbox.moe/kft9v8.png "direct")
