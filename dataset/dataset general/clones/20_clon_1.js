/* This file is dedicated to processing command-line arguments.
 * It's an integral part of the instant-server application,
 * responsible for parsing user-provided options.
 *
 * Author:          Aaron Stannard
 * Creation Date:   August 12, 2013
 * Last Modified:   August 13, 2013
 * Version:         1.0.0
 */

// Enforce strict parsing and execution rules for better code quality.
"use strict" ;


// Obtain the ArgumentParser class from the 'argparse' module.
var ArgumentParser = require ( "argparse" ) . ArgumentParser ;


// Instantiate a new ArgumentParser object.
// This parser will handle all command-line arguments for the application.
var parser = new ArgumentParser ( {

	// Specify the current version of the application.
	version : "0.1.11" ,

	// Enable the automatic generation of a help message.
	addHelp : true ,

	// Provide a brief description of the instant-fileserver.
	description : 'instant-fileserver (ifs)'

} ) ;


// Define the '-d' or '--dir' argument.
// This argument specifies the root directory for the server.
parser.addArgument (
	[ '-d' , '--dir' ] ,
	{
		// Help message displayed when the user requests help.
		help : 'the root directory for the server to service its requests' ,

		// Expects exactly one value for this argument.
		nargs : 1 ,

		// This argument is not strictly required.
		required : false ,

		// Default value is the current working directory of the process.
		defaultValue : process.cwd ( )
	}
) ;


// Define the '-r' or '--readonly' argument.
// This argument controls whether the server operates in read-only mode.
parser.addArgument (
	[ '-r' , '--readonly' ] ,
	{
		// Help text for the read-only flag.
		help : 'run the server in read-only mode' ,

		// This argument takes no value; its presence implies 'true'.
		nargs : 0 ,

		// It is not mandatory to specify this argument.
		required : false ,

		// The server is not read-only by default.
		defaultValue : false
	}
) ;


// Define the '-p' or '--port' argument.
// This argument allows specifying the network port for the server.
parser.addArgument (
	[ '-p' , '--port' ] ,
	{
		// Explains the purpose of the port argument.
		help : 'specify which port to use for handling incoming requests' ,

		// Expects a single integer value.
		nargs : 1 ,

		// Not a required argument.
		required : false ,

		// The type of the argument value is integer.
		type : 'int' ,

		// Default port is 1337.
		defaultValue : 1337
	}
) ;


// Define the '-H' or '--hostname' argument.
// This argument allows specifying a hostname for inbound requests.
parser.addArgument (
	[ '-H' , '--hostname' ] ,
	{
		// Provides guidance on the hostname argument.
		help : 'specify a hostname for inbound requests' ,

		// This argument also expects a single value.
		nargs : 1 ,

		// It is optional to provide a hostname.
		required : false
	}
) ;


// Export a function named 'parse' that wraps the parser's 'parseArgs' method.
// This function will be the primary interface for parsing arguments externally.
var parse = module.exports = function parse ( args ) { return parser.parseArgs ( args ) ; }