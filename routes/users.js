const express = require('express');
const router = express();
// import bcryptjs module  to hash passwords
const bcryptjs = require('bcryptjs');
// import authentication module
const auth = require('basic-auth');
// require methods from express-validator module
const { check, validationResult } = require('express-validator');
// require User Model
const { User } = require('../models');

// Handler function to wrap each route
function asyncHandler(cb) {
    return async( req, res, next ) => {
        try {
            await cb( req, res, next )
        } catch(error) {
            res.status(500).send(error);
        }
    }
}

// Authentication Middleware
async function authenticateUser( req, res, next ) {
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

// users GET route: return all users
router.get('/', authenticateUser,asyncHandler( async( req, res ) => {
    const user = req.currentUser;

    const users = await User.findAll();
    res.json({ 
        name: `${user.firstName} ${user.lastName}`,
        username: user.emailAddress
     });
} ));

// validation for user
const userValidation = [
    check('firstName')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "lastName"'),
    check('emailAddress')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "emailAddress"'),
    check('password')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "password"'),

];

// users POST route: create a user
router.post('/', userValidation, asyncHandler( async( req, res ) => {   
    // try/catch block to catch Sequlize's validation error
    try {
        // attempt to get the validation result from the request object
        const errors = validationResult(req);
    
        // pass new user from request body to variable
        const newUser = req.body;
        let user;
        // if there is a validation error, send 404 status and return error message
        if( !errors.isEmpty() ) {
            const errorMessages = errors.array().map( error => error.msg );
            return res.status(400).json({ errors: errorMessages });
        }

        // Hash password
        newUser.password = bcryptjs.hashSync(newUser.password);

        // create new user in database
        console.log('creating user...')
        user = await User.create(newUser);
        console.log('successfully added')

        // set location header to "/" (currently directory in the users route)
        res.location('../');

        // Send 201 status and end the response
        res.status(201).end();
    } catch(error) {
        // check if validation error
        if(error.name === "SequelizeValidationError") {
            // send status code 400 and return validation error
            res.status(400).json({ error: error.message });
        } else {
            // throw error to express's global error handling function
            throw error;
        }
    }
} ));

module.exports = router;