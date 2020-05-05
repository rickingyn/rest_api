const express = require('express');
const router = express();
const { check, validationResult } = require('express-validator');// require check() and validationResult() methods from express-validator module
// require custom middlewares
const authenticateUser = require('../middleware/Authentication.js');
const asyncHandler = require('../middleware/AsynchHandler.js');

const { Course, User } = require('../models');// require Course and User models


// courses GET route: returns a list of courses
router.get('/', asyncHandler( async( req, res ) => {
    // find all courses and returns json
        // filter out createdAt and updatedAt fields
        // use Sequelize's include query option to return associated user
    const courses = await Course.findAll({
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
        include: [
            {
                model: User,
                as: 'user'
            }
        ]
    });
    res.json({ courses });
} ));

// course GET route: return a course
router.get('/:id', asyncHandler( async( req, res ) => {
    const courseId = req.params.id;

    // use Sequelize's include query option to return associated user
        // filter out createdAt and updatedAt fields
        // use Sequelize's include query option to return associated user
    const course = await Course.findByPk(courseId, {
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
        include: [
            {
                model: User,
                as: 'user'
            }
        ]
    });

    res.json({ course });
} ));


// validation for course
const courseValidation = [
    check('title')
        .exists({
            checkNull: true,
            checkFalsy: true
        })
        .withMessage('Please provide a value for "title"'),
        check('description')
            .exists({
                checkNull: true,
                checkFalsy: true
            })
            .withMessage('Please provide a value for "description"')
    ];

// course POST route: create a course
router.post('/', courseValidation, authenticateUser, asyncHandler( async( req, res) => {
    // attempt to get the validation result from the request object
    const errors = validationResult(req);

    // pass new user from request body to variable
    const newCourse = req.body;
    let course;
    
    try {
        // if there is a validation error, send 404 status and return error message
        if( !errors.isEmpty() ) {
            const errorMessages = errors.array().map( error => error.msg );
            return res.status(400).json({ errors: errorMessages });
        }
        // create course using Sequelize's create() method 
        course = await Course.create(newCourse);
        
        // set location header to URI of the course created
        res.location(`/${ course.id }`)

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

// course PUT route: update a course
router.put('/:id', authenticateUser, asyncHandler( async( req, res ) => {
    // try/catch block to catch Sequlize's validation error
    try {
        // find course with id in params
        const courseId = req.params.id;
        const updatedCourse = req.body;
        const course = await Course.findByPk(courseId);
        
        // update if course is found
        // send 204 status and end response
        if(course) {
            await course.update(updatedCourse);
            res.status(204).end();
        } else {
            // send 404 status and return 'Course not found' message
            res.status(404).json({ message: 'Course not found' });
        }
    } catch(error) {
        // send 400 status and return sequelize's validation error
        if(error.name === 'SequelizeValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            throw error;
        }
    }
} ));

// course DELETE route: delete a course
router.delete('/:id', authenticateUser, asyncHandler( async( req, res ) => {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    // update if course is found
    // send 204 status and end response
    if(course) {
        await course.destroy();
        res.status(204).end();
    } else {
        // send 404 status and return 'Course not found' message
        res.status(404).json({ message: 'Course not found' });
    }
} ));


module.exports = router;