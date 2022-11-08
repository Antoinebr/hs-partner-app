const faker = require("@faker-js/faker").faker;


const createUser = () => {

    const name = faker.name.firstName();
    const lastname = faker.name.lastName();
    const avatar = faker.image.avatar();
    const tokensAvailable = parseInt(faker.random.numeric(2));
    const email = faker.internet.email(name, lastname).toLowerCase();
    const carManufacturer = faker.vehicle.manufacturer();
    const carModel = faker.vehicle.model();
  
    return {
      name,
      email,
      lastname,
      avatar,
      email,
      tokensAvailable,
      carManufacturer,
      carModel
    }
  
  }
  
  
  
  
  const generateRandomUsers = (numberOfUsersToGenerate) => {
  
    for (let i = 0; i < numberOfUsersToGenerate; i++) {
      users.push(createUser());
    }
  
  }
  