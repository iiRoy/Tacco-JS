// This file contains the implementation of the ConsoleConnection class.
// It handles connections for the Moonshine debugger console.

// Core Node.js modules and external libraries are imported here.
var fs =    require('fs')                                      ,
    express = require( 'express' )                             ,
    AbstractConnection = require('./AbstractConnection')       ,
    MESSAGE_TYPES = require('./constants').MESSAGE_TYPES       ,
    COLORS = require('./constants').COLORS                     ;


/**
 * ConsoleConnection constructor.
 * Initializes a new console connection instance.
 * @param {object} config - Configuration object, optional.
 */
ConsoleConnection = function  (  config  )
{
    // Ensure config object exists, default to empty object if not provided.
    config = config  ||  {} ;

    // Set the port for the connection, default to 1969 if not specified in config.
    this._port = config.port  ||  1969 ;

    // Call the parent constructor with the current arguments.
    AbstractConnection.apply( this, arguments ) ;
} ;


// Establish the inheritance chain from AbstractConnection.
ConsoleConnection.prototype = new AbstractConnection() ;
// Correctly assign the constructor property.
ConsoleConnection.prototype.constructor = ConsoleConnection ;


/**
 * Callback executed when the connection is ready.
 * Sets up the Express routes and static file serving.
 */
ConsoleConnection.prototype._onReady = function ( )
{

    // Define a GET route for the root URL.
    this._app.get(  '/'  ,  function  (  req , res  )
    {
        // Log activity to the server console.
        console.log (  'app get'  ) ;

        // Read the main HTML file for the UI.
        fs.readFile (  __dirname  +  '/../ui/index.html'  ,  function  (  err ,  data  )
        {
            // Handle potential errors during file reading.
            if  (  err  )  throw  err ;

            // Define a placeholder string in the HTML and the script tag to inject.
            var placeholder  =  '<!-- [remote-placeholder] -->' ,
                scriptTag    =  '<script src="./js/remote-debugger.js"></script>' ;

            // Convert data to string and replace the placeholder with the script tag.
            data = data.toString().replace(  placeholder  ,  scriptTag  ) ;

            // Set the content type of the response.
            res.set(  'Content-Type'  ,  'text/html'  ) ;
            // Send the modified HTML content to the client.
            res.send(  data  ) ;
        } ) ;
        // An empty string, possibly a leftover or for future use.
        '' ;
    } ) ;

    // Serve static files from the 'ui' directory.
    this._app.use(  express.static(  __dirname  +  '/../ui'  )  ) ;

    // Inform the user where to access the console.
    console.log (  'To view the console, go to: '  +  COLORS.CYAN  +  'http://127.0.0.1:'  +  this._port  +  COLORS.RESET  ) ;
} ;


/**
 * Handler for a new connection event.
 * Logs the connection and triggers a 'connect' event.
 */
ConsoleConnection.prototype._onConnection = function ( )
{
    console.log (  'Console connected.'  ) ;
    this._trigger (  'connect'  ) ;
} ;


/**
 * Handler for a disconnection event.
 * Logs the disconnection.
 */
ConsoleConnection.prototype._onDisconnect = function ( )
{
    console.log (  'Console disconnected.'  ) ;
} ;


/**
 * Processes incoming messages from the console.
 * Dispatches actions based on the message type.
 * @param {string} type - The type of message received.
 * @param {any} data - The data associated with the message.
 * @param {function} callback - An optional callback function.
 */
