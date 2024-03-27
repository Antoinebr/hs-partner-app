require('dotenv').config({
    path: 'variables.env'
});

const Orders = require('../models/Orders');

const Users = require('../models/Users');

const hubSpotAPI = require('../apis/hubSpot.js');


/**
 * Update an order list
 * @param {Object} order - The order object to update
 * @returns {Promise<{ changes }>} A promise that resolves to an object containing the number of changes made to the order
 */
exports.updateOrder = async (order) => {

    if (!order) throw new Error("You have to pass an order");

    if (!order.id) throw new Error("The order.id is missing on the object passed as a parameter");

    const existingOrder = await this.getOrder(order.id);

    if (!existingOrder) throw new Error("The order doesn't exist in the list");

    if (typeof order.userId !== "number") throw new Error("You can't set userId with a type which is not a number ");

    if (!order.orderName) throw new Error("You can't set orderName as an empty value ");

    if (!order.status) throw new Error("You can't set status as an empty value ");

    if (!order.amount) throw new Error("You can't set amount as an empty value ");


    const { changes } = await Orders.updateOrder(order);

    return { changes };

}



/**
 * Get all orders in the list
 * @returns {Promise<Array>} A promise that resolves to an array of order objects
 */
exports.getAllOrders = async () => {

    const orders = await Orders.getOrders();

    return orders;
}


/**
 * Remove an order from the list
 * @param {String} id - The ID of the order to remove
 * @returns {Promise<Object>} A promise that resolves to the destroyed order object
 */
exports.removeOrder = async (id) => {

    if (!id || id === "") throw new Error("You can't remove an order without providing an order id  ");

    const order = await Orders.destroyOrder(id)

    return order;
}



exports.getOrder = async (id) => {

    if (!id) throw new Error(`We exepected an id, we go ${id}`);

    const order = await Orders.getOrder(id);

    if (!order) throw new Error(`No order found for ${id}`);

    return order;
}


/**
 * Get an order from the list by ID
 * @param {String} id - The ID of the order to retrieve
 * @returns {Promise<Object>} A promise that resolves to the retrieved order object
 */
exports.getOrdersByUserId = async (id) => {

    if (!id) throw new Error(`We exepected an id in ordersCtrl exports.getOrdersByUserId(id), we go ${id}`);

    let orders = await Orders.getOrderByUserId(id);

    if (!orders) {
        console.log(`No order found for userId : ${id}`);
        return [];
    }

    orders = Array.isArray(orders) ? orders : [orders];

    return orders
}


/**
 * Get all orders by user email
 * @param {String} email - The user's email address
 * @returns {Promise<Array>} A promise that resolves to an array of order objects
 */
exports.getOrdersByUserEmail = async (email) => {



    if (!email) throw new Error(`We exepected an email in ordersCtrl exports.getOrdersByUserEmail(emil), we go ${email}`);

    let orders = await Orders.getOrdersByUserEmail(email);

    

    if (!orders) {
        console.log(`No order found for userId : ${id}`);
        return [];
    }

    orders = Array.isArray(orders) ? orders : [orders];

    console.log(orders)
    return orders
}


/**
 * Add a new order 
 * @param {Object} order - The order object to add
 * @returns {Promise<Object>} A promise that resolves to the added order object
 */
exports.addOrder = async (order) => {

    if (!order) throw new Error(`There's no user`);

    const requiredKeys = ['userId', 'orderName', 'status', 'amount'];

    for (const key of requiredKeys) {
        if (!order[key] || order[key] === null) throw new Error(`Key '${key}' is missing or null in the order object.`);
    }

    const orderAdded = await Orders.insertOrder(order);

    try {

        const user = await Users.getUserById(order.userId);

        const hubspotContact = await hubSpotAPI.getContactIdFromEmail(user.email);

        if (hubspotContact.total !== 1) throw new Error('No contact found in  HubSpot ');

        const { results } = hubspotContact;

        const deal = await hubSpotAPI.adddeal({
            "properties": {
                "amount": order.amount,
                "dealname": order.orderName,
                "pipeline": "default"
            }
        }).catch(console.log)

        await hubSpotAPI.associateDealWithContact(deal.data.id, parseInt(results[0].id));

        await Orders.updateOrderHsId(orderAdded.lastID,deal.data.id);

    } catch (error) {
        console.log(`Error when syncing the order with HubSpot`)
        console.log(error);
    }

    return orderAdded;

}