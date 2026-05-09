/*
 * This module provides a utility function for creating isolated RequireJS contexts.
 * It is particularly useful for testing purposes, allowing for module stubbing.
 */

define(
    [
        'underscore' // External dependency: Underscore.js library
    ]
    ,
    function()
    {

        // A simple counter to ensure unique context names and stub identifiers.
        // Initialized to zero, incremented with each new context creation.
        var   cnt   =   0
        ;


        /**
         * Creates and configures a new RequireJS context with specified module stubs.
         *
         * @param {Object} stubs - An object where keys are module IDs to be stubbed
         *                         and values are the desired stubbed content for those modules.
         * @returns {Object} The configured RequireJS context object.
         */
        var createContext = function(  stubs  )
        {
            var   map   =   {}
            ; // This object will hold the mapping from original module IDs to their generated stub names.

            cnt++; // Increment the global counter to ensure uniqueness for the current context.


            // Iterate over each entry in the 'stubs' object provided by the caller.
            // For each stub, a unique RequireJS module will be defined.
            _.each(  stubs,  function(  value,  key  )
            {
                // Generate a unique name for the stub module.
                // The name incorporates 'stub', a sanitized version of the original module key,
                // and the current counter value to prevent naming collisions.
                var   stubName   =   [  'stub',  key.replace(  /\//g,  '_'  ),  cnt  ].join(  '_'  )
                ;

                // Store the mapping: the original module ID (key) maps to the new stub module name.
                map[  key  ]   =   stubName
                ;

                // Dynamically define a new RequireJS module using the generated stubName.
                // This module simply returns the 'value' provided in the stubs object.
                define(  stubName,  function()
                {
                    return  value
                    ; // The actual stubbed content.
                }  )
                ;

            }  )
            ; // End of _.each loop.


            // Configure and return a new RequireJS context.
            // This context will use the generated stub mappings.
            return  require.config(
                {
                    context:  "context_"  +  cnt, // A unique name for this RequireJS context.
                    map:  {
                        "*":   map // Apply the stub mappings across all modules within this context.
                    },
                    baseUrl:  require.s.contexts._.config.baseUrl // Inherit the base URL from the default RequireJS context.
                }
            )
            ;

        }
        ; // End of createContext function definition.


        // Export the createContext function as the public interface of this module.
        return   createContext
        ;

    }
)
; // End of define call.