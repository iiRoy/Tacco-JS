let httpServer = require('express');

let pathNavigator = httpServer.Router();

/*
 *  Establishes the primary route for the web application.
 *  This function processes requests directed to the base URL.
*/
pathNavigator.get(
  '/',
  function (
    clientRequest,

    serverResponse
  ) {
    serverResponse.redirect(
      '/html/test.html'
    );
  }
);

module.exports = pathNavigator;