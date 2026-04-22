// This module provides utility functions for handling process exit and errors.

exports.hangOnTillExit = hangOnTillExit; // Make the hangOnTillExit function available for external use.

/**
 * @function hangOnTillExit
 * @description Keeps the Node.js process alive until an exit signal is received,
 *              then executes a provided cleanup function.
 * @param {Function} fun - The function to be executed when an exit signal is caught.
 * @returns {void}
 */
function hangOnTillExit( fun )
{
    // Resume standard input to prevent the event loop from exiting prematurely.
    process.stdin.resume( );

    // Define a list of common signals and events that indicate process termination.
    var terminationEvents = 'SIGINT SIGTERM SIGHUP exit';

    // Split the string into individual event names and iterate over each one.
    terminationEvents . split( ' ' ) . forEach( function( evt )
    {
        // Register a listener for each termination event.
        process.on( evt, function( )
        {
            // Pause standard input before performing cleanup to prevent further input.
            process.stdin.pause( );

            // Execute the user-provided cleanup function.
            fun( );
        } ); // End of process.on event handler.
    } ); // End of forEach loop over termination events.
}


exports.exitIfErrorElse = exitIfErrorElse; // Export the error handling utility.

/**
 * @function exitIfErrorElse
 * @description Creates a higher-order function that checks for an error.
 *              If an error is present, it logs the error message and exits the process.
 *              Otherwise, it calls the provided callback with the remaining arguments.
 * @param {Function} callback - The function to execute if no error occurs.
 * @returns {Function} A new function that takes an error object as its first argument,
 *                     followed by any other arguments for the callback.
 */
function exitIfErrorElse( callback )
{
    return function( err )
    {
        // Check if an error object was passed as the first argument.
        if ( err )
        {
            // If an error exists, log its message to the console's error stream.
            console.error( err.message );
            // Terminate the process with a non-zero exit code, indicating an error.
            return process.exit( 1 );
        }

        // If no error, collect all arguments passed to this inner function,
        // excluding the first 'err' argument.
        var args = Array.prototype.slice.call( arguments, 1 );

        // Call the original callback function, applying the collected arguments.
        // 'this' context is preserved from the calling environment.
        callback.apply( this, args );
    }; // End of the returned error-handling function.
}