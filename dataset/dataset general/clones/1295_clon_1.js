var    hapi    =    {}; // Initialize the main HAPI object.


/*
 *  HAPI_VERB: A constant object mapping standard HTTP verbs to descriptive strings.
 *  These strings are used within success responses to indicate the action performed.
 */
hapi.HAPI_VERB  =
{
    get     :   "getting",          // Represents a GET operation.
    create  :   "creating",         // Represents a POST operation (creation).
    update  :   "changing",         // Represents a PUT/PATCH operation (modification).
    delete  :   "deleting"          // Represents a DELETE operation.
};


// ----------------------------------------------------------------------------------------------------
// Function: makeHAPISuccess
// Description: Creates a standardized success response object for the HAPI.
// Parameters:
//   - HAPI_VERB: The action verb (e.g., "getting", "creating").
//   - resourceType: The type of resource being acted upon (e.g., "user", "product").
//   - data: The actual data payload to be returned with the success.
// Returns: A HAPI-compliant success response object.
// ----------------------------------------------------------------------------------------------------
hapi.makeHAPISuccess = function (   HAPI_VERB,
                                     resourceType,
                                     data
                                 )
{
    /*
     *   Construct the HAPI response object.
     *   It follows a predefined structure for consistency.
     */
    var hapiResponse    =
            {
                "this"      :   "succeeded",    // Status indicator.
                "by"        :   HAPI_VERB,      // The verb that was performed.
                "the"       :   resourceType,   // The resource type.
                "with"      :   data            // The associated data.
            }
        ;


    // Return the generated success response.
    return (
            hapiResponse
           );
}


// ----------------------------------------------------------------------------------------------------
// Function: makeHAPIFailure
// Description: Creates a standardized failure response object for the HAPI.
// Parameters:
//   - why: A descriptive message explaining the reason for the failure.
//   - apiErrorCode: The specific API error code (often an HTTP status code).
// Returns: A HAPI-compliant failure response object.
// ----------------------------------------------------------------------------------------------------
hapi.makeHAPIFailure    =   function (  why,
                                         apiErrorCode
                                     )
{
    // Define the structure for a failure response.
    var hapiResponse = {
        "this"      :   "failed",       // Status indicator.
        "with"      :   apiErrorCode,   // The API error code.
        "because"   :   why             // The reason for failure.
    };


    // Send back the failure response.
    return hapiResponse;
}



/**
 *  @function middleware
 *  @description
 *      This factory function returns an Express/Connect-compatible middleware.
 *      The middleware extends the `res` object with HAPI-specific response methods.
 *  @returns {function} The hapiMiddleware function.
 */
function middleware()
{
    /**
     *  @function hapiMiddleware
     *  @param {object} req - The request object.
     *  @param {object} res - The response object.
     *  @param {function} next - The next middleware function in the stack.
     *  @description
     *      Attaches helper functions to the response object for sending HAPI-formatted responses.
     */
    function hapiMiddleware(req,res,next)
    {
        // Helper function to send a HAPI success response.
        res.sendHAPISuccess = function (   HAPI_VERB,
                                           resourceType,
                                           data
                                       )
        {
            // Delegates to the core makeHAPISuccess function and sends the result.
            res.send(hapi.makeHAPISuccess( HAPI_VERB,
                                           resourceType,
                                           data
                                         ));
        }

        // Helper function to send a HAPI failure response.
        res.sendHAPIFailure = function (   why,
                                           apiErrorCode
                                       )
        {
            // Delegates to the core makeHAPIFailure function and sends the result.
            res.send(hapi.makeHAPIFailure( why,
                                           apiErrorCode
                                         ));
        }

        // Helper function for a specific 'Not Found' failure.
        res.sendHAPINotFoundFailure = function ()
        {
            // Uses the general failure sender with a predefined message and status code.
            res.sendHAPIFailure(    "we couldn't find this",
                                    404
                                );
        }

        // Call the next middleware in the chain.
        return  (   next()  );
    }

    // Return the configured middleware function.
    return ( hapiMiddleware );
}


// Expose the middleware factory function through the hapi object.
hapi.middleware = middleware;


/*
 *  Module Export:
 *  Makes the entire hapi object available for other modules to import and use.
 */
module.exports  =   hapi;