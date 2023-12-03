const mysql = require('mysql')
 
const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",  
    password: "Msd@007,", 
    database: "waitlist_app"
  });

connection.connect(function (error) {
    if (error) {
        console.error('Error connecting to MySQL:', error);
    } else {
        console.log('Database connected');
    }
});

module.exports = connection;
