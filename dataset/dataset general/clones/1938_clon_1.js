var    fs    =    require('fs')   ;   // Core Node.js file system module for file operations
 var argv = require('optimist').argv;  /* Command line argument parser */
 var nconf = require('nconf');         // Configuration management library
 var moment = require('moment');       // Date and time manipulation library
 var path = require('path-extra');     // Extended path utilities, e.g., homedir

 // Initialize the Moves API client
 var movesApi = require('moves-api').MovesApi;


 // Define application-wide constants
 var configFilePath = path.homedir() + '/.elizabeth.json';   // Path to the user's configuration file
 var configSamplePath = __dirname + '/../config.sample.json'; // Path to the sample configuration file
 var dateFormat = 'YYYYMMDD';                               // Standard date format used throughout the application


 /**
  * @class Elizabeth
  * @constructor
  * Main application class for the Moves.app exporter.
  */
 function Elizabeth ( ) {

 }


 /**
  * Initializes the application, guiding the user through the setup process
  * including Moves API client creation and access token acquisition.
  */
 Elizabeth.prototype.startInit = function startInit ( ) {

    _printHeader ( ); // Display application header

    console.log ( '> Hello there. Just let me check if you already have a config.' ) ;

    if ( fs.existsSync ( configFilePath ) ) {

        console.log ( '> Found a config file. If you want to recreate it, please delete it first.' ) ;
        console.log ( '> Found at path: ' + configFilePath ) ;
        process.exit ( 1 ) ; // Exit if configuration already exists
    }


    // Copy the sample configuration file to the user's home directory
    _copyFileSync ( configSamplePath, configFilePath, 'UTF-8' ) ;
    nconf.file ( configFilePath ) ; // Load the newly created (empty) config file


    console.log ( '> Noo, okay. I created an empty one for you.' ) ;
    console.log ( '> I will walk you through the configuration process.' ) ;
    console.log ( '' ) ;
    console.log ( '> First of all we need to create a Moves API Client. Please go to this URL and follow the instructions to create a new app.' ) ;
    console.log ( '' ) ;

    console.log ( 'https://dev.moves-app.com/apps' ) ; // URL for Moves app registration

    console.log ( '' ) ;
    console.log ( '> (Please use "http://localhost:3000/auth" when asked for a "Redirect URI")' ) ;
    console.log ( '' ) ;

    console.log ( '> After creating your app, please enter your credentials:' ) ;
    console.log ( '' ) ;


    // Prompt user for client ID and client secret
    _startPrompt ( function ( clientId, clientSecret ) {

        nconf.set ( 'moves:clientId', clientId ) ;
        nconf.set ( 'moves:clientSecret', clientSecret ) ;
        nconf.set ( 'moves:redirectUri', 'http://localhost:3000/auth' ) ; // Set the redirect URI for OAuth


        console.log ( '' ) ;
        console.log ( '> Okay, my friend. Step one completed. Now we need to create an access token.' ) ;
        console.log ( '> Point your web browser to this URL and follow the instructions:' ) ;
        console.log ( '' ) ;
        console.log ( 'http://localhost:3000/' ) ; // Local server URL for OAuth flow
        console.log ( '' ) ;


        // Start a local server to handle the OAuth callback and acquire an access token
        _initCreateServer ( function ( accessToken ) {

            console.log ( '> Good work, seems like we managed to get an access token. I will save this for you.' ) ;

            nconf.set ( 'moves:accessToken', accessToken ) ; // Store the obtained access token


            // Save the complete configuration to file
            nconf.save ( function ( err ) {

                if ( err ) {
                    console.log ( '> Error while saving your config: ', err ) ;
                    process.exit ( 1 ) ;
                }

                console.log ( '' ) ;
                console.log ( '> Saved! Now I am ready to export all your data, I guess.' ) ;
                process.exit ( 0 ) ; // Configuration complete, exit successfully
            } ) ;
        } ) ;
    } ) ;
 }



 /**
  * Retrieves and displays the user's Moves profile information.
  */
 Elizabeth.prototype.showProfile = function showProfile ( ) {

    _loadConfig ( ) ; // Load application configuration
    _printHeader ( ) ; // Display application header


    var moves = new movesApi ( nconf.get ( 'moves' ) ) ; // Initialize Moves API client with config


    // Fetch user profile from Moves API
    moves.getProfile ( function ( err, profile ) {

        if ( err ) {
            console.log ( '> THERE IS SOMETHING WRONG WITH YOU:' ) ;
            console.log ( '> ' + err ) ;
            process.exit ( 1 ) ;
        }


        console.log ( '> Your profile info:' ) ;
        console.log ( '    userId: ', profile.userId ) ;
        console.log ( '    startDay: ', moment ( profile.profile.firstDate, 'YYYYMMDD' ).format ( dateFormat ) ) ;

    } ) ;
 }


 /**
  * Initiates the data export process based on configured or command-line parameters.
  */
 Elizabeth.prototype.startExport = function startExport ( ) {

    _loadConfig ( ) ; // Load configuration
    _printHeader ( ) ; // Print application header


    var moves = new movesApi ( nconf.get ( 'moves' ) ) ; // Initialize Moves API client


    var exportPlugin = null; // Variable to hold the selected export plugin instance
    var range = {            // Date range for the export
        start: null,
        end: null
    };

    // Check for default parameters defined in the configuration file
    if ( nconf.get ( 'defaults' ) ) {
        exportPlugin = _getExportFromParameters ( exportPlugin, nconf.get ( 'defaults' ) ) ;
        range = _getDateRangeFromParameters ( range, nconf.get ( 'defaults' ) ) ;
    }

    // Check for command-line arguments, which override defaults
    if ( argv ) {
        exportPlugin = _getExportFromParameters ( exportPlugin, argv ) ;
        range = _getDateRangeFromParameters ( range, argv ) ;
    }

    // Validate if a valid date range and export plugin have been determined
    if ( !range || !exportPlugin ) {
        console.log ( '> No valid date range or export plugin :(' ) ;
        process.exit ( 1 ) ;
    }


    var days = range.end.diff ( range.start, 'days' ) ; // Calculate the number of days to export


    console.log ( '> Using ' + exportPlugin.help.name + ' to export ' + days + ' days!' ) ;
    console.log ( '' ) ;


    // Loop through each day in the calculated range and export its data
    for ( var i = 0; i < days; i++ ) {

        var day = range.start.add ( 1, 'days' ).format ( 'YYYYMMDD' ) ; // Get the next day in the sequence

        // Fetch storyline data for the current day from Moves API
        moves.getStoryline ( { from: day, trackPoints: true }, function ( err, result ) {

            if ( err ) {
                console.log ( '> WHAT? Error: ', err ) ;
                process.exit ( 1 ) ;
            }

            result = result [ 0 ] ; // Assuming only one storyline per day is returned


            // Use the selected export plugin to process and export the day's data
            exportPlugin.exportDay ( result, function ( err, result ) {

                if ( err ) {
                    console.log ( '! Error: ' + err ) ;
                    return ;
                }

                console.log ( '> Exported ' + result ) ; // Log successful export of the day
            } ) ;
        } ) ;
    }
 }


 /**
  * Displays help information including available commands and options,
  * as well as details for all recognized export plugins.
  */
 Elizabeth.prototype.printHelp = function printHelp ( ) {

    _printHeader ( ) ; // Print application header

    console.log ( 'Commands:' ) ;
    console.log ( '    ellie init - Create your configuration file' ) ;
    console.log ( '    ellie show - Shows information for the currently logged in user' ) ;
    console.log ( '    ellie help - Print this help' ) ;
    console.log ( '    ellie export - Start an export!' ) ;
    console.log ( '' ) ;

    console.log ( 'Options:' ) ;
    console.log ( '    --output [Exporter] - Use the specified export plugn' ) ;
    console.log ( '    --dayStart [' + dateFormat + '] - Start exporting at this day' ) ;
    console.log ( '    --dayEnd [' + dateFormat + '] - End exporting at this day' ) ;
    console.log ( '' ) ;
    console.log ( '    --days [n] - Export the last n days' ) ;
    console.log ( '    --yesterday - Export yesterday' ) ;
    console.log ( '' ) ;

    console.log ( 'Available exporters:' ) ;


    // Read all files in the 'output' directory to find available exporters
    var exporterFiles = fs.readdirSync ( __dirname + '/output' ) ;

    // Iterate through exporter files and display their help information
    exporterFiles.forEach ( function ( file ) {
        if ( /\.js$/.test ( file ) ) { // Check if it's a JavaScript file
            _helpForExporter ( __dirname + '/output/' + file ) ; // Display help for this exporter
        }
    } ) ;

    process.exit ( 0 ) ; // Exit after printing help
 }


 /**
  * Helper function to dynamically load an exporter plugin and display its help details.
  * @param {string} file - The path to the exporter plugin file.
  */
 function _helpForExporter ( file ) {

    var exporter = new ( require ( file ).Plugin ) ( ) ; // Dynamically load and instantiate the exporter plugin

    if ( !exporter.help ) {
        return ; // Skip if the exporter does not define a 'help' property
    }

    console.log ( '    ' + exporter.help.name + ': ' + exporter.help.description ) ;
    for ( var key in exporter.help.options ) { // Iterate through and display exporter-specific options
        console.log ( '        --' + key + ' ' + exporter.help.options [ key ] ) ;
    }

    console.log ( '' ) ;
 }


 /**
  * Prompts the user for input using the 'prompt' library.
  * @param {function} cb - Callback function to receive the prompted values.
  */
 function _startPrompt ( cb ) {

    var prompt = require ( 'prompt' ) ; // Load the 'prompt' library
    prompt.message = '> ' ;
    prompt.delimiter = '' ;
    prompt.colors = false ;


    prompt.start ( ) ; // Start the prompt service


    // Get 'clientId' and 'clientSecret' from the user
    prompt.get ( [ 'clientId', 'clientSecret' ], function ( err, result ) {

        if ( err ) {
            console.log ( '> What. I cannot read from the prompt u_u' ) ;
            process.exit ( 1 ) ;
        }

        cb ( result.clientId, result.clientSecret ) ; // Call the callback with the entered credentials
    } ) ;
 }


 /**
  * Initializes a local Express server to handle the OAuth authentication flow
  * with the Moves API.
  * @param {function} cb - Callback function to receive the acquired access token.
  */
 function _initCreateServer ( cb ) {

    var express = require ( 'express' ) ; // Load the Express web framework
    var app = express ( ) ;               // Create an Express application instance


    var moves = new movesApi ( nconf.get ( 'moves' ) ) ; // Initialize Moves API client with stored config


    // Root route redirects the user to the Moves authentication URL
    app.get ( '/', function ( req, res ) {
        res.redirect ( moves.generateAuthUrl ( ) ) ;
    } ) ;


    // OAuth callback route to handle the authorization code from Moves
    app.get ( '/auth', function ( req, res ) {

        if ( req.query.error ) { // Handle any authentication errors returned by Moves
            res.send ( 'Error: ' + req.query.error ) ;
            return ;
        }


        // Exchange the authorization code for an access token
        moves.getAccessToken ( req.query.code, function ( err, accessToken ) {

            if ( err ) { // Handle errors during access token acquisition
                res.send ( 'Error authenticating: ' + err ) ;
                return ;
            }

            res.send ( 'Authentication complete, please return to your terminal.' ) ; // Inform user
            cb ( accessToken ) ; // Pass the access token to the callback
        } ) ;
    } ) ;


    app.listen ( 3000 ) ; // Start the Express server and listen on port 3000
 }


 /**
  * Determines and loads the appropriate export plugin based on parameters.
  * @param {object} exportPlugin - The current export plugin instance (can be null).
  * @param {object} params - Parameters object containing potential 'output' key.
  * @returns {object|null} The instantiated export plugin or null if not found.
  */
 function _getExportFromParameters ( exportPlugin, params ) {

    if ( params.output ) { // If an output plugin name is specified

        var filename = __dirname + '/output/' + params.output + '.js' ; // Construct plugin file path

        if ( !fs.existsSync ( filename ) ) { // Check if the plugin file exists
            return null ; // Return null if the specified plugin file is not found
        }

        // Instantiate the plugin with provided parameters
        exportPlugin = new ( require ( filename ).Plugin ) ( params || { } ) ;
    }

    return exportPlugin ; // Return the determined export plugin instance
 }


 /**
  * Determines the date range for export based on provided parameters.
  * @param {object} range - The initial date range object.
  * @param {object} params - Parameters object containing potential date range keys.
  * @returns {object} The updated date range object.
  */
 function _getDateRangeFromParameters ( range, params ) {

    if ( params.dayStart ) { // If a specific start day is provided
        range.start = moment ( params.dayStart.toString ( ), dateFormat ) ;
    }

    if ( params.dayEnd ) { // If a specific end day is provided
        range.end = moment ( params.dayEnd.toString ( ), dateFormat ) ;
    }

    if ( params.days ) { // If a number of last days is specified
        range.start = moment ( ).subtract ( params.days, 'days' ) ;
        range.end = moment ( ) ;
    }

    if ( params.yesterday ) { // If 'yesterday' is specified
        range.start = moment ( ).subtract ( 2, 'days' ) ;
        range.end = moment ( ).subtract ( 1, 'days' ) ;
    }

    return range ; // Return the updated date range
 }


 /**
  * Prints the application header to the console.
  */
 function _printHeader ( ) {

    console.log ( 'Welcome to Elizabeth, your Moves.app exporter!' ) ;
    console.log ( '----------------------------------------------' ) ;
    console.log ( '' ) ;
 }


 /**
  * Loads configuration from the specified config file path.
  * Exits the process if the 'moves' section is missing, indicating a broken config.
  */
 function _loadConfig ( ) {

    nconf.file ( { file: configFilePath } ) ; // Load configuration file using nconf

    if ( !nconf.get ( 'moves' ) ) { // Check if the 'moves' section exists in the configuration
        console.log ( '> Your config file seems broken :/' ) ;
        process.exit ( 1 ) ;
    }
 }


 /**
  * Synchronously copies a file from a source path to a destination path.
  * @param {string} srcFile - The source file path.
  * @param {string} destFile - The destination file path.
  * @param {string} encoding - The character encoding to use (e.g., 'UTF-8').
  */
 function _copyFileSync ( srcFile, destFile, encoding ) {

  var content = fs.readFileSync ( srcFile, encoding ) ; // Read content from the source file
  fs.writeFileSync ( destFile, content, encoding ) ;   // Write content to the destination file
 }


 exports.Elizabeth = Elizabeth; // Export the Elizabeth class for external use