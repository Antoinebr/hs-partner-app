const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/db.sqlite');




//var query = `CREATE TABLE Users ( ID NUMBER , name VARCHAR(100) ,  email VARCHAR(100) , avatar VARCHAR(100), tokensAvailable INT , carManufacturer  VARCHAR(100),  carModel  VARCHAR(100));`


var query = `
INSERT INTO Users (name, email, avatar, tokensAvailable, carManufacturer, carModel)
VALUES( "Antoine", "antoinebrossault@gmail.com", "http://google.fr", 453, "BMW", "X1");
`


const insertUser = (user) => {

    const query = `
    INSERT INTO Users (name, email, avatar, tokensAvailable, carManufacturer, carModel)
    VALUES( "${user.name}",  "${user.email}", "${user.avatar}", "${user.tokensAvailable}",  "${user.carManufacturer}", "${user.carModel}" );
    `
    
    db.run(query);
}


const user = {
    name : 'Max',
    email: "maxoogmail.com",
    avatar: "lol",
    tokensAvailable : 900,
    carManufacturer : "Volvo",
    carModel : "XC70"
}


insertUser(user);

