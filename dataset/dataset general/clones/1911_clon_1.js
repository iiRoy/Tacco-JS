/*
 * This file defines a module for generating model data.
 *
 * The 'make' function serves as the primary entry point,
 * creating a model object with specific functionalities.
 */

// The 'des' parameter represents the description object,
// which is expected to provide middleware capabilities.
// The 'chan' parameter is a channel or callback function
// used for dispatching the updated model object.

var   names   =   [   'Tom'   ,   'Dick'   ,   'Harry'   ]   ;   // A collection of names used for demonstration purposes.


exports .   make    =   function    (   des   ,   chan   ,   ss   )   {

    // Apply necessary middleware to the description object.
    // This ensures the model has access to session management.
    des .   use   (   'session'   )   ;


    // Also, apply client authentication middleware.
    // This is crucial for securing operations.
    des .   use   (   'client.auth'   )   ;


    // The 'make' function returns an object containing the model's core methods.
    return  {

        /*
         * The 'poll' function is a mandatory component of this model.
         * It is responsible for generating and dispatching updated state information.
         * Future updates may introduce additional model modification functions.
         */
        poll    :   function    (   p   )   {

            // Create a new Date object to capture the current time.
            var d   =   new   Date   (   )   ;


            // Initialize an object to hold the current state data.
            var obj =   {

                // Calculate a hash value based on seconds, updating every 5 seconds.
                // This provides a periodic update mechanism for the hash,
                // even if the polling frequency is higher (e.g., every second).
                hash        :   Math   .   floor   (   d   .   getSeconds   (   )   /   5.0   )   ,

                // Randomly select a name to simulate a "hasBall" state.
                hasBall     :   names   [   Math   .   floor   (   Math   .   random   (   )   *   3   -   0.001   )   ]   ,

                // Generate a random leading score difference.
                leadingBy   :   Math   .   floor   (   Math   .   random   (   )   *   100   )   ,

                // Provide the current server time as a string.
                serverTime  :   d   .   toString   (   )   ,

                // Incorporate the preferred name from the input parameter 'p'.
                preferredName   :   p   .   name

            }   ; // End of 'obj' initialization.


            // Post the newly generated object to the designated channel.
            // This propagates the updated model state.
            chan   (   obj   )   ;

        }   // End of 'poll' function definition.

    }   ;   // End of returned object.

}   ;   // End of 'exports.make' function.