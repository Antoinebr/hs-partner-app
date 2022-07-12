/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */
require('dotenv').config({ path: 'variables.env' });
const path = require("path");

const faker = require("@faker-js/faker").faker;


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
let users = [
]



const createUser = () =>  {

  const name =  faker.name.firstName();
  const lastname  = faker.name.lastName();
  const avatar =  faker.image.avatar();
  const tokensAvailable =  parseInt(faker.random.numeric(2));
  const email  = faker.internet.email(name, lastname ).toLowerCase();
  const carManufacturer = faker.vehicle.manufacturer();
  const carModel = faker.vehicle.model();

  console.log(email.toLowerCase());


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
    console.log(createUser());

    users.push(createUser());
  }

}


/**
* Our home page route
*
* Returns src/pages/index.hbs with data built into it
*/
fastify.get("/", function(request, reply) {
  
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };

  
  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/index.hbs", {
    data,
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

  const { email } = request.params;

  const user = users.find( user => user.email === email);

  console.log(user)

  reply.send(user);
});




fastify.get("/users", function (request, reply) {


  if(users.length === 0) generateRandomUsers(30);


  reply.view("/src/pages/users.hbs", {
    users
  });

});




fastify.post("/hs", function (request, reply) {
  console.log(request.body);

  data.push(request.body);

  reply.send(request.body);
});



// Run the server and report out to the logs
fastify.listen(process.env.PORT || 8080, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
