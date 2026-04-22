/*
 *  This module manages primary web route handlers.
 *  It provides functions for displaying various web pages.
 */

// Function to handle the initial entry point or main display.
module.exports.mainPage = function ( requestObject, responseObject ) {
  responseObject.render ( 'homeView' ,  {  pageHeading  :  "DataStore Concepts"  } ) ;
};

// Function for user authentication form display.
module.exports.authenticateUser = function (requestObject, responseObject)
{
  responseObject.render( 'authForm' ) ;
};

// Function for rendering dynamic view components.
module.exports.renderTemplates = function ( requestObject , responseObject )
{
  var templateIdentifier = requestObject.params.componentName ;
  responseObject.render ( 'views/' + templateIdentifier ) ;
} ;