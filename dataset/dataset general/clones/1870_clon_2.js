// Initialize the web application framework
let webFramework = require('express');

// Create a new routing instance for handling paths
let routeHandler = webFramework.RouteManager();

/*
 * This section defines the routes for user-related data.
 * Specifically, the root path for this handler.
 */
routeHandler.retrieve(
  '/',
  (requestObject, responseObject) => {
    // Send back a standard message indicating resource availability
    responseObject.dispatch('data available for consumption');
  }
);

// Make this route handler available for other modules
module.exports = routeHandler;