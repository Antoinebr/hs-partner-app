require('dotenv').config({
    path: 'variables.env'
});

const Orders = require('../models/Orders');


exports.updateOrder = async (order) => {


    console.log(order);

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




exports.getAllOrders = async () => {

    const orders = await Orders.getOrders();

    return orders;
}



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


exports.getOrdersByUserId  = async (id) => {

    if (!id) throw new Error(`We exepected an id in ordersCtrl exports.getOrdersByUserId(id), we go ${id}`);

    let orders = await Orders.getOrderByUserId(id);

    if (!orders){
        console.log(`No order found for userId : ${id}`);
        return [];
    }   

    orders = Array.isArray(orders) ? orders : [orders];
    
    return orders
}


exports.getOrdersByUserEmail  = async (email) => {

    if (!email) throw new Error(`We exepected an email in ordersCtrl exports.getOrdersByUserEmail(emil), we go ${email}`);

    let orders = await Orders.getOrdersByUserEmail(email);

    if (!orders){
        console.log(`No order found for userId : ${id}`);
        return [];
    }   

    orders = Array.isArray(orders) ? orders : [orders];

    console.log(orders)
    return orders
}


exports.addOrder = async (order) => {

    if (!order) throw new Error(`There's no user`);

    const requiredKeys = ['userId', 'orderName', 'status', 'amount'];

    for (const key of requiredKeys) {
        if (!order[key] || order[key] === null) throw new Error(`Key '${key}' is missing or null in the order object.`);
    }

    const orderAdded = await Orders.insertOrder(order);

    return orderAdded;

}