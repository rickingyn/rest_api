const express = require('express');
const router = express();
const bcryptjs = require('bcryptjs'); // import bcryptjs module  to hash passwords
const { check, validationResult } = require('express-validator'); // require methods from express-validator module
// require custom middlewares
const authenticateUser = require('../middleware/Authentication.js');
const asyncHandler = require('../middleware/AsynchHandler.js');

const { User } = require('../models'); // require User Model

// users GET route: return all users
router.get('/', authenticateUser,asyncHandler( async( req, res ) => {
    
    // find user with current User from request object's currentUser property
    const user = await User.findOne({
        attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
        where: {
            emailAddress: req.currentUser.emailAddress
        }
    });

    res.json({ user });
} ));

// validation for user
const userValidation = [
    // validate that firstName is not empty or null
    check('firstName')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "firstName"'),
    // validate that lastName is not empty or null
    check('lastName')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "lastName"'),
        // validate that emailAddress is not empty or null
    check('emailAddress')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "emailAddress"')
        // validate that emailAddress is a valid email address format
        .isEmail()
        .withMessage('Please enter a valid Email Address')
        // validate that emailAddress is unique
        .custom( async(value) => {
            const emailExist = await User.findOne({
                where: {
                    emailAddress: value
                }
            });
           
            if(emailExist) {
                throw new Error('Email already exists. Please enter a unique Email');
            }
        })
        .withMessage('Please enter a unique Email Address'),
        // validate that password is not empty or null
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
        res.location('/');

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