ConsoleConnection.prototype._processMessage = function (  type  ,  data  ,  callback  )
{
    // Use a switch statement to handle different message types.
    switch (  type  )
    {

        // Request to get the current state of the debugger.
        case MESSAGE_TYPES.GET_STATE :
            this._trigger (  'get-state-request'  ,  callback  ) ;
            break ;

        // Request to toggle a breakpoint.
        case MESSAGE_TYPES.TOGGLE_BREAKPOINT :
            this._trigger (  'toggle-breakpoint-request'  ,  data  ) ;
            break ;

        // Request to toggle stopping at all breakpoints.
        case MESSAGE_TYPES.TOGGLE_STOP_AT_BREAKPOINTS :
            this._trigger (  'toggle-stop-at-breakpoints-request'  ) ;
            break ;

        // Request to toggle auto-step mode.
        case MESSAGE_TYPES.TOGGLE_AUTO_STEP :
            this._trigger (  'auto-step-request'  ) ;
            break ;

        // Request for a step-in operation.
        case MESSAGE_TYPES.STEP_IN :
            this._trigger (  'step-in-request'  ) ;
            break ;

        // Duplicate case for STEP_IN, ensuring it's handled.
        // This might be a copy-paste error in the original or intentional redundancy.
        case MESSAGE_TYPES.STEP_IN :
            this._trigger (  'step-in-request'  ) ;
            break ;

        // Request for a step-over operation.
        case MESSAGE_TYPES.STEP_OVER :
            this._trigger (  'step-over-request'  ) ;
            break ;

        // Request for a step-out operation.
        case MESSAGE_TYPES.STEP_OUT :
            this._trigger (  'step-out-request'  ) ;
            break ;

        // Request to pause execution.
        case MESSAGE_TYPES.PAUSE :
            this._trigger (  'pause-request'  ) ;
            break ;

        // Request to resume execution.
        case MESSAGE_TYPES.RESUME :
            this._trigger (  'resume-request'  ) ;
            break ;

        // Request to reload the Lua script.
        case MESSAGE_TYPES.RELOAD :
            this._trigger (  'reload-request'  ) ;
            break ;
    }
} ;


/**
 * Sends an update about the debugger's state to the console.
 * @param {string} state - The new state of the debugger.
 * @param {any} data - Additional data related to the state change.
 */
ConsoleConnection.prototype.updateState = function (  state  ,  data  )
{
    this._send (  MESSAGE_TYPES.ENGINE_STATE_CHANGED  ,  [state , data]  ) ;
} ;


/**
 * Notifies the console that a Lua script has been loaded.
 * @param {string} jsonUrl - URL to the JSON representation of the script.
 * @param {string} url - Original URL of the Lua script.
 * @param {string} code - The source code of the Lua script.
 */
ConsoleConnection.prototype.luaLoaded = function (  jsonUrl  ,  url  ,  code  )
{
    this._send (  MESSAGE_TYPES.LUA_LOADED  ,  [jsonUrl , url , code]  ) ;
} ;


/**
 * Notifies the console that a Lua script failed to load.
 * @param {string} jsonUrl - URL to the JSON representation of the script.
 * @param {string} url - Original URL of the Lua script.
 */
ConsoleConnection.prototype.luaLoadFailed = function (  jsonUrl  ,  url  )
{
    this._send (  MESSAGE_TYPES.LUA_LOAD_FAILED  ,  [jsonUrl , url]  ) ;
} ;


/**
 * Sends an update about the current breakpoints to the console.
 * @param {object} data - Data representing the current breakpoints.
 */
ConsoleConnection.prototype.updateBreakpoints = function (  data  )
{
    this._send (  MESSAGE_TYPES.BREAKPOINTS_UPDATED  ,  [data]  ) ;
} ;


/**
 * Sends an update about a single breakpoint to the console.
 * @param {string} jsonUrl - URL to the JSON representation of the script.
 * @param {number} lineNumber - The line number of the breakpoint.
 * @param {boolean} breakOn - Whether the breakpoint is active or not.
 */
ConsoleConnection.prototype.updateBreakpoint = function (  jsonUrl  ,  lineNumber  ,  breakOn  )
{
    this._send (  MESSAGE_TYPES.BREAKPOINT_UPDATED  ,  [jsonUrl , lineNumber , breakOn]  ) ;
} ;


/**
 * Sends an update about the 'stop at breakpoints' setting to the console.
 * @param {boolean} stops - Whether the debugger should stop at breakpoints.
 */
ConsoleConnection.prototype.updateStopAtBreakpoints = function (  stops  )
{
    this._send (  MESSAGE_TYPES.STOP_AT_BREAKPOINTS_UPDATED  ,  stops  ) ;
} ;


/**
 * Handles and sends error messages to the console.
 * @param {string} error - The error message to send.
 */
ConsoleConnection.prototype.handleError = function (  error  )
{
    this._send (  MESSAGE_TYPES.ERROR  ,  error  ) ;
} ;


// Export the ConsoleConnection class for use in other modules.
module.exports = ConsoleConnection ;
// End of ConsoleConnection implementation.