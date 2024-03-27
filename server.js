require('dotenv').config({
    path: 'variables.env'
});

const path = require("path");
const siretCtrl = require('./controllers/siretCtrl');
const usersCtrl = require('./controllers/usersCtrl.js');
const ordersCtrl = require('./controllers/ordersCtrl.js');
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
const seoCtrl = require("./src/seo");


fastify.get("/", function(request, reply) {

    reply.view("/src/pages/home.hbs", {
        data: [],
        seo : seoCtrl.getUrlData('/')
    });
});



fastify.get("/customer-service", function(request, reply) {
    reply.view("/src/pages/customer-service.hbs", {
        data: [],
        seo : seoCtrl.getUrlData('/customer-service')
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
        seo : seoCtrl.getUrlData('/about')
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
        JWT = (request.body.password === process.env.adminPassword || request.body.password === process.env.teamPassword) ? process.env.JWT : false;
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

    const {ID} = user;

    const orders = await ordersCtrl.getOrdersByUserId(ID);

    orders.stringify = JSON.stringify(orders);

    
    reply.view("/src/pages/user.hbs", {
        user,
        orders,
        seo : seoCtrl.getUrlData('/users/')
    });

});


/**
 * API USERS
 */
fastify.post("/api/user", async (request, reply) => {

    if (request.body === undefined) throw new Error(`a body needs to be set, we recieved  ${typeof request.body}`)

    const user = await usersCtrl.addUser(request.body);

    reply.send(user);

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

fastify.get("/addUser/", async (request, reply) => {

    reply.view("/src/pages/add-user.hbs", {
        seo : seoCtrl.getUrlData('/users')
    });

});


fastify.get("/users", async (request, reply) => {

    const users = await usersCtrl.getAllusers();

    reply.view("/src/pages/users.hbs", {
        users
    });

});





/**
 * 
 * API Orders
 * 
 */
fastify.post("/api/order", async (request, reply) => {

    if (request.body === undefined) throw new Error(`a body needs to be set, we recieved  ${typeof request.body}`)

    const order = await ordersCtrl.addOrder(request.body);

    reply.send(order);

});


fastify.get("/api/orders", async (request, reply) => {
    const orders = await ordersCtrl.getAllOrders();
    reply.send(orders);
});


fastify.get("/api/order/byEmail/:email", async (request, reply) => {

    const { email } = request.params;

    const order = await ordersCtrl.getOrdersByUserEmail(email);

    reply.send(order);
});


fastify.get("/api/order/:id", async (request, reply) => {

    const { id } = request.params;

    const order = await ordersCtrl.getOrder(id);

    reply.send(order);
});


fastify.patch("/api/order", async function(request, reply) {

    const order = {
        id : request.body.id,
        userId: request.body.userId,
        orderName: request.body.orderName,
        status: request.body.status,
        amount: request.body.amount
    }

    const orders = await ordersCtrl.updateOrder(order);

    return orders;

});


fastify.delete("/api/order/:id", async (request, reply) => {

    const { id } = request.params;

    const order = await ordersCtrl.removeOrder(id);

    reply.send(order);
});


fastify.get("/api/order/", async (request, reply) => {

    if (request.query.order === undefined) throw new Error(`Email needs to be set, we recieved  ${typeof request.query.order}`)

    try {
        const order = await ordersCtrl.getOrder(request.query.id);

        reply.send(order);

    } catch (error) {

        reply.status(404).send({ error: true, errorMessage : error.toString() });
    }
});


fastify.get("/api/siret", (request, reply) => reply.send(siretCtrl.createSirenData(request.query.domainName)));



/**
 * 
 *  Tickets 
 * 
 */

fastify.get('/ticketFromUser/:email', async (request, reply) => {

    const {
        email
    } = request.params;



    reply.send(email);

    if(!email) throw new Error('Email is needed');

    const ticket = await hubSpotAPI.getTicketsFromUserEmail(email);

    reply.send(ticket);


});

fastify.get('/mytickets/', async (request, reply) => {

    const tickets = await hubSpotAPI.displayAllTickets();


    reply.view("/src/pages/tickets.hbs", {
        tickets,
        seo : seoCtrl.getUrlData('/mytickets/')
    });

});


fastify.get('/mytickets/:id', async (request, reply) => {

    const {
        id
    } = request.params;


    const tickets = await hubSpotAPI.getTicket(id);


    const emailsInTicket = await hubSpotAPI.getAllEmailsFromTicketId(id);

    reply.view("/src/pages/ticket.hbs", {
        tickets,
        emailsInTicket,
        seo : seoCtrl.getUrlData('/mytickets/')
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
 *  Devices 
 * 
 */

fastify.get('/api/devices/:id', async (request, reply) => {

    const {
        id
    } = request.params;

    const deviceInfo = {
        "35730": {
            "brand": "Google",
            "model": "Pixel 3XL",
            "image" : "https://static.fnac-static.com/multimedia/Images/FR/MDM/2c/bc/52/22199340/1520-1/tsp20231110173112/Smartphone-Google-Pixel-8-Pro-6-7-5G-Double-SIM-128-Go-Noir.jpg",
            "releaseYear": 2018,
            "display": {
                "type": "OLED",
                "size": 6.3,
                "resolution": "1440 x 2960 pixels"
            },
            "processor": {
                "name": "Qualcomm Snapdragon 845",
                "cores": 8,
                "clockSpeed": "2.5 GHz"
            },
            "ram": "4 GB",
            "storage": {
                "internal": "64/128 GB",
                "expandable": false
            },
            "camera": {
                "main": {
                    "resolution": "12.2 MP",
                    "aperture": "f/1.8",
                    "videoRecording": "4K at 30/60fps"
                },
                "front": {
                    "resolution": "8 MP + 8 MP (wide)",
                    "aperture": "f/1.8 + f/2.2"
                }
            },
            "battery": {
                "capacity": "3430 mAh",
                "type": "Non-removable Li-Ion"
            },
            "operatingSystem": "Android 9.0 (Pie), upgradable to Android 11",
            "dimensions": {
                "height": 158,
                "width": 76.7,
                "thickness": 7.9
            },
            "weight": 184,
            "features": [
                "Fingerprint sensor (rear-mounted)",
                "IP68 dust/water resistant",
                "Wireless charging",
                "Active Edge"
            ],
            "colors": ["Just Black", "Clearly White", "Not Pink"]
        },

        "35000": {
            "brand": "Apple",
            "model": "iPhone 12",
            "releaseYear": 2020,
            "image" : "https://static.fnac-static.com/multimedia/Images/FR/MDM/c2/b2/bd/12432066/1540-1/tsp20231116133346/Apple-iPhone-12-6-1-64-Go-Double-SIM-5G-Noir.jpg",
            "display": {
                "type": "Super Retina XDR OLED",
                "size": 6.1,
                "resolution": "1170 x 2532 pixels"
            },
            "processor": {
                "name": "Apple A14 Bionic",
                "cores": 6,
                "clockSpeed": "2.99 GHz"
            },
            "ram": "4 GB",
            "storage": {
                "internal": "64/128/256 GB",
                "expandable": false
            },
            "camera": {
                "main": {
                    "resolution": "12 MP (wide) + 12 MP (ultrawide)",
                    "aperture": "f/1.6 + f/2.4",
                    "nightMode": true,
                    "videoRecording": "4K at 24/30/60fps"
                },
                "front": {
                    "resolution": "12 MP",
                    "aperture": "f/2.2",
                    "nightMode": true
                }
            },
            "battery": {
                "capacity": "2815 mAh",
                "type": "Non-removable Li-Ion"
            },
            "operatingSystem": "iOS 14, upgradable to the latest iOS version",
            "dimensions": {
                "height": 146.7,
                "width": 71.5,
                "thickness": 7.4
            },
            "weight": 164,
            "features": [
                "Face ID",
                "MagSafe technology",
                "5G connectivity",
                "Water and dust resistance (IP68)"
            ],
            "colors": ["Black", "White", "Green", "Blue", "Red"]
        },
        "35400": {
            "brand": "Apple",
            "model": "iPhone 12",
            "releaseYear": 2020,
            "image" : "https://static.fnac-static.com/multimedia/Images/FR/MDM/c2/b2/bd/12432066/1540-1/tsp20231116133346/Apple-iPhone-12-6-1-64-Go-Double-SIM-5G-Noir.jpg",
            "display": {
                "type": "Super Retina XDR OLED",
                "size": 6.1,
                "resolution": "1170 x 2532 pixels"
            },
            "processor": {
                "name": "Apple A14 Bionic",
                "cores": 6,
                "clockSpeed": "2.99 GHz"
            },
            "ram": "4 GB",
            "storage": {
                "internal": "64/128/256 GB",
                "expandable": false
            },
            "camera": {
                "main": {
                    "resolution": "12 MP (wide) + 12 MP (ultrawide)",
                    "aperture": "f/1.6 + f/2.4",
                    "nightMode": true,
                    "videoRecording": "4K at 24/30/60fps"
                },
                "front": {
                    "resolution": "12 MP",
                    "aperture": "f/2.2",
                    "nightMode": true
                }
            },
            "battery": {
                "capacity": "2815 mAh",
                "type": "Non-removable Li-Ion"
            },
            "operatingSystem": "iOS 14, upgradable to the latest iOS version",
            "dimensions": {
                "height": 146.7,
                "width": 71.5,
                "thickness": 7.4
            },
            "weight": 164,
            "features": [
                "Face ID",
                "MagSafe technology",
                "5G connectivity",
                "Water and dust resistance (IP68)"
            ],
            "colors": ["Black", "White", "Green", "Blue", "Red"]
        }

    };

    reply.send([deviceInfo[id]])

});

fastify.get('/api/devices/replacement', async (request, reply) => {

    reply.send([{
        label: `iPhone 13 Max`,
        value: `1200€`,
        initialIsChecked: true,
        readonly: false,
        description: `2 - 3 days`,
      },
      {
        label: `Google Pixel 8 pro`,
        value: `800€`,
        initialIsChecked: false,
        readonly: false,
        description: `1 day`,
      },
      {
        label: `Nokia 3310`,
        value: `20€`,
        initialIsChecked: false,
        readonly: false,
        description: `3 days`,
      }])

});











/**
 * 
 *  parcels 
 * 
 */
fastify.get('/my-parcel/', async (request, reply) => {

    reply.view("/src/pages/my-parcel.hbs",{
        seo : seoCtrl.getUrlData('/my-parcel/')
    });

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



fastify.get("/hello", async (request, reply) => {
;

    const parcelNumber = {
        hello: 'my friend :)'
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