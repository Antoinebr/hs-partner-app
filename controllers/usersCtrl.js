const Users = require('../models/Users');



exports.updateUser = async (user) => {

    if(!user) throw new Error("You have to pass an user");

    const existingUser = await this.getUser(user.email);

    if(!existingUser) throw new Error("The user doesn't exist in the list");

    if (typeof user.tokensAvailable !== "number") throw new Error("You can't set tokensAvailable with a type which is not a number ");

    if(!user.carManufacturer) throw new Error("You can't set carManufacturer as an empty value ");

    if(!user.carModel) throw new Error("You can't set carModel as an empty value ");

    if(!user.name) throw new Error("You can't set name as an empty value ");

    if(!user.lastname) throw new Error("You can't set name as an empty lastname ");

    user.avatar = existingUser.avatar;
 
    const {changes} = await Users.updateUser(user);
  
    return {changes};

 
}



exports.getAllusers = async () => {

    const users = await Users.getUsers();

    return users;
}



exports.getUser = async (email) => {

    if(typeof email !== "string") throw new Error(`We exepected a string as email, we go ${email}`);

    const user = await Users.getUser(email);

    return user;
}