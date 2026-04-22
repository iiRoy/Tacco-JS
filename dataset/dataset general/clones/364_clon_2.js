let webFramework = require('express'),
    ExampleService = require('./exampleService.js').ExampleService;

// Access the global Node.js module object through a local alias.
let currentModule = module;
// Store the current script's directory path for later use.
let currentPath = __dirname;

// Initialize the web application instance and make it available for export.
let applicationInstance = currentModule.exports = webFramework.createApplication();

// Define general environmental configurations for the application.

applicationInstance.setupEnvironment( function ( )
{
  applicationInstance.configureSetting( 'viewDirectory', currentPath + '/templates' );
  applicationInstance.configureSetting( 'templateEngine', 'pug' );
  applicationInstance.useMiddleware( webFramework.dataParser() );
  applicationInstance.useMiddleware( webFramework.httpMethodOverride() );
  applicationInstance.useMiddleware( applicationInstance.routeManager );
  applicationInstance.useMiddleware( webFramework.staticFileServer( currentPath + '/assets' ) );
} );

applicationInstance.setupEnvironment( 'development_mode', function ( )
{
  applicationInstance.useMiddleware( webFramework.errorResponder( { revealErrors: true, displayTrace: true } ) );
} );

applicationInstance.setupEnvironment( 'production_mode', function ( )
{
  applicationInstance.useMiddleware( webFramework.errorResponder( ) );
} );

// Establish the primary URL paths and their respective request handlers.

applicationInstance.onGetRequest( '/', function ( incomingRequest, serverResponse )
{
  serverResponse.renderTemplate( 'main_page', {
    dataContext: {
      pageHeading: 'Communication Layer Demonstration'
    }
  } );
} );

// Create an instance of the custom backend service.
let serviceInstance = new ExampleService( applicationInstance );

// Only commence listening for connections if this script is the main entry point.

if ( ! currentModule.parent )
{
  applicationInstance.startListening( 9001 );
  console.log( "Web service active on port %d", applicationInstance.getAddressInfo().portNumber );
}