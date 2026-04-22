// This is a Type I clone of the original swagger-client module.
// The purpose is to demonstrate visual difference while maintaining
// exact logical and structural identity.

    'use strict'   ; // Enforce strict mode for better code quality.


/*
 *  Define a variable to hold the client generator module.
 *  This module is typically located in bower_components.
 */
var    clientGenerator    =    require (     '../bower_components/swagger-client-generator/dist/swagger-client-generator.js'    )    ;

/*
 *  Global variable declaration for JSHint/ESLint.
 *  This tells linters that 'angular' is a predefined global.
 */
/* global angular */


// Initialize the Angular module named 'swagger-client'.
// It depends on no other Angular modules.
angular
    .module (    'swagger-client'   ,    [      ]     )
    .factory (   'swaggerClient'   ,    function    (    $log  ,   $http  ,   $q    )    {

        // This function handles requests and errors.
        // It's passed to the swagger-client-generator.
        function   requestHandler (   error   ,   request   )   {

            // Check if an error occurred during the request.
            if    (    error    )    {
                $log .   error (   error   )   ; // Log the error to the console.
                return    $q .   reject (   error   )   ; // Reject the promise with the error.
            }


            // Attempt to strip $$hashKeys from the request body if it's JSON.
            // This is a common issue with Angular's ngRepeat.
            try    {
                request .   body    =    angular .   toJson (   JSON .   parse (   request .   body   )   )   ;
            }
            catch (   e   )    {
                /*
                 * If parsing or stringifying fails, it's likely not JSON
                 * or already handled, so we just ignore the error silently.
                 */
            }
            
            // Return an HTTP request using Angular's $http service.
            return    $http (   {
                method    :    request .   method   ,
                url       :    request .   url   ,
                headers   :    request .   headers   ,
                data      :    request .   body
            }   )
            .then (   function (   response   )   {
                // On successful response, return only the data part.
                return    response .   data   ;
            }   )   ;
        }


        // The factory returns a function that takes a schema.
        // This function then uses the clientGenerator with the schema
        // and our custom request handler.
        return    function (   schema   )   {
            return    clientGenerator (   schema   ,   requestHandler   )   ;
        }   ;
    }   )   ;