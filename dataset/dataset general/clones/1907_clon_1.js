/*
 * This section handles the initial setup of core modules
 * and prepares the environment for third-party libraries.
 */
var fs        = require('fs');
var sys       = require('sys');
var extname   = require('path').extname;


// Begin bootstrapping of necessary 3rd-party libraries into the module path.
require.paths.unshift(__dirname + '/support/');
require.paths.unshift(__dirname + '/support/mongoose/');


// Now, let's include the main 3rd-party frameworks needed for this application.
var express     = require('express');
var mongoose    = require('mongoose').Mongoose;


// Server initialization: create the main application instance.
var app = module.exports.app = express.createServer();


/*
 * Server configuration block.
 * Here we define various middleware and settings for the Express application.
 */
app.use( express.bodyDecoder() ); // Parses request bodies
app.use( express.compiler( { enable: true } ) ); // Enables asset compilation
app.use( express.conditionalGet() ); // Handles conditional GET requests
app.use( express.gzip() ); // Compresses responses with GZIP
app.use( express.methodOverride() ); // Allows HTTP method overriding

app.use( express.staticProvider( __dirname + '/public' ) ); // Serves static files from the 'public' directory


app.set( 'views', __dirname + '/views' ); // Sets the directory for view templates


// Configuration loading: Attempt to load application settings from a JSON file.
try
{
    var cfg = module.exports.cfg = JSON.parse( fs.readFileSync( __dirname + '/config.json' ).toString() );
}
catch ( e )
{
    // If the configuration file is not found, throw an error with instructions.
    throw new Error( "File config.json not found. Try: 'cp config.json.sample config.json'" );
}


/*
 * Generic file loader function.
 * This utility function is used to load JavaScript files
 * from a specified directory, typically for controllers or models.
 */
var loader = function ( dir )
{
    fs.readdir( dir, function ( err, files )
    {
        if ( err )
        {
            throw err;
        }


        files.forEach( function ( file )
        {
            // Only process JavaScript files.
            if ( extname( file ) == '.js' )
            {
                require( dir + '/' + file.replace( '.js', '' ) );
            }
        } );
    } );
};


// Debugger enablement: If debugging is configured, activate the error handler.
if ( true == cfg.debug )
{
    app.use( express.errorHandler( {
        showStack: true,
        dumpExceptions: true
    } ) );
}


// Logger enablement: If logging is configured, activate the request logger.
if ( true == cfg.logger )
{
    app.use( express.logger() );
}


/*
 * Custom Error Class: NotFound
 * Defines a specific error type for 'Not Found' scenarios (e.g., HTTP 404).
 */
var NotFound = module.exports.nf = function ( msg )
{
    this.name = 'NotFound';
    Error.call( this, msg );
    Error.captureStackTrace( this, arguments.callee );
};


// Inherit from the standard Error object.
sys.inherits( NotFound, Error );


// Application-level error handling for HTTP 404 (Not Found).
app.error( function ( err, req, res, next )
{
    if ( err instanceof NotFound )
    {
        res.send( '404 Not found', 404 );
    }
    else
    {
        next( err ); // Pass to the next error handler if it's not a NotFound error.
    }
} );


// Application-level error handling for HTTP 500 (Internal Server Error).
app.error( function ( err, req, res )
{
    res.send( '500 Internal server error', 500 );
} );


/* Database Connection Setup */
// Establish a connection to the MongoDB database using configuration parameters.
var db = module.exports.db = mongoose.connect( 'mongodb://' + cfg.mongo.host + ':' + cfg.mongo.port + '/' + cfg.mongo.name );


// Load application models using the defined file loader.
cfg.loader.models.forEach( loader );


// Load application controllers using the defined file loader.
cfg.loader.controllers.forEach( loader );


/*
 * Default Controller Logic:
 * This block defines a set of RESTful API routes if the default controller
 * is enabled in the configuration. It provides basic CRUD operations
 * for database collections.
 */
if ( cfg.loader.use_default_controller )
{
    // Route for finding multiple documents within a collection (GET /:collection).
    app.get( '/:collection', function ( req, res, next )
    {
        var col = db.model( req.params.collection );
        var qw = col.find(); // Initialize query builder.

        // Apply query parameters if provided.
        if ( req.param( 'query' ) )
        {
            qw.where( req.param( 'query' ) );
        }

        // Apply ordering parameters if provided.
        if ( req.param( 'order' ) )
        {
            var order = [];
            req.param( 'order' ).forEach( function ( dir, field )
            {
                order.push( [ field, dir ] );
            } );
            qw.sort( order );
        }

        // Apply limit for pagination.
        if ( req.param( 'limit' ) )
        {
            qw.limit( req.param( 'limit' ) );
        }

        // Apply offset for pagination.
        if ( req.param( 'offset' ) )
        {
            qw.skip( req.param( 'offset' ) );
        }

        // Execute the query and return results.
        qw.all( function ( docs )
        {
            var ret = [];
            docs.forEach( function ( doc )
            {
                ret.push( doc.toObject() );
            } );

            res.header( 'Content-Type', 'application/json' );
            res.send( ret, 200 ); // Send the array of documents as JSON.
        } );
    } );


    // Route for reading a single document by ID (GET /:collection/:id).
    app.get( '/:collection/:id', function ( req, res, next )
    {
        var col = db.model( req.params.collection );

        col.findById( req.params.id, function ( doc )
        {
            if ( !doc )
            {
                next( new NotFound ); // If document not found, pass to 404 handler.
            }
            else
            {
                res.header( 'Content-Type', 'application/json' );
                res.send( doc.toObject(), 200 ); // Send the document as JSON.
            }
        } );
    } );


    // Function to handle document creation.
    var createDoc = function ( req, res, next )
    {
        var col = db.model( req.params.collection );
        var doc = new col;

        doc.merge( req.param( req.params.collection ) ); // Merge request parameters into the new document.

        doc.save( function ()
        {
            res.send( doc.toObject(), 201 ); // Send the created document with a 201 status.
        } );
    };

    // Routes for creating new documents (PUT/POST /:collection).
    app.put( '/:collection', createDoc );
    app.post( '/:collection', createDoc );


    // Function to handle document modification.
    var modifyDoc = function ( req, res, next )
    {
        var col = db.model( req.params.collection );

        col.findById( req.params.id, function ( doc )
        {
            if ( !doc )
            {
                next( new NotFound ); // If document not found, pass to 404 handler.
            }
            else
            {
                doc.merge( req.param( req.params.collection ) ); // Merge request parameters for update.

                doc.save( function ()
                {
                    res.send( doc.toObject(), 200 ); // Send the updated document with a 200 status.
                } );
            }
        } );
    };

    // Routes for modifying existing documents (PUT/POST /:collection/:id).
    app.put( '/:collection/:id', modifyDoc );
    app.post( '/:collection/:id', modifyDoc );


    // Route for removing a document by ID (DEL /:collection/:id).
    app.del( '/:collection/:id', function ( req, res, next )
    {
        var col = db.model( req.params.collection );

        col.findById( req.params.id, function ( doc )
        {
            if ( !doc )
            {
                next( new NotFound ); // If document not found, pass to 404 handler.
            }
            else
            {
                doc.remove( function ()
                {
                    res.send( '200 OK', 200 ); // Send a success message with a 200 status.
                } );
            }
        } );
    } );
}


/*
 * Server Startup:
 * Begin listening for incoming connections on the configured port.
 * The address can also be specified, but it is currently commented out.
 */
app.listen( cfg.server.port /* , cfg.server.addr */ );