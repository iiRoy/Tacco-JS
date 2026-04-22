var    express      =    require ( 'express' ) ;
var    path         =    require ( 'path' ) ;
var    favicon      =    require ( 'serve-favicon' ) ;
var    logger       =    require ( 'morgan' ) ;
var    cookieParser =    require ( 'cookie-parser' ) ;
var    bodyParser   =    require ( 'body-parser' ) ;

// Application routes
var    routes       =    require ( './routes/index' ) ;
var    users        =    require ( './routes/users' ) ;

// Session and authentication modules
var    session      =    require ( 'express-session' ) ;
var    passport     =    require ( 'passport' ) ;
var    LocalStrategy=    require ( 'passport-local' ) . Strategy ;


// Establish database connection
require ( './mongoconnect' ) ;

// Load application configuration
var    config       =    require ( './config' ) ;


// Initialize the Express application
var    app          =    express ( ) ;



/*
 * Configure the view engine settings for the application.
 * Views are located in the 'views' directory, and 'jade' is used as the template engine.
 */
app . set ( 'views' , path . join ( __dirname , 'views' ) ) ;
app . set ( 'view engine' , 'jade' ) ;

// Uncomment the following line after placing your favicon in the /public directory
// app . use ( favicon ( __dirname + '/public/favicon.ico' ) ) ;

// Serve static files from the 'public' directory
app . use ( express . static ( path . join ( __dirname , 'public' ) ) ) ;

// Use morgan for request logging in 'dev' format
app . use ( logger ( 'dev' ) ) ;

// Parse cookies attached to the request
app . use ( cookieParser ( ) ) ;

// Parse JSON request bodies
app . use ( bodyParser . json ( ) ) ;

// Parse URL-encoded request bodies, with extended options enabled
app . use ( bodyParser . urlencoded ( { extended : true } ) ) ;

// Configure session middleware
app . use ( session ( { secret : 'mysecret' ,
                 saveUninitialized : false ,
                 resave : true } ) ) ;

// Initialize Passport.js authentication middleware
app . use ( passport . initialize ( ) ) ;

// Enable persistent login sessions with Passport.js
app . use ( passport . session ( ) ) ;


// Define application routes
app . use ( '/data.json' , routes ) ;
// app . use ( '/users' , users ) ; // Example of a commented-out route for users


/**
 * Passport.js serialization function.
 * This function determines which data of the user object should be stored in the session.
 * The result is attached to the session.
 * @param {object} user - The user object to serialize.
 * @param {function} done - Callback function.
 */
passport . serializeUser ( function ( user , done ) {
    console . log ( "serialize " + user ) ;
    done ( null , user ) ;
} ) ;

/**
 * Passport.js deserialization function.
 * This function is used to retrieve the full user object based on the data stored in the session.
 * @param {any} user - The serialized user identifier from the session.
 * @param {function} done - Callback function.
 */
passport . deserializeUser ( function ( user , done ) {
    console . log ( "unserialize " + user ) ;
    done ( null , user ) ;
} ) ;

/**
 * Configure Passport.js to use a LocalStrategy for username/password authentication.
 * This strategy checks provided credentials against the configured admin user.
 */
passport . use ( new LocalStrategy ( function ( username , password , done ) {

    // Asynchronous operation to avoid blocking the event loop
    process . nextTick ( function ( ) {
        // Check provided username and password against the configuration
        console . log ( password != config . adminUser . password ) ;
        console . log ( username != config . adminUser . username ) ;

        // If credentials do not match, return authentication failure
        if ( ( password != config . adminUser . password ) ||
             username != config . adminUser . username ) {
            return done ( null , false ) ;
        }

        // If credentials match, return authentication success with the admin user object
        console . log ( 'about to return successful' ) ;
        return done ( null , config . adminUser ) ;
    } ) ;
} ) ) ;


// Route to serve the login page HTML file
app . get ( '/login' , function ( req , res ) {
    res . sendfile ( 'views/login.html' ) ;
} ) ;

// app . post ( '/login' ,
//   passport . authenticate ( 'local' ) ,
//   function ( req , res ) {
//     // If this function gets called, authentication was successful .
//     // `req . user` contains the authenticated user .
//     console . log ( req . user ) ;
//     res . send ( 'login successful' ) ;
//   } ) ;


// Handle POST requests to the /login endpoint
// This implementation is based on a Stack Overflow example for error handling:
// http://stackoverflow.com/questions/15711127/express-passport-node-js-error-handling
app . post ( '/login' ,
             passport . authenticate ( 'local' ) ,
             function ( req , res ) {

    // Generate a JSON response reflecting the authentication status
    if ( ! req . user ) {
        return res . send ( { success : false , message : 'authentication failed' } ) ;
    }
    return res . send ( { success : true , message : 'authentication succeeded' } ) ;
} ) ;


// Route for user logout
app . get ( '/logout' , function ( req , res ) {
    req . logout ( ) ; // Passport's logout function
    res . send ( { success : true , message : 'user logged out' } ) ;
} ) ;


/* GET Home Page - Checks if the user is logged in */
app . get ( '/loggedin' , function ( req , res ) {
    if ( ! req . user ) {
        return res . send ( { success : false , message : 'user not logged in' } ) ;
    }
    return res . send ( { success : true , message : 'user logged in' } ) ;
} ) ;




// Catch 404 errors and forward them to the error handler middleware
app . use ( function ( req , res , next ) {
    var err = new Error ( 'Not Found' ) ;
    err . status = 404 ;
    next ( err ) ;
} ) ;


// Error handlers for different environments

// Development error handler: will print stacktrace to the client
if ( app . get ( 'env' ) === 'development' ) {
    app . use ( function ( err , req , res , next ) {
        res . status ( err . status || 500 ) ;
        res . render ( 'error' , {
            message : err . message ,
            error : err
        } ) ;
    } ) ;
}

// Production error handler: no stacktraces leaked to the user
app . use ( function ( err , req , res , next ) {
    res . status ( err . status || 500 ) ;
    res . render ( 'error' , {
        message : err . message ,
        error : { } // Empty error object for production
    } ) ;
} ) ;


// Export the configured Express application module
module . exports = app ;