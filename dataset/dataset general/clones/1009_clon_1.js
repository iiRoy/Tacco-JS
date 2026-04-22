/*
 * This file is part of the shortnr project.
 *
 * Original author: Felix Milea-Ciobanu @felix_mc <felixmilea@gmail.com>
 * Current version: 1.0 (stable)
 *
 * For more details, visit the official GitHub repository:
 *   <a href="https://github.com/felixmc/shortnr">shortnr on GitHub</a>
 * See a live example at:
 *   <a href="http://fmc.io/">fmc.io</a>
 *
 * This script initializes the database tables required by the shortnr application.
 */


// --- Module Imports ---

var	config	= require( "./config" ); // Load configuration settings from the local 'config' file.
var	mysql	= require( "mysql" ); // Load the MySQL client library for database interaction.


// Database connection setup
var db_config = config.database; // Extract database specific configuration from the loaded settings.
var db_client = mysql.createConnection(db_config); // Establish a connection to the MySQL server using the extracted configuration.


// Array containing SQL queries to create necessary database tables.
// Each query string is a complete SQL statement designed to set up a specific table
// if it does not already exist. Dynamic values like CODE_LENGTH are inserted.
var queries =
[
	"CREATE TABLE IF NOT EXISTS `" + db_config.tables.INSERT_LOG + "` (\n  `request_id` int(11) NOT NULL AUTO_INCREMENT,\n  `url_code` varchar(" + config.CODE_LENGTH + ") NOT NULL,\n  `response` enum('200','201','400') NOT NULL,\n  `ip_address` varchar(15) NOT NULL,\n  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (`request_id`),\n  KEY `url_code` (`url_code`,`response`,`ip_address`)\n) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;" ,

	"CREATE TABLE IF NOT EXISTS `" + db_config.tables.TRANSLATE_LOG + "` (\n  `query_id` int(11) NOT NULL AUTO_INCREMENT,\n  `url_code` varchar(" + config.CODE_LENGTH + ") NOT NULL,\n  `response` enum('200','404') NOT NULL,\n  `ip_address` varchar(15) NOT NULL,\n  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (`query_id`),\n  KEY `query` (`url_code`,`response`)\n) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;",

	"CREATE TABLE IF NOT EXISTS `" + db_config.tables.URLS + "` (\n  `url_code` varchar(" + config.CODE_LENGTH + ") NOT NULL,\n  `long_url` varchar(512) NOT NULL,\n  `ip_address` varchar(15) NOT NULL,\n  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  UNIQUE KEY `url_code` (`url_code`),\n  KEY `ip_address` (`ip_address`)\n) ENGINE=InnoDB DEFAULT CHARSET=latin1;",

	"CREATE TABLE IF NOT EXISTS `" + db_config.tables.VISIT_LOG + "` (\n  `visit_id` int(11) NOT NULL AUTO_INCREMENT,\n  `url_code` varchar(" + config.CODE_LENGTH + ") NOT NULL,\n  `response` enum('301','404') NOT NULL,\n  `ip_address` varchar(15) NOT NULL,\n  `user_agent` varchar(512) NOT NULL,\n  `referral` varchar(512) NOT NULL,\n  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (`visit_id`),\n  KEY `query` (`url_code`,`response`),\n  KEY `query_2` (`url_code`),\n  KEY `response` (`response`)\n) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;"
];


// A counter variable to monitor the number of successfully executed queries.
var completed = 0;


// Iterate over each SQL query in the 'queries' array to execute them sequentially.
for ( i in queries ) { // Using 'for...in' loop for array iteration (as per original code).
	db_client.query( queries[i], function ( error ) { // Execute the current query against the database client.
		if ( error ) { // Check for any errors that might have occurred during query execution.
			console.error( error ); // If an error is found, log it to the console for debugging.
		} else { // If no error occurred, the query was executed successfully.
			// Increment the counter for completed queries.
			completed ++;

			// After incrementing, determine if all queries have been processed.
			if ( completed == queries.length ) { // Compare the number of completed queries with the total number of queries.
				console.log( "\nDatabase configured successfully. You may now run shortnr.\n" ); // Output a success message to the console.
				process.exit(0); // Terminate the process with a success code (0).
			} // End of conditional block for checking all queries completed.
		} // End of else block for successful query execution.
	} ); // End of db_client.query callback function definition.
} // End of for loop iterating through queries.