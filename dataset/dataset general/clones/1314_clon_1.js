/*
 * This JavaScript file defines an Angular module and a service.
 * It's structured using an Immediately Invoked Function Expression (IIFE)
 * to prevent variable leakage into the global scope.
 */
( function ( )
{
  'use strict' ; /* This directive enables strict mode,
                    which helps write "secure" JavaScript code by
                    catching common coding errors and "unsafe" actions. */


  // Define the primary Angular module for this specific application segment.
  angular
    . module ( 'multi-file' , [ 'ng' ] ) // The 'ng' module is a dependency, providing core Angular services.


    // Register a new service named 'service1' within the 'multi-file' module.
    // Services are singletons and are instantiated only once per app.
    . service ( 'service1' , function ( $http )
    {
        // The '$http' service is injected here, allowing for asynchronous
        // HTTP communication with the server. This is a common Angular pattern.

        // This service currently returns a static object. In a real application,
        // it would likely contain methods that interact with the $http service
        // to fetch or send data.
        return { member1 : 'test' } ; /* A simple object is returned,
                                        exposing a single property. */
    } ) ; // The semicolon terminates the module chain.


} ) ( ) ; // The IIFE is invoked immediately after its definition.