/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */
require('dotenv').config({
  path: 'variables.env'
});



const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/db.sql');


const path = require("path");
const faker = require("@faker-js/faker").faker;

const hsApi = require('./controllers/hsAPIctrl');


// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));


// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

// hold all the data received by the webhooks
let data = [];


// hold all the users
let users = require('./users.json');



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


/**
 * Our home page route
 *
 * Returns src/pages/index.hbs with data built into it
 */
fastify.get("/", function (request, reply) {

  // params is an object we'll pass to our handlebars template
  let params = {
    seo: seo
  };


  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/index.hbs", {
    data,
    seo
  });
});



fastify.get("/editUser/:email", function (request, reply) {

  // params is an object we'll pass to our handlebars template
  let params = {
    seo: seo
  };

  const {
    email
  } = request.params;

  const user = users.find(user => user.email === email);

  reply.view("/src/pages/form.hbs", {
    user,
    seo
  });

});


fastify.get("/hs", function (request, reply) {
  reply.send(data);
});

fastify.get("/reset", function (request, reply) {

  data = [];
  reply.send(data);
});


fastify.get("/resetUsers", function (request, reply) {

  users = [];
  reply.send(users);
});


fastify.get("/data", function (request, reply) {

  reply.send(data);
});



fastify.get("/api/users", function (request, reply) {
  reply.send(users);
});


fastify.get("/api/user/:email", function (request, reply) {

  const {
    email
  } = request.params;

  const user = users.find(user => user.email === email);

  console.log(user)

  reply.send(user);
});


fastify.get("/api/user/", function (request, reply) {

  if (request.query.email === undefined) throw new Error(`Email needs to be set, we recieved  ${typeof request.query.email}`)


  const user = users.find(user => user.email === request.query.email);

  reply.send(user);

});





fastify.get("/users", function (request, reply) {


  if (users.length === 0) generateRandomUsers(30);

  reply.view("/src/pages/users.hbs", {
    users
  });

});



fastify.patch("/api/user", async function (request, reply) {

  try {

    console.log(request.body);

    const index = users.findIndex(user => user.email === request.body.email);

    if (index === -1) throw new Error("The user doesn't exist in the list");

    console.log(`${request.body.email} is located at position ${index} `);

    console.log(users[index]);


    if (typeof request.body.tokensAvailable !== "number") throw new Error("You can't set tokensAvailable with a type which is not a number ");

    if (request.body.tokensAvailable !== undefined) {
      users[index].tokensAvailable = request.body.tokensAvailable;
    }


    if (request.body.carManufacturer !== undefined) {
      users[index].carManufacturer = request.body.carManufacturer;
    }


    if (request.body.carModel !== undefined) {
      users[index].carModel = request.body.carModel;
    }


    if (request.body.name !== undefined) {
      users[index].name = request.body.name;
    }


    if (request.body.lastname !== undefined) {
      users[index].lastname = request.body.lastname;
    }


    // if the request doesn't come from HubSpot let's update the record by calling the HubSpot API 
    if (request.body.fromHs == false && request.body.tokensAvailable !== undefined) {


      const searchResult = await hsApi.getContactIdFromEmail(request.body.email);

      if (!searchResult.data && searchResult.data.results.length === -1) throw new Error(`Coulnd't find the contact`);

      const firstRecordFound = searchResult.data.results[0];

      console.log(firstRecordFound);

      const updateResults = await hsApi.updateContactByContactId(firstRecordFound.id, {
        "properties": {
          "tokens_available": request.body.tokensAvailable
        }
      });

      console.log(updateResults.data)

    }



    // Send back the updated record 

    reply.send(users[index]);

    console.log(users[index]);

  } catch (e) {

    console.log(e);
    reply.status('403').send(e.toString());
  }


});









fastify.post("/hs", function (request, reply) {
  console.log(request.body);

  data.push(request.body);

  reply.send(request.body);
});




fastify.get("/api/siret", function (request, reply) {


  if (request.query.domainName === undefined) throw new Error(`domainName needs to be set, we recieved  ${typeof request.query.domainName}`)


  const solvabiliteValues = ["Tres Bonne", "Bonne", "Moyenne"];


  const siren = {
    domainName: request.query.domainName,
    siret: faker.datatype.number({
      min: 200000000000001,
      max: 900000000000001
    }),
    solvabilite: solvabiliteValues[Math.floor(Math.random() * 3)]
  }

  reply.send(siren);
});




// Run the server and report out to the logs
fastify.listen(process.env.PORT || 8080, "0.0.0.0", function (err, address) {

  if (users.length === 0) generateRandomUsers(30);



  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);



});