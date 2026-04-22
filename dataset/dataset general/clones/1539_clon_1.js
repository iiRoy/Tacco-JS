/*
 * This module exports a utility function for throttling.
 * Throttling ensures a function is called at most once within a specified time frame.
 */
exports.throttle = function (  func,   wait  ) {
    // Declare a variable to hold the timeout ID.
    // This variable will act as a flag to prevent multiple calls within the wait period.
    var timeout;


    // Return a new function that will manage the throttling logic.
    return function ( ) {
        // Capture the current context and arguments for later use.
        var context = this,
            args    = arguments;

        // Check if there's an active timeout.
        // If 'timeout' is null or undefined, it means the function can be executed.
        if (  !timeout  ) {
            /*
             * This block executes only when there is no active timeout.
             * It means this is either the very first call, or enough time
             * has passed since the last execution for the previous timeout
             * to have cleared.
             *
             * Set up a timer. This timer will:
             * 1. Block subsequent calls to the throttled function until it fires.
             * 2. When it fires, it will reset the 'timeout' variable,
             *    allowing the function to be called again after 'wait' milliseconds.
             */
            timeout = setTimeout(  function (  ) {
                // Clear the timeout reference, making the function callable again.
                timeout = null;


                // Attempt to execute the original function with the captured context and arguments.
                try {
                    func.apply(  context,   args  );
                }
                // If any error occurs during the execution of the original function, catch it.
                catch (  err  ) {
                    // Log the error to the console.
                    console.log(  err  );
                }
            },   wait  ); // The delay before the function is actually executed.
        }
        // If 'timeout' is not null, it means a timer is already active,
        // so we do nothing, effectively throttling the call.
    };
}; // End of exports.throttle function definition.