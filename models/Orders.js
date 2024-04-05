const { PromisedDatabase } = require("../apis/promised-sqlite3"); // import the class
const db = new PromisedDatabase(); // create a instance of PromisedDatabase
db.open("./db/db.sqlite");




exports.insertOrder = async (order) => {

    if (typeof order !== "object") throw new console.error(`Order has to be an object`);

    const insertion = await db.run(/*SQL*/
        `
        INSERT INTO Orders (userId, orderName, status, amount)
        
        VALUES (?, ?, ?, ?) 
        `,
        order.userId, order.orderName, order.status, order.amount

    );

    return insertion;

}




exports.getOrders = async () => {

    const result = await db.all("SELECT * FROM Orders");

    return result;
}


exports.getOrder = async (id) => {

    const result = await db.get("SELECT * FROM Orders WHERE id = $id", {
        $id: id
    });

    return result;
}


exports.getOrderByUserId = async (userId) => {

    const result = await db.all("SELECT * FROM Orders WHERE userId = $userId", {
        $userId: userId
    });

    return result;
}


exports.getOrdersByUserEmail = async (email) => {

    const result = await db.all(/*SQL*/`

        SELECT *
        FROM  Users
        INNER JOIN Orders
        ON  Users.ID =  Orders.userId
        WHERE Users.email = $email

    `, {
        $email: email
    });

    return result;
}





exports.destroyOrder = async (id) => {

    const result = await db.get(/*SQL*/`

        DELETE FROM Orders WHERE id = $id
        
    `, {
        $id: id
    });

    return result;
}




exports.updateOrder = async (order) => {

    const update = await db.run(/*SQL*/`
    
        UPDATE Orders 

        SET 
        
            userId = $userId, 
            orderName = $orderName,
            status = $status,
            amount = $amount

        WHERE id = $id
        
        `, {
        $userId: order.userId,
        $orderName: order.orderName,
        $status: order.status,
        $amount: order.amount,
        $id: order.id
    });


    return update;
}


exports.updateOrderHsId = async (orderId, hsObjectId) => {

    const update = await db.run(/*SQL*/`
    
        UPDATE Orders 

        SET 
        
        hs_object_id =  $hs_object_id

        WHERE id = $id
        
        `, {
        $hs_object_id: hsObjectId,
        $id: orderId
    });


    return update;
}