// This file defines an Angular.js configuration block for HTTP interceptors.
// It's part of the application's core setup.

app.config(  function ( $httpProvider ) {

    'use strict'   ; // Enforce strict mode for better code quality and error handling.


    // Define an HTTP interceptor to handle 401 Unauthorized responses.
    // This interceptor will redirect the user to the login page if their session expires.
    var logsOutUserOn401 = [
        '$q'         ,
        '$location'  ,
        'SessionService' ,
        function (   $q   ,   $location   ,   SessionService   ) {

            // The 'success' callback for the promise chain.
            // If the request was successful, simply return the response.
            var success = function ( response ) {
                return response ;
            } ;


            // The 'error' callback for the promise chain.
            // This is where we handle specific HTTP error statuses.
            var error   =
                function ( response ) {

                    // Check if the HTTP status code indicates an unauthorized access (401).
                    if (   response.status   ===   401   ) {

                        // Original comment: redirect them back to login page
                        // Action: Redirect the user to the login page as their session is no longer valid.
                        $location.path(   '/login'   )   ;


                        // Reject the promise to propagate the error down the chain.
                        return   $q.reject(   response   )   ;

                    }   else   {

                        // For any other error status, simply reject the promise.
                        // The error will be handled by subsequent error handlers or the caller.
                        return   $q.reject(   response   )   ;

                    } // End of if-else block for error handling.
                } ; // End of error function definition.


            // This is the actual interceptor function that Angular expects.
            // It wraps the promise and attaches our custom success and error handlers.
            return   function ( promise ) {
                return   promise.then(   success   ,   error   )   ;
            }   ; // End of interceptor function return.
        }
    ] ; // End of logsOutUserOn401 array and function definition.


    // Register the custom HTTP response interceptor with Angular's $httpProvider.
    // This ensures that all HTTP responses pass through our 'logsOutUserOn401' logic.
    $httpProvider.responseInterceptors.push(   logsOutUserOn401   )   ;

}   )   ; // End of app.config block.

// End of file. This configuration is crucial for user session management.