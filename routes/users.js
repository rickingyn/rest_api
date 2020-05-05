const express = require('express');
const router = express();
// import bcryptjs module  to hash passwords
const bcryptjs = require('bcryptjs');
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

// users GET route: return all users
router.get('/', asyncHandler( async( req, res ) => {
    const users = await User.findAll();
    res.json({ users });
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
        user = await User.create(newUser);

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