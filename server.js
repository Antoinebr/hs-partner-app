require('dotenv').config({
    path: 'variables.env'
});

const path = require("path");
const siretCtrl = require('./controllers/siretCtrl');
const usersCtrl = require('./controllers/usersCtrl.js');
const routesConfig = require('./routesConfig.js');
const hubSpotAPI = require('./apis/hubSpot')
const fs = require('fs');

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



/**
 * 
 * Route config
 * 
 */
fastify.addHook('preHandler', routesConfig.checkIfAuthenticated);



/**
 * 
 * handlebars
 * 
 */
const handlebars = require("handlebars");
handlebars.registerPartial('menu', fs.readFileSync(path.join(__dirname, '/src/pages/partials/menu.hbs'), 'utf8'));
handlebars.registerPartial('footer', fs.readFileSync(path.join(__dirname, '/src/pages/partials/footer.hbs'), 'utf8'));
// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
    engine: {
        handlebars
    }
});

// Load and parse SEO data
const seo = require("./src/seo.json");



fastify.get("/", function(request, reply) {

    reply.view("/src/pages/home.hbs", {
        data: [],
        seo
    });
});



fastify.get("/customer-service", function(request, reply) {
    reply.view("/src/pages/customer-service.hbs", {
        data: [],
    });
});


fastify.get("/contact", function(request, reply) {
    reply.view("/src/pages/contact.hbs", {
        data: [],
    });
});




fastify.get("/about", function(request, reply) {
    reply.view("/src/pages/about.hbs", {
        data: [],
    });
});




/**
 * 
 *  Login 
 * 
 */
fastify.get("/login", function(request, reply) {
    reply.view("/src/pages/login.hbs", {
        data: [],
    });
});


fastify.post("/login", async function(request, reply) {

    const user = {
        email: request.body.email,
    };

    let JWT = null

    if (request.body.password && request.body.password !== "") {
        JWT = (request.body.password === process.env.adminPassword) ? process.env.JWT : false;
    }
    const authResult = await hubSpotAPI.authVisitor(user.email);

    console.log(authResult);

    reply.send({ token: authResult, JWT });

});




fastify.get("/editUser/:email", async (request, reply) => {

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

    const { email } = request.params;

    const user = await usersCtrl.getUser(email);

    reply.send(user);
});


fastify.delete("/api/user/:email", async (request, reply) => {

    const { email } = request.params;

    const user = await usersCtrl.removeUser(email);

    reply.send(user);
});





fastify.get("/api/user/", async (request, reply) => {

    if (request.query.email === undefined) throw new Error(`Email needs to be set, we recieved  ${typeof request.query.email}`)

    try {
        const user = await usersCtrl.getUser(request.query.email);

        reply.send(user);

    } catch (error) {

        reply.status(404).send({ error: true, errorMessage : error.toString() });
    }

});



fastify.post("/api/user", async (request, reply) => {

    if (request.body === undefined) throw new Error(`a body needs to be set, we recieved  ${typeof request.body}`)

    const user = await usersCtrl.addUser(request.body);

    reply.send(user);

});



fastify.get("/addUser/", async (request, reply) => {

    // params is an object we'll pass to our handlebars template
    let params = {
        seo: seo
    };

    reply.view("/src/pages/add-user.hbs", {
        seo
    });

});



fastify.get("/users", async (request, reply) => {

    const users = await usersCtrl.getAllusers();

    reply.view("/src/pages/users.hbs", {
        users
    });

});



fastify.patch("/api/user", async function(request, reply) {

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
                "tokens_available": request.body.tokensAvailable,
                "carmanufacturer": request.body.carManufacturer,
                "car_model": request.body.carModel
            }
        });

        users.updatedInHubSpot = true;

    }


    return users;

});




fastify.get("/api/siret", (request, reply) => reply.send(siretCtrl.createSirenData(request.query.domainName)));



/**
 * 
 *  Tickets 
 * 
 */

fastify.get('/mytickets/', async (request, reply) => {

    const tickets = await hubSpotAPI.displayAllTickets();

    reply.view("/src/pages/tickets.hbs", {
        tickets
    });

});


fastify.get('/mytickets/:id', async (request, reply) => {

    const {
        id
    } = request.params;


    const tickets = await hubSpotAPI.getTicket(id);

    reply.view("/src/pages/ticket.hbs", {
        tickets
    });

});




/**
 * 
 *  conversation 
 * 
 */
fastify.get('/conversations/', async (request, reply) => {

    const convs = await hubSpotAPI.getAllConversations();

    return convs;

});




/**
 * 
 *  parcels 
 * 
 */

fastify.get('/my-parcel/', async (request, reply) => {

    reply.view("/src/pages/my-parcel.hbs");

});

fastify.get("/api/parcelNumber/", async (request, reply) => {

    if (request.query.parcelNumber === undefined) throw new Error(`parcelNumber needs to be set, we recieved  ${typeof request.query.parcelNumber}`)

    const originalDate = new Date();

    // Add two days to the original date
    const newDate = new Date(originalDate);
    newDate.setDate(originalDate.getDate() + 2);

    // Format the new date as YYYY-MM-DD
    const formattedDate = newDate.toISOString().split('T')[0];

    const parcelNumber = {
        status: 'sent',
        eta: formattedDate
    }

    reply.send(parcelNumber);

});




let remainingFailures = 10;
fastify.get("/api/status/", async (request, reply) => {



    if (request.query.reset !== undefined) remainingFailures = parseInt(request.query.reset);

    if (remainingFailures > 0) {
        reply.status('403').send({
            status: "error",
            remainingFailures
        });
        remainingFailures--;
    }

    if (remainingFailures === 0) {
        reply.status('200').send({
            status: "success",
            remainingFailures
        });
    }

    reply.send(ooo);

});



// Run the server and report out to the logs
fastify.listen(process.env.PORT || 8080, "0.0.0.0", function(err, address) {


    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }


    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);


});