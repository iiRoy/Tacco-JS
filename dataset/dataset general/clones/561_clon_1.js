/* BibleForge - Core Database Abstraction Layer */

/*
 *
 * @date    28-May-2012
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license The MIT License (MIT) (See below for full text)
 *
 */

/*
 *  The BibleForge motto:
 *
 *  "all things whatsoever ye would that men should do to you, do ye even so to them."
 *       —Jesus (Matthew 7:12)
 */

/*
 * Copyright (C) 2013
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * “Software”), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Set JSHint options for this file.
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

"use strict" ;

// How long to wait after an error before attempting to reconnect.
var    reconnect_delay = 1000 ;

/*
 * Check if a Node.js module is available.
 *
 * @param  name (string) The module's name to verify existence.
 * @return TRUE if the module exists, FALSE otherwise.
 */
function module_exists( name )
{
	try
	{
		require.resolve( name ) ;
		return true ;
	}
	catch ( err )
	{
		return false ;
	}
}

/*
 * Escape special symbols used in Sphinx and database connectors.
 *
 * @param  str (string) The input string to be escaped.
 * @return An escaped version of the input string.
 */
function sphinx_escape( str )
{
	// Question marks (?) are special symbols for database connectors and must be escaped.
	// Semicolons (;) are special symbols in SphinxQL and also require escaping.
	return str.replace( /\?/g , "\\?" ).replace( /;/g , "\\\\;" ) ;
}

/*
 * Create an abstraction layer for the non-blocking Maria/MySQL connector.
 *
 * @param config (object) A BibleForge DB configuration object (refer to init() for details).
 */
function create_connection_non_blocking( config , set_status )
{
	var client = new ( require( "mariasql" ) )() ,
		connecting ,
		connected ;

	/*
	 * Open a database connection if one is not already established or in progress.
	 */
	function connect()
	{
		// Ensure an open connection has not already been established or is in the process of being established;
		// otherwise, an infinite connection loop could occur.
		if ( !connected && !connecting )
		{
			connecting = true ;
			client.connect( {
				host : config.host ,
				user : config.user ,
				port : config.port ,
				password : config.pass ,
				db : config.base
			} ) ;
		}
	}

	/*
	 * Handle disconnections and attempt to reconnect.
	 *
	 * @param err (object) (optional) An error message received from the server.
	 */
	function handle_disconnect( err )
	{
		connecting = false ;
		// TODO: Implement disconnection logging.
		connected = false ;
		set_status( 0 ) ; // Set status to offline.
		setTimeout( connect , reconnect_delay ) ;

		if ( err )
		{
			console.log( err ) ;
		}
	}

	// Initialize by opening a connection.
	connect() ;

	// Attach event handlers for connection, error, and close events.
	client.on( "connect" , function()
	{
		connecting = false ;
		connected = true ;
		set_status( 1 ) ; // Set status to online.
	} ).on( "error" , handle_disconnect ).on( "close" , handle_disconnect ) ;

	return {
		/*
		 * Escape a Sphinx query argument.
		 *
		 * @example var sql = "SELECT * FROM `table` WHERE query = \"" + db_client.escape_sphinx("fake query;limit=99999") + ";ranker=none\"";
		 * @param   str (string) The string to be escaped.
		 * @return  An escaped string suitable for Sphinx.
		 * @note    This operation requires an active database connection.
		 */
		escape_sphinx : function ( str )
		{
			return sphinx_escape( client.escape( str ) ) ;
		} ,
		/*
		 * Execute a simple SQL query and retrieve all results.
		 *
		 * @param sql      (string)              The SQL string for execution.
		 * @param callback (function) (optional) The function to invoke once all data is returned or an error occurs.
		 *                                       The callback() receives one variable on query success and two (first undefined) on error.
		 */
		query : function ( sql , callback )
		{
			// Send the query to the database client.
			client.query( sql ).on( "result" , function ( res )
			{
				var data = [] ; // Array to store fetched rows.

				res.on( "row" , function ( row )
				{
					// Store each returned row in the data array.
					data[ data.length ] = row ;
				} ).on( "end" , function ()
				{
					// Once the query has completed, send the results to the provided callback, if any.
					if ( callback )
					{
						callback( data ) ;
					}
				} ) ;
			} ).on( "error" , function ( err )
			{
				// Catch any errors that occur during the query execution.
				// TODO: Implement error logging.
				if ( callback )
				{
					callback( undefined , err ) ;
				}
			} ) ;
		}
	} ;
}

/*
 * Create an abstraction layer for the pure JavaScript Maria/MySQL connector.
 *
 * @param config (object) A BibleForge DB configuration object (refer to init() for details).
 */
