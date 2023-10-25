const { PromisedDatabase } = require("promised-sqlite3"); // import the class
const db = new PromisedDatabase(); // create a instance of PromisedDatabase
db.open("./db/db.sqlite");



/**
 * Insert a user into the Users table.
 *
 * @param {Object} user - The user object to be inserted into the database.
 * @returns {Promise} - A promise that resolves with the result of the insertion.
 * @throws {Error} - Throws an error if the user is not an object.
 */
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


/**
 * Create the Users table in the database.
 *
 * @returns {Promise} - A promise that resolves when the table is created.
 */
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


/**
 * Get a list of all users from the Users table.
 *
 * @returns {Promise} - A promise that resolves with an array of user objects.
 */
exports.getUsers = async () => {

    const result = await db.all("SELECT * FROM Users");

    return result;
}


/**
 * Get a user from the Users table by their email.
 *
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise} - A promise that resolves with the user object.
 */
exports.getUser = async (email) => {

    const result = await db.get("SELECT * FROM Users WHERE email = $email", {
        $email: email
    });

    return result;
}


/**
 * Delete a user from the Users table by their email.
 *
 * @param {string} email - The email of the user to delete.
 * @returns {Promise} - A promise that resolves with the result of the deletion.
 */
exports.destroyUser = async (email) => {

    const result = await db.get("DELETE FROM Users WHERE email = $email", {
        $email: email
    });

    return result;
}



/**
 * Update a user's information in the Users table.
 *
 * @param {Object} user - The user object with updated information.
 * @returns {Promise} - A promise that resolves with the result of the update operation.
 */
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