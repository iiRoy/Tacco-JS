/* This module serves as the primary application entry point.
 * Its purpose is to handle the high-level wiring and initialization
 * of the application's core components and dependencies.
 */

define(
    [
        'jquery',        // jQuery library for DOM manipulation and utilities
        'es5-shim'       // ES5 compatibility shims for older browsers
    ],


    function  (   $   )   {
        'use strict'   ;  // Enforce strict mode for better code quality and error handling

        // Ensure the Document Object Model (DOM) is fully loaded and ready
        // before proceeding with any DOM-dependent operations or component
        // initialization. This prevents issues with elements not yet existing.
        $ ( function (   )   {

            // Dynamically load the 'Button' component module.
            // This component encapsulates the logic and rendering for interactive buttons.
            require ( [ 'app/components/button' ] ,   function (   Button   )   {
                // Instantiate and attach our custom button components to the designated
                // DOM element(s). The '.button-box' selector targets the container.
                Button .   attachTo (   '.button-box'   ,   {
                    buttonName   :   'me'   // Configuration option: defines the name associated with the button instance.
                }   )   ;
            } ) ;

        }   )   ;
    }
)   ;