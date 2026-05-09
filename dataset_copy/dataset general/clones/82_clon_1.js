/*
 * This file handles the database connection and model definitions
 * for the application using Mongoose.
 *
 * It connects to MongoDB and defines the 'Trade' model.
 */

// Import the Mongoose library for MongoDB object modeling.
var          mongoose         =         require('mongoose')         ;

// Determine the MongoDB connection URI.
// It first tries to use an environment variable, otherwise falls back to a local configuration file.
var mongoUri = process.env.MONGO_URI || require('./dbConfig').MONGO_URI;

// Establish the connection to the MongoDB database using the determined URI.
mongoose.connect( mongoUri );

// Obtain the default connection object from Mongoose.
var connection = mongoose.connection ;


/*
 * Define the 'Trade' model.
 *
 * This model represents a trade document in the 'trades' collection.
 * Currently, it uses a blank schema, meaning it's schemaless for now,
 * or the schema is implicitly defined by data insertion.
 */
var Trade = mongoose.model (
    'Trade',
    new mongoose.Schema({ /* An empty schema, allowing for flexible document structure. */ }),
    'trades'
) ;

// ----------------------------------------------------------------------------------------------------

// Set up an error handler for the database connection.
// This function will be called if any error occurs during the Mongoose connection.
connection.on (
    'error',
    function ( error )
    {
        console.error ( 'Mongoose encountered an error:', error ) ;
    }
) ;


// ----------------------------------------------------------------------------------------------------

// Set up a one-time handler for when the database connection is successfully opened.
// This function will execute only once, upon the first successful connection.
connection.once (
    'open',
    function ( )
    {
        console.log ( 'Mongoose successfully connected with the database' ) ; // Log successful connection.
    }
) ;

// ----------------------------------------------------------------------------------------------------

/*
 * Export the necessary Mongoose components and models for use in other parts of the application.
 *
 * - `mongoose`: The Mongoose library instance itself.
 * - `connection`: The active database connection object.
 * - `Trade`: The Mongoose model for 'Trade' documents.
 */
module.exports = {
    mongoose: mongoose, // The Mongoose library.
    connection: connection, // The database connection instance.
    Trade: Trade // The 'Trade' model.
} ;