function create_connection_js( config , set_status )
{
	var client ,
		connecting ,
		connected ;

	/*
	 * Instantiate the connection object and establish the connection.
	 */
	function create_connection()
	{
		client = require( "mysql" ).createConnection( {
			host : config.host ,
			user : config.user ,
			port : config.port ,
			password : config.pass ,
			database : config.base ,
			socketPath : config.sock
		} ) ;
	}

	/*
	 * Open and prepare a database connection if one is not already established.
	 */
	function connect()
	{
		if ( !connected && !connecting )
		{
			connecting = true ;
			// Note: With this module, a connection can only be used once (it cannot be reused to reconnect).
			// Therefore, a new client object must be created each time.
			create_connection() ;
			// Attach event handlers for connect, error, and close events.
			// This must be done each time because the connection object cannot be reused.
			client.on( "error" , handle_disconnect ) ;
			client.connect( function on_connect( err )
			{
				// Was there an error during the connection attempt?
				if ( err )
				{
					handle_disconnect( err ) ;
				}
				else
				{
					// If no error was reported, the connection apparently opened successfully.
					connecting = false ;
					connected = true ;
					set_status( 1 ) ;
				}
			} ) ;
		}
	}

	/*
	 * Handle disconnections and attempt to reconnect.
	 *
	 * @param err (object) (optional) An error message from the server.
	 */
	function handle_disconnect( err )
	{
		connecting = false ;
		// TODO: Log disconnection events.
		connected = false ;
		set_status( 0 ) ;
		setTimeout( connect , reconnect_delay ) ;

		if ( err )
		{
			console.log( err ) ;
		}
	}

	// Initial connection attempt.
	connect() ;

	return {
		/*
		 * Escape a Sphinx query argument.
		 *
		 * @example var sql = "SELECT * FROM `table` WHERE query = \"" + db_client.escape_sphinx("fake query;limit=99999") + ";ranker=none\"";
		 * @param   str (string) The string to be escaped.
		 * @return  An escaped string.
		 * @note    This requires an open connection to the database.
		 */
		escape_sphinx : function ( str )
		{
			// This module automatically adds quotations around strings, which would cause issues with Sphinx.
			// We remove them here before passing to sphinx_escape.
			return sphinx_escape( client.escape( str ) ).slice( 1 , -1 ) ;
		} ,
		/*
		 * Send a simple SQL query and retrieve the results.
		 *
		 * @param sql      (string)              The SQL string to execute.
		 * @param callback (function) (optional) The function to call after all data is returned or an error occurs.
		 *                                       The callback() receives one variable on query success and two (first undefined) on errors.
		 */
		query : function ( sql , callback )
		{
			// Execute the SQL query.
			client.query( sql , function ( err , data )
			{
				if ( callback )
				{
					callback( data , err ) ;
				}
			} ) ;
		}
	} ;
}

/*
 * Create the database abstraction layer for BibleForge.
 *
 * @param db_config (array || object) An object or array of objects specifying database configuration (refer to config.sample.js).
 *                                    Object structure:
 *                                    {
 *                                        host: "The host's address",
 *                                        port: "The port to listen to",
 *                                        sock: "The Unix file socket if not listening to a port",
 *                                        user: "The database username",
 *                                        user: "The database user's password",
 *                                        base: "The database to connect to",
 *                                    }
 */
exports.db = function init( db_config )
{
	var create_connection ,
		request_a_client ,
		servers = [] ,
		servers_count ;

	// If the 'mariasql' module is available, prioritize its use.
	// Note: The 'mariasql' module is faster and non-blocking but is a C module,
	// making it less portable and not always installed.
	if ( module_exists( "mariasql" ) )
	{
		create_connection = create_connection_non_blocking ;
	}
	else
	{
		// As a fallback, use the pure JavaScript client if 'mariasql' is not found.
		create_connection = create_connection_js ;
	}

	// If a single object was provided, convert it into an array for consistent processing.
	if ( !Array.isArray( db_config ) )
	{
		db_config = [ db_config ] ;
	}

	servers_count = db_config.length - 1 ;

	// Establish a connection to each configured server.
	db_config.forEach( function ( config )
	{
		var which = servers.length ;
		servers[ which ] = {
			connection : create_connection( config , function set_status( status )
			{
				servers[ which ].online = status === 1 ;
			} )
		} ;
	} ) ;

	/*
	 * Retrieve an available database client.
	 *
	 * @return A client object if found, or FALSE if no clients are available.
	 * @note   This function employs a round-robin method for client selection.
	 * @note   It would be beneficial to implement a system for designating backup servers,
	 *         to be queried only when primary servers are unavailable.
	 */
	request_a_client = ( function ()
	{
		// Since we increment 'which_server' at the start of the loop,
		// we initialize it to -1 to ensure the first server (index 0) is tried initially.
		var which_server = -1 ;

		return function ()
		{
			var tries = 0 ;

			// Iterate through all available servers (starting from where we last left off)
			// to locate an online server.
			for ( ; ; )
			{
				// Move to the next server in the list.
				which_server += 1 ;

				if ( which_server > servers_count )
				{
					which_server = 0 ; // Wrap around to the beginning of the server list.
				}

				if ( servers[ which_server ].online )
				{
					// If an online server is found, stop iterating and use it.
					break ;
				}

				// If the current server is offline, track how many servers we've attempted,
				// and proceed to try the next one. This helps determine when all servers have been checked.
				tries += 1 ;

				// If all clients have been tried and none are online, give up.
				if ( tries > servers_count )
				{
					return false ;
				}
			}

			// TODO: Implement connection pooling for better resource management.
			return servers[ which_server ].connection ;
		} ;
	}() ) ;

	return {
		/*
		 * Execute a database query.
		 *
		 * @param sql      (string)   The SQL query string to execute.
		 * @param callback (function) The function to call once the query returns its results.
		 * @note  If the database has not yet established a connection, the query will be queued.
		 */
		query : function query( sql , callback )
		{
			var client = request_a_client() ;

			// Check if any clients were available.
			if ( !client )
			{
				// If no client is available, wait a short period and try the query again.
				setTimeout( function ()
				{
					query( sql , callback ) ;
				} , 100 ) ;
				return ;
			}

			// Delegate the query execution to the selected client.
			client.query( sql , callback ) ;
		} ,
		// For more complex queries (e.g., those requiring custom escaping),
		// a client object can be requested directly.
		// Client objects provide the following functions:
		//     .escape_sphinx()
		//     .query()
		request_a_client : request_a_client
	} ;
} ;