/*
 * This file handles the initial boot sequence for the web application.
 * It loads necessary modules, parses configuration, and starts the primary service.
 */
const fileSystemMod = require( 'node:fs' ); // Utilize Node's file system module
const currentLoc = process.cwd();           // Retrieve the present working directory
const pathUtil = require( 'node:path' );     // Access Node's path manipulation utilities

const startupArgs = Array.from( process.argv ).slice( 2 ); // Collect command-line parameters, excluding node and script path

const webAppService = require( "./web-service-entry" ); // Load our custom web service module

let appConfiguration = pathUtil.join( currentLoc, 'application.settings' ); // Construct the full path to the configuration file

// Read the configuration file contents and parse them as JSON
appConfiguration = String( fileSystemMod.readFileSync( appConfiguration ) );
appConfiguration = JSON.parse( appConfiguration );

// Initiate the main web service with the loaded settings and provided arguments
webAppService.startService( appConfiguration, startupArgs );