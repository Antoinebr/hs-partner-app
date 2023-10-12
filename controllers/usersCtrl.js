require('dotenv').config({
    path: 'variables.env'
});
  
const Users = require('../models/Users');

const hubSpotAPI = require('../apis/hubSpot.js');



  


exports.updateUser = async (user) => {

    if (!user) throw new Error("You have to pass an user");

    const existingUser = await this.getUser(user.email);

    if (!existingUser) throw new Error("The user doesn't exist in the list");

    if (typeof user.tokensAvailable !== "number") throw new Error("You can't set tokensAvailable with a type which is not a number ");

    if (!user.carManufacturer) throw new Error("You can't set carManufacturer as an empty value ");

    if (!user.carModel) throw new Error("You can't set carModel as an empty value ");

    if (!user.name) throw new Error("You can't set name as an empty value ");

    if (!user.lastname) throw new Error("You can't set name as an empty lastname ");

    user.avatar = existingUser.avatar;

    const { changes } = await Users.updateUser(user);

    return { changes };

}



exports.getAllusers = async () => {

    const users = await Users.getUsers();

    return users;
}



exports.removeUser = async (email) => {

    if (!email || email === "") throw new Error("You can't remove a user without providing a user email ");

    const user = await Users.destroyUser(email)

    return user;
}

exports.getUser = async (email) => {

    if (typeof email !== "string") throw new Error(`We exepected a string as email, we go ${email}`);

    const user = await Users.getUser(email);

    if(!user) throw new Error(`No user found for ${email}`);

    return user;
}

exports.addUser = async (user) => {


    if (!user) throw new Error(`There's no user`);

    user.avatar = (!user.avatar || user.avatar.trimStart()  === "") ? `img/males/${Math.floor(Math.random() * 24) + 1}.jpg` : user.avatar;

    console.log( user.avatar)
    const requiredKeys = ['name', 'lastname', 'email', 'avatar', 'tokensAvailable', 'carManufacturer', 'carModel'];

    for (const key of requiredKeys) {
        if (!user[key] || user[key] === null) {
            throw new Error(`Key '${key}' is missing or null in the user object.`);
        }
    }


    const userAdded = await Users.insertUser(user);

    if(userAdded){
        
        const insertion = await hubSpotAPI.addContact({
            properties: {
                email: user.email,
                lastname: user.lastname,
                firstname: user.name,
                carmanufacturer : user.carManufacturer,
                car_model : user.carModel,
                tokens_available : user.tokensAvailable
            },
        }).catch(console.log)

        console.log('User added in HubSpot');
    }

    return userAdded;

}