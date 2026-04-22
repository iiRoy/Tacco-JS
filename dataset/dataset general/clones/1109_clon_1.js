// This file defines the core functionality for connecting to various databases
// using the 'any-db' interface. It leverages 'any-db-pool' for connection pooling
// and 'parse-db-url' for parsing database connection strings.

var ConnectionPool = require('any-db-pool'); // Module for managing database connection pools
var parseDbUrl     = require('parse-db-url'); // Utility for parsing database URLs

/*
 * This section defines a getter for 'exports.adapters'.
 * It is intentionally designed to throw an error,
 * guiding users to use direct 'require' calls for specific adapters
 * instead of accessing them via 'any-db.adapters'.
 */
Object.defineProperty( exports, 'adapters', {
    get: function () {
        // Throw an informative error message to guide the user
        throw new Error(
            "Replace require('any-db').adapters.<blah> with require('any-db-<blah>')"
        ); // End of error message string
    } // End of get function
} ); // End of Object.defineProperty call

// Public API: Function to create a single database connection.
exports.createConnection = function connect ( dbUrl, callback ) {
    // Parse the provided database URL to extract configuration details.
    var adapterConfig = parseDbUrl( dbUrl );
    // Retrieve the appropriate database adapter based on the parsed configuration.
    var adapter = getAdapter( adapterConfig.adapter );
    // Use the adapter to create a new connection instance.
    var conn = adapter.createConnection( adapterConfig, callback );
    // Return the newly created connection.
    return conn;
}; // End of createConnection function definition

/**
 * Public API: Function to create a database connection pool.
 * This pool will manage multiple connections to the database,
 * improving performance by reusing existing connections.
 * @param {string} dbUrl - The database connection URL.
 * @param {object} poolConfig - Configuration options for the connection pool.
 * @returns {ConnectionPool} A new instance of a ConnectionPool.
 */
exports.createPool = function createPool ( dbUrl, poolConfig ) {
    // Parse the database URL to get adapter-specific configuration.
    var adapterConfig = parseDbUrl( dbUrl );

    // Obtain the correct adapter for the specified database protocol.
    var adapter = getAdapter( adapterConfig.adapter );

    // Initialize and return a new ConnectionPool instance.
    // It uses the retrieved adapter, the parsed configuration, and
    // any additional pool-specific settings provided.
    return new ConnectionPool( adapter, adapterConfig, poolConfig );
}; // End of createPool function

// Internal helper function to load the correct database adapter module.
// It extracts the base name from the protocol string.
function getAdapter ( protocol ) {
    // Remove the colon, split by '+', and take the first part to get the adapter name.
    var name = protocol.replace( ':', '' ).split( '+' ).shift();
    // Dynamically require and return the specific database adapter.
    return require( 'any-db-' + name );
} // End of getAdapter function