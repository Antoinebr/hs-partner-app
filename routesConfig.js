/**
 * Check if the request is authenticated
 * @param {Object} req - The HTTP request object
 * @param {Object} reply - The response object
 * @param {Function} done - A callback function to call when the authentication check is complete
 */
exports.checkIfAuthenticated = (req, reply, done) => {
    
    const protectedRoutes = ['/api/user'];

    const httpMethodWhichRequireAuth = ['DELETE','PATCH'];

    if (!httpMethodWhichRequireAuth.includes(req.method)) return done();

    if (!protectedRoutes.includes(req.url)) return done();


    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === "Bearer") {

        // put the JWT in the req object
        req.authToken = (req.headers.authorization.split(' ')[1]) ? req.headers.authorization.split(' ')[1] : null;

    } else {
        console.log('Access to ',req.url, "Declined :", "Bearer is missing");
        return reply.status(401).send({ error: "Bearer is missing" })

    }

    if( req.authToken !== process.env.JWT){

        console.log('Access to ',req.url, "Declined :", "Wrong JWT access denied");
        return reply.status(403).send({ error: "Wrong JWT access denied" })
    } 
    
    console.log('Access to ',req.url, "Authorized : Correct JWT ");

    return done();
}