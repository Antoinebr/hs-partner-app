require('dotenv').config({
  path: 'variables.env'
});

const path = require("path");
const siretCtrl = require('./controllers/siretCtrl');
const usersCtrl = require('./controllers/usersCtrl.js');
const hubSpotAPI = require('./apis/hubSpot')


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


fastify.get("/", function (request, reply) {

  // params is an object we'll pass to our handlebars template
  let params = {
    seo: seo
  };


  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/index.hbs", {
    data: [],
    seo
  });
});



fastify.get("/editUser/:email", async (request, reply) => {

  // params is an object we'll pass to our handlebars template
  let params = {
    seo: seo
  };

  const {
    email
  } = request.params;

  const user = await usersCtrl.getUser(email);

  reply.view("/src/pages/form.hbs", {
    user,
    seo
  });

});



fastify.get("/api/users", async (request, reply) => {
  const users = await usersCtrl.getAllusers();
  reply.send(users);
});


fastify.get("/api/user/:email", async (request, reply) => {

  const {
    email
  } = request.params;

  const user = await usersCtrl.getUser(email);

  reply.send(user);
});




fastify.get("/api/user/", async (request, reply) => {

  if (request.query.email === undefined) throw new Error(`Email needs to be set, we recieved  ${typeof request.query.email}`)

  const user = await usersCtrl.getUser(request.query.email);

  reply.send(user);

});



fastify.get("/users", async (request, reply) => {

  const users = await usersCtrl.getAllusers();

  reply.view("/src/pages/users.hbs", {
    users
  });

});



fastify.patch("/api/user", async function (request, reply) {

  const user = {
    tokensAvailable: request.body.tokensAvailable,
    carManufacturer: request.body.carManufacturer,
    carModel: request.body.carModel,
    name: request.body.name,
    lastname: request.body.lastname,
    email: request.body.email
  }

  const users = await usersCtrl.updateUser(user);

  // if the request doesn't come from HubSpot let's update the record by calling the HubSpot API 
  if (request.body.fromHs == false && request.body.tokensAvailable !== undefined) {

  
    const searchResult = await hubSpotAPI.getContactIdFromEmail(user.email);

    const firstRecordFound = searchResult.results[0];

    const updatedResults = await hubSpotAPI.updateContactByContactId(firstRecordFound.id, {
      "properties": {
        "tokens_available": request.body.tokensAvailable
      }
    });

    users.updatedInHubSpot = true;

  }


  return users;

});




fastify.get("/api/siret", (request, reply) => reply.send(siretCtrl.createSirenData(request.query.domainName)));



// Run the server and report out to the logs
fastify.listen(process.env.PORT || 8080, "0.0.0.0", function (err, address) {



  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }


  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);


});