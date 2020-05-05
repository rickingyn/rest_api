'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models');

// require routes
const userRoute = require('./routes/users');
const courseRoute = require('./routes/courses');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// middleware to recognize the incoming Request Object as JSON Object
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// Use routes
app.use('/api/users', userRoute);
app.use('/api/courses', courseRoute);


// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Test connectiion to the database
( async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');

    // Sync the models
    console.log('Synchronizing the models with the database...');
    await sequelize.sync(); // force the database to be dropped and re-created everytime    
  } catch(error) {
    console.error("Connection to the database failed: ", error);
  }
}) ();

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
