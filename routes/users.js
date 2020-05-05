const express = require('express');
const router = express();
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

router.get('/', asyncHandler( async( req, res ) => {
    const users = await User.findAll();
    res.json({ users });
} ) );

router.post('/', asyncHandler( async( req, res ) => {
    // pass new user from request body to variable
    const newUser = req.body;
    let user;
    
    try {
        // create new user in database
        user = await User.create(newUser);

        // Send 201 status and end the response
        res.status(201).end();
    } catch(error) {
        // check if validation error
        if(error.name === "SequelizeValidationError") {
            // build user that was not successfully created and pass to json
            user = await User.build(newUser);

            res.json({ error: error.errors, user });
        } else {
            // throw error to express's global error handling function
            throw error;
        }
    }
} ) );

module.exports = router;