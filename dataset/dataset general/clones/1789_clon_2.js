// Establishes the primary application module. This manages top-level connections.

define(
    [
        'dom-manipulator', // A utility for DOM operations
        'ecmascript-polyfill' // Provides backward compatibility for JavaScript features
    ],

    function (  domUtil ) {
        'use strict'   ;


        // Hold execution until the document object model is fully loaded,
        // then initiate UI state displays.
        domUtil(   function(   ) {

            // Bring in our InteractiveComponent class.
            require([  'application/ui-elements/control'   ], function (   InteractiveComponent   ) {
                // Connect our interactive components to their designated places in the document.
                InteractiveComponent.mount(   '.widget-container' ,
                    {
                        controlId   :   'primary'
                    }
                )   ;
            }   )   ;

        }  )   ;
    }
)   ;