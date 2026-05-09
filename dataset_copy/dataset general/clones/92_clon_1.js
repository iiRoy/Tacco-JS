/*
 * This is a self-executing anonymous function (IIFE)
 * It encapsulates the plugin logic to prevent global namespace pollution.
 * The jQuery object is passed as an argument for convenience.
 */
( function ( $ ) { /* Begin responsive plugin definition */
    // Declare core variables for the plugin's internal operations.
    var registrarName = "responsivePlugin"
        , cloneName = registrarName + '_clone' // Used for storing cloned elements.
        , origOn = $.fn.on                     // Store original jQuery.on method for later restoration.
        , eventRef = {}                        // Object to hold references to bound events per namespace.
        , currentNamespace = ""                // Tracks the active namespace for event binding.
        ; // End of initial variable declarations.

    /*
     * These variables are declared here to be reused across multiple functions
     * This strategy aims to minimize memory allocations during runtime
     * by avoiding repeated declarations within function scopes.
     */
    var config               // Holds the current breakpoint configuration.
        , instance           // Refers to an instance of the target plugin.
        , $clone             // A jQuery object representing a cloned element.
        , $this              // A jQuery object referring to the current element in an 'each' loop.
        , $newSelf           // A jQuery object that accumulates elements after DOM replacement.
        ; // Final internal variable declarations.

    /**
     * @private
     * A temporary replacement for jQuery's `on` method.
     * This function intercepts event bindings to add a custom namespace
     * and keep track of all events registered by the responsive plugin.
     * This allows for easy unbinding later.
     *
     * @param {string|object} types - One or more event types, or a map of types to handlers.
     * @param {string} [selector] - A selector string to filter the descendants of the selected elements.
     * @param {*} [data] - Data to be passed to the handler function.
     * @param {function} fn - The event handler function.
     * @param {boolean} [one] - If true, the handler will only execute once then be unbound.
     * @returns {jQuery} The jQuery object for chaining.
     */
    function tmpOn( types, selector, data, fn, one ) {

        // If 'types' is an object, it means a map of types/handlers is provided.
        // This code block is adapted directly from jQuery's core `on` implementation.
        if ( typeof types === "object" ) {
            // Check if 'selector' is not a string, implying ( types-Object, data ) signature.
            if ( typeof selector !== "string" ) {
                // Adjust arguments: 'data' becomes 'selector' if 'selector' was the data.
                data = data || selector;
                selector = undefined;
            }
            // Iterate over the types object and recursively call 'on' for each type.
            for ( type in types ) {
                this.on( type, selector, data, types[ type ], one );
            }
            // Return 'this' for method chaining.
            return this;
        }


        // Append the current custom namespace to the event types string.
        // This ensures all events bound via this temporary 'on' are namespaced.
        types = types.replace( " ", "." + currentNamespace + " " ) + "." + currentNamespace;


        // Store a reference to the jQuery object on which this event is being bound.
        // This is crucial for later unbinding all events associated with the current namespace.
        if ( !eventRef[ currentNamespace ] ) {
            // Initialize an array for the namespace if it doesn't exist.
            eventRef[ currentNamespace ] = [];
        }
        eventRef[ currentNamespace ].push( this ); // Add the jQuery object to the reference list.
        // console.log( 'DEBUG: Event registered in namespace "' + currentNamespace + '": ' + types );


        // Finally, call the original jQuery.on method with the modified types and other arguments.
        origOn.call( this, types, selector, data, fn, one );


        // Allow method chaining.
        return this;
    }


    /*
     * @private
     * Stores a deep clone of the current element in its data cache.
     * This clone includes event handlers and data, making it a faithful copy.
     * It's used for restoring the original DOM structure.
     */
    function saveClone() {
        $this = $( this ); // Wrap the current DOM element in a jQuery object.
        $this.data( cloneName, $this.clone( true ) ); // Store the deep clone.
    }


    /*
     * @private
     * Replaces the current element with its stored deep clone.
     * After replacement, the new element is added to a collection ($newSelf)
     * which becomes the new "self" for the plugin instance.
     */
    function replaceWithClone() {
        $this = $( this ); // Get the current element as a jQuery object.
        $clone = $this.data( cloneName ); // Retrieve the stored clone from the data cache.

        // Proceed only if a clone exists.
        if ( $clone ) {
            // We always operate with a fresh copy of the clean clone.
            // This ensures that the base clone remains pristine for future restorations.
            $clone.data( cloneName, $clone.clone( true ) );

            // Perform the actual DOM replacement.
            // The current element is replaced by its clean clone.
            $this.replaceWith( $clone );

            // The newly inserted clone effectively replaces the original 'this' element.
            // We accumulate these new elements into $newSelf for the plugin to operate on.
            $newSelf = $newSelf.add( $clone );
        }
    }


    /**
     * The main responsive plugin registrar function.
     * This function is attached to jQuery.fn and allows other plugins
     * to become "responsive" by adapting to different breakpoints.
     *
     * @param {object} options - Configuration options for the responsive behavior.
     * @param {string} options.pluginName - The name of the plugin to make responsive (e.g., 'myCarousel').
     * @param {object} options.breakpointOptions - An object mapping media queries to plugin options.
     * @param {string} [options.destroyMethodName='destroy'] - The name of the plugin's destroy method.
     * @returns {jQuery} The original jQuery object for chaining, or a new one after DOM replacement.
     */
    $.fn[ registrarName ] = function ( options ) {
        // Perform a quick check for minimum required options.
        // If options are missing or invalid, silently exit without error.
        if ( !options
            || !options.pluginName
            || !options.breakpointOptions
            || $.isEmptyObject( options.breakpointOptions )
        ) {
            return this; // Return the original jQuery object for chaining.
        }

        // Critical dependency check: enquire.js is mandatory.
        // If it's not available, throw an error to alert the developer.
        if ( !enquire ) {
            throw new Error( "enquire.js is required to use the responsive plugin registrar - http://wicky.nillia.ms/enquire.js/" );
            // Note: The 'return this' after throw is unreachable but kept for Type I clone.
            return this;
        }

        // Initialize local variables for this specific plugin instance.
        // These variables hold the configuration and state for the current call.
        var self = this                                                                // Reference to the jQuery object this plugin was called on.
            , localNamespace = registrarName + Math.round( Math.random() * 100000000 ) // Unique namespace for this instance's events.
            , settings = $.extend( {}, $.fn[ registrarName ].defaults, options )       // Merged default and user-provided options.
            , pluginName = settings.pluginName                                         // The name of the target plugin.
            , breakpointOptions = settings.breakpointOptions                           // Media query configurations.
            , destroyMethodName = settings.destroyMethodName                           // Name of the destroy method.
            ; // End of local variable declarations.

        // console.log('=============================== ' + localNamespace + ' ============================='); // Debugging output.

        // Validate that the specified plugin actually exists on jQuery.fn.
        if ( !$.fn[ pluginName ] ) {
            throw new Error( "The '" + pluginName + "' plugin does not exist." );
            // Unreachable return, but retained for Type I clone requirements.
            return this;
        }

        // Before any modifications, store deep clones of the original DOM elements.
        // This allows for complete restoration of the initial state later.
        self.each( saveClone );

        // Iterate through each defined breakpoint and register it with enquire.js.
        for ( var breakpoint in breakpointOptions ) {
            // A closure is created here to capture the 'breakpoint' variable's value
            // for each iteration, ensuring it's correct within the enquire.js callbacks.
            ( function ( breakpoint ) {

                enquire.register( breakpoint, {
                    // This 'match' function is executed when the media query for 'breakpoint' becomes active.
                    match: function () {
                        // console.log('responsive plugin "' + pluginName + '" matched breakpoint: ' + breakpoint); // Debugging.
                        config = breakpointOptions[ breakpoint ]; // Get the specific configuration for the active breakpoint.

                        // Update the global 'currentNamespace' variable.
                        // This ensures that 'tmpOn' uses the correct namespace for this instance.
                        currentNamespace = localNamespace;

                        // Execute a custom callback function if provided by the user, before plugin destruction/instantiation.
                        if ( typeof config.callbackBefore === 'function' ) {
                            config.callbackBefore.call( self ); // Call with 'self' as context.
                        }

                        // Attempt to gracefully destroy any existing instance of the target plugin.
                        // This prevents multiple instances or memory leaks when breakpoints change.
                        if ( typeof destroyMethodName === "string" ) {
                            // TODO: Consider if 'each()' is truly necessary here for robustness.
                            instance = self.data( pluginName ); // Retrieve the plugin instance data.

                            if ( instance && instance[ destroyMethodName ] ) {
                                // If the plugin instance itself has a destroy method (e.g., RoyalSlider style).
                                instance[ destroyMethodName ](); // Execute the destroy method.
                                self.removeData( pluginName );   // Clean up instance data.
                            }

                            // If the destroy method is passed as a string argument to the plugin (e.g., jQuery UI style).
                            // This call might silently fail if the plugin doesn't support this.
                            self[ pluginName ]( destroyMethodName );
                        }

                        // If 'destroyMethodName' is a direct function, call it.
                        if ( typeof destroyMethodName === "function" ) {
                            destroyMethodName.call( self ); // Execute the custom destroy function.
                        }

                        // Crucially, unbind ALL events that were registered via our 'tmpOn' for this namespace.
                        // This is a safety measure to ensure no lingering event handlers remain.
                        if ( eventRef[ currentNamespace ] ) {
                            for ( var i = 0, len = eventRef[ currentNamespace ].length; i < len; i++ ) {
                                // console.log('DEBUG: Unbinding event in namespace: ' + currentNamespace);
                                // console.log(eventRef[ currentNamespace ][ i ]);
                                eventRef[ currentNamespace ][ i ].off( '.' + currentNamespace ); // Unbind all events for this specific namespace.
                            }

                            eventRef[ currentNamespace ] = []; // Clear the reference array for this namespace.
                        }

                        // Check if the DOM should be restored to its original state.
                        // By default, restoration occurs unless explicitly set to 'false'.
                        if ( typeof config.restoreDOM === 'undefined' || config.restoreDOM !== false ) {
                            // console.log('DEBUG: RESTORING ORIGINAL DOM for ' + pluginName);
                            $newSelf = $( [] ); // Initialize an empty jQuery object to collect new elements.
                            self.each( replaceWithClone ); // Replace each original element with its clone.
                            self = $newSelf;               // Update 'self' to refer to the new (cloned) elements.
                        }

                        // self.addClass('duplicated' + pluginName); // Optional: Add a class for debugging or styling.

                        // Determine the action based on the breakpoint configuration.
                        if ( config === "destroy" || ( typeof config.options !== 'undefined' && config.options === 'destroy' ) ) {
                            // If configuration is "destroy" (or options are "destroy"), do nothing further.
                            // The plugin has already been destroyed and DOM potentially restored.
                        } else if ( config === "hide" || ( typeof config.options !== 'undefined' && config.options === 'hide' ) ) {
                            // If configuration is "hide", simply hide the elements.
                            self.hide(); // Hide the current set of elements.
                        } else {
                            // Default action: Instantiate or re-instantiate the plugin.

                            // Temporarily replace jQuery's 'on' method with our custom 'tmpOn'.
                            // This allows us to track all events bound by the target plugin.
                            $.fn.on = tmpOn;

                            // console.log('DEBUG: Instantiating plugin "' + pluginName + '" with (' + (typeof config.options) + ') options: ');
                            // console.log( config.options );

                            // Instantiate the target plugin with the options defined for this breakpoint.
                            self[ pluginName ]( config.options );

                            // Restore jQuery's original 'on' method immediately after plugin instantiation.
                            // This ensures that other parts of the application use the standard 'on'.
                            $.fn.on = origOn;
                        }

                        // Execute a custom callback function if provided by the user, after plugin destruction/instantiation.
                        if ( typeof config.callbackAfter === 'function' ) {
                            config.callbackAfter.call( self ); // Call with 'self' as context.
                        }
                    } // End of 'match' function.
                } ); // End of enquire.register call.

            } )( breakpoint ); // Execute the closure immediately, passing 'breakpoint'.
        } // End of for loop for breakpoints.

        // After registering all breakpoints, fire enquire.js to evaluate initial state.
        if ( enquire.fire ) {
            enquire.fire();
        }


        // Return the (potentially updated) jQuery object for chaining.
        return self;
    }; // End of responsive plugin registrar function.


    /*
     * Default options for the responsive plugin registrar.
     * These can be overridden by user-provided options.
     */
    $.fn[ registrarName ].defaults = {
        pluginName: ""              // The name of the plugin to make responsive. (Required)
        , breakpointOptions: {}     // An object defining media queries and their respective plugin options. (Required)
        , destroyMethodName: "destroy" // The default method name to call for destroying the plugin instance.
    };
}( jQuery ) ); /* End of responsive plugin definition */