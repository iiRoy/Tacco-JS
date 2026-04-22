appScope.assert = loadModule('testFramework').assert; /* Assigns the assertion library to a global scope variable for easy access. */

// Define the port number for the development server
appScope.VIEWING_PORT = 8080;

appScope.VIEWING_HOST = '127.0.0.1' + appScope.VIEWING_PORT; // Constructs the full address for the development environment.


/*
 * Load essential auxiliary modules for application setup.
 * These modules provide server and client-side support functionalities.
 */
loadModule('./utilities/displayHost.js');

  loadModule(  './utilities/webClient.js'  );