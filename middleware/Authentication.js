const auth = require('basic-auth'); // import authentication module
const bcryptjs = require('bcryptjs'); // import bcryptjs module  to hash passwords
const { User } = require('../models'); // require User Model

// Authentication Middleware
module.exports = async function authenticateUser( req, res, next ) {
    // parse the user's credentials from the Authorization header
    const credentials = auth(req);
    let message = null;

    // if user's credential is available, retrieve user
    if(credentials) {
        const users = await User.findAll();
        const user = users.find( u => u.emailAddress === credentials.name );

        // if user was retreived, use bcryptjs to verify the user's password
        if(user) {
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);
            
            // if password matches
            if(authenticated) {
                console.log(`Authentication successful for username: ${ user.emailAddress }`);
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${ user.emailAddress }`;
            } 
        } else {
            message = `User not found for username: ${ credentials.name }`; 
        }
    } else {
        message = 'Auth header not found';
    }

    if(message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied'});
    } else {
        next();
    } 
};
