/*
 * This file sets up the Express application,
 * configures database connections (Redis and MongoDB),
 * and initializes the Derby.js store.
 * It also defines middleware for session management,
 * static file serving, and application routing.
 */

// Core Express framework import
var express = require('express');

// Derby.js framework import for real-time applications
var derby = require('derby');

// Racer BrowserChannel for real-time communication
var racerBrowserChannel = require('racer-browserchannel');

// LiveDB MongoDB adapter for data persistence
var liveDbMongo = require('livedb-mongo');

// Connect-Mongo for session storage
var MongoStore = require('connect-mongo')(express);

// Main application logic import
var app = require('../app');

// Error handling module import
var error = require('./error');


// Initialize the main Express application instance
var expressApp = module.exports = express();


// --- Redis Configuration Section ---
// Attempt to configure Redis connection based on environment variables.

if ( process.env.REDIS_HOST )
{
    // Use explicit host and port if provided
    var redis = require('redis').createClient( process.env.REDIS_PORT , process.env.REDIS_HOST );
    redis.auth( process.env.REDIS_PASSWORD );
}
else if ( process.env.REDISCLOUD_URL )
{
    // Parse RedisCloud URL if available
    var redisUrl = require('url').parse( process.env.REDISCLOUD_URL );
    var redis = require('redis').createClient( redisUrl.port , redisUrl.hostname );
    redis.auth( redisUrl.auth.split(":") [1] );
}
else
{
    // Default to local Redis instance
    var redis = require('redis').createClient();
}

// Select the appropriate Redis database
redis.select( process.env.REDIS_DB || 1 );


// --- MongoDB Configuration Section ---
// Determine the MongoDB connection URL from environment or default to local.
var mongoUrl = process.env.MONGO_URL || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/project';


// The Derby.js store is responsible for creating models and syncing data across clients and server.
var store = derby.createStore( {
    db: liveDbMongo( mongoUrl + '?auto_reconnect' , { safe : true } ) ,
    redis: redis
} );


/*
 * Middleware function to ensure a unique user ID is assigned to the session.
 * If no userId exists in the session, a new one is generated.
 */
function createUserId ( req , res , next )
{
    var model = req.getModel();
    var userId = req.session.userId || ( req.session.userId = model.id() );
    model.set( '_session.userId' , userId );
    next();
}


// --- Express Application Middleware Chain ---
// Configure the Express app with various middleware components.

expressApp

    // Favicon serving middleware
    .use( express.favicon() )

    /* Gzip compression for all responses */
    .use( express.compress() )

    // Middleware to respond to requests for application script bundles (Derby.js)
    .use( app.scripts( store ) )

    // Serve static files from the public directory
    .use( express.static( __dirname + '/../../public' ) )


    // Add browserchannel client-side scripts to model bundles created by store,
    // and return middleware for responding to remote client messages.
    .use( racerBrowserChannel( store ) )

    // Add req.getModel() method to access the Derby model from requests
    .use( store.modelMiddleware() )


    // Original bodyParser and methodOverride are commented out,
    // implying their functionality might be handled differently or not needed.
    // .use( express.bodyParser() )
    // .use( express.methodOverride() )


    // Cookie parsing middleware
    .use( express.cookieParser() )

    // Session management middleware using connect-mongo for storage
    .use( express.session( {
        secret: process.env.SESSION_SECRET || 'YOUR SECRET HERE' ,
        store: new MongoStore( { url: mongoUrl , safe: true } )
    } ) )

    // Custom middleware to ensure a user ID is present in the session
    .use( createUserId )


    // Middleware for application-specific routes defined in the Derby app
    .use( app.router() )

    // Express's own router middleware
    .use( expressApp.router )

    // Error handling middleware
    .use( error() )


// --- SERVER-SIDE ROUTES ---

// Catch-all route for any unhandled requests, typically for 404 errors.
expressApp.all( '*' , function ( req , res , next )
{
    next( '404: ' + req.url );
} );