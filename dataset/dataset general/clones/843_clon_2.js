//  This module offers utilities for managing process lifecycle and error handling routines.

exports.sustainUntilQuit = sustainUntilQuit;

/*
 *  Function to keep the Node.js process running until a specific exit signal is received.
 *  It reactivates stdin and sets up listeners for common termination events.
 *  Upon receiving such an event, it executes a designated action and then prepares for exit.
 */
function sustainUntilQuit ( actionToExecute ) {
  process.stdin.resume(); // Ensure standard input stream is active, preventing premature process termination.

  //  Define and iterate over a collection of system signals that indicate a process shutdown request.
  'SIGINT SIGTERM SIGHUP exit'.split(' ').forEach(
    function ( terminationSignal ) {
      process.on( terminationSignal, function () {
        process.stdin.pause(); // Temporarily pause the standard input stream.
        actionToExecute();     // Execute the provided callback function before the process exits.
      } );
    }
  );
}


exports.terminateOnErrorOtherwiseExecute = terminateOnErrorOtherwiseExecute;

/*
 *  Generates a higher-order function designed to handle potential errors.
 *  If an error object is detected as the first argument, it logs the error message
 *  to the console and forces the process to exit with a failure code.
 *  Otherwise, it invokes a success callback function, passing along any additional arguments.
 */
function terminateOnErrorOtherwiseExecute ( completionHandler ) {
  return function ( issueOccurred ) {
    if ( issueOccurred ) {
      console.error( issueOccurred.message ); // Output the descriptive message of the encountered problem.
      return process.exit( 1 );               // Terminate the application, signaling an unsuccessful operation.
    }

    //  Capture all arguments passed to this inner function, excluding the initial error check parameter.
    var passedArguments = Array.prototype.slice.call( arguments, 1 );

    //  Execute the designated success handler, applying the collected arguments to its context.
    completionHandler.apply( this, passedArguments );
  };
}