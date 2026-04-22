/*
 *  This file handles all module dependencies
 *  and application setup for the Express.js server.
 */


var   express   = require ( 'express' )
    , routes    = require ( './routes' ) // Application routes
    , http      = require ( 'http' )
    , path      = require ( 'path' )
; /* End of module imports */


var app =   express ( ) ; // Initialize the main Express application instance


// Application Configuration Settings Below

app.configure ( function ( ) {

    app.set ( 'port' , process.env.PORT || 3000 ) ; // Set the listening port, default to 3000

    app.set ( 'views' , __dirname + '/views' ) ; // Configure view directory

    app.set ( 'view engine' , 'jade' ) ; // Set the view templating engine

    app.use ( express.favicon ( ) ) ; // Enable favicon serving

    app.use ( express.logger ( 'dev' ) ) ; // Log requests in 'dev' format

    app.use ( express.bodyParser ( ) ) ; // Parse request body

    app.use ( express.methodOverride ( ) ) ; // Enable HTTP method override

    app.use ( express.cookieParser ( ) ) ; // Parse cookies

    app.use ( express.session ( { secret : 'your secret here' } ) ) ; // Session management with a secret key

    app.use ( app.router ) ; // Use Express router for routing requests

    app.use ( express.static ( path.join ( __dirname , 'public' ) ) ) ; // Serve static files from 'public' directory

} ) ; // End of main configuration block


/*
 *  Development Environment Specific Configuration
 */
app.configure ( 'development' , function ( ) {
    app.use ( express.errorHandler ( { dumpExceptions : true , showStack : true } ) ) ; // Detailed error handling for dev
} ) ;


/*
 *  Production Environment Specific Configuration
 */
app.configure ( 'production' , function ( ) {
    app.use ( express.errorHandler ( ) ) ; // Standard error handling for production
} ) ;


// Define Application Routes

app.get ( '/' , routes.index ) ; // Root route
app.get ( '/home' , routes.home ) ; // Home route
app.get ( '/about' , routes.about ) ; // About page route


/*
 *  Start the HTTP Server
 */
http.createServer ( app ) .listen ( app.get ( 'port' ) , function ( ) {
  console.log ( "Express server listening on port " + app.get ( 'port' ) ) ; // Log server start message to console
} ) ; // End of server creation and listen block