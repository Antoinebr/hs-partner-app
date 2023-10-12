const { PromisedDatabase } = require("promised-sqlite3"); // import the class
const db = new PromisedDatabase(); // create a instance of PromisedDatabase
db.open("./db/db.sqlite");



exports.insertUser = async (user) => {

    if (typeof user !== "object") throw new console.error(`user has to be an object`);

    const insertion = await db.run(

        `
        INSERT INTO Users (name, lastname, email, avatar, tokensAvailable, carManufacturer, carModel)
        
        VALUES (?, ?, ?, ?, ?, ?, ?) 
        `,
        user.name, user.lastname, user.email, user.avatar, user.tokensAvailable, user.carManufacturer, user.carModel

    );

    return insertion;

}


exports.createUserTable = async () => {

    const query = `
        CREATE TABLE Users 
            ( 
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100)  NOT NULL,
                lastname VARCHAR(100)  NOT NULL,
                email VARCHAR(100)  NOT NULL,
                avatar VARCHAR(100)  NOT NULL,
                tokensAvailable INT NOT NULL,
                carManufacturer  VARCHAR(100)  NOT NULL,
                carModel  VARCHAR(100)  NOT NULL
            );
        `;

    return await db.run(query);

}


exports.getUsers = async () => {

    const result = await db.all("SELECT * FROM Users");

    return result;
}


exports.getUser = async (email) => {

    const result = await db.get("SELECT * FROM Users WHERE email = $email", {
        $email: email
    });

    return result;
}

exports.destroyUser = async (email) => {

    const result = await db.get("DELETE FROM Users WHERE email = $email", {
        $email: email
    });

    return result;
}


exports.updateUser = async (user) => {

    const update = await db.run(`
    
        UPDATE Users 

        SET 
        
            name = $name, 
            lastname = $lastname,
            carModel = $carModel,
            carManufacturer = $carManufacturer,
            tokensAvailable = $tokensAvailable,
            avatar = $avatar
        
        WHERE email = $email
        
        `, {
        $email: user.email,
        $avatar: user.avatar,
        $carModel: user.carModel,
        $tokensAvailable: user.tokensAvailable,
        $carManufacturer: user.carManufacturer,
        $name: user.name,
        $lastname: user.lastname
    });


    return update;
}