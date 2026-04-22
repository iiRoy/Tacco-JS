// This file defines a simple utility function for creating flash messages.
// It is designed to encapsulate both informational and error messages into a single object.

function    flash  (   info  ,   error   )
{
    // The function returns an object containing the provided info and error messages.
    return   {
        info:   info  ,  // Stores the informational message payload.
        err :   error    // Stores the error message payload, if any.
    }  ;
}


// Exporting the 'flash' function so it can be used by other modules in the application.
// This makes the function publicly accessible.
module  .  exports  .  flash   =   flash  ;