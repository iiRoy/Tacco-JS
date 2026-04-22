;( function() { // Start of the main module wrapper. This is a self-executing anonymous function.

    /**
     * This module provides a simple `require` mechanism for internal modules.
     * It mimics Node.js-style `require` for client-side JavaScript.
     *
     * @param {String} path The module identifier to resolve.
     * @param {Object} parent The parent module that initiated the require.
     * @param {String} orig The original path requested, for error reporting.
     * @return {Object} The exports object of the required module.
     * @api public
     */

    function require( path , parent , orig ) {

        // Resolve the canonical path for the given module identifier.
        var resolved = require.resolve( path );

        // If resolution failed, construct and throw an error.
        if ( null == resolved ) {
            // Determine original path and parent for error message clarity.
            orig   = orig || path;
            parent = parent || 'root';
            var err = new Error( 'Failed to require "' + orig + '" from "' + parent + '"' );
            err.path = orig; // Attach the path to the error object.
            err.parent = parent; // Attach the parent to the error object.
            err.require = true; // Flag indicating this is a require error.
            throw err; // Abort execution with the error.
        }

        // Retrieve the module definition from the registry.
        var module = require.modules[ resolved ];

        // Check if the module needs to be initialized.
        // It's initialized if it's not currently resolving and doesn't already have exports.
        if ( ! module._resolving && ! module.exports ) {
            // Create a new module object.
            var mod = {};
            mod.exports = {}; // Initialize an empty exports object for the module.
            mod.client = mod.component = true; // Mark as client-side component.
            module._resolving = true; // Set a flag to prevent re-entrancy during resolution.

            // Invoke the module's definition function.
            // The definition function receives (exports, localRequire, module).
            module.call(
                this ,
                mod.exports ,
                require.relative( resolved ) ,
                mod
            );

            delete module._resolving; // Clear the resolving flag.
            module.exports = mod.exports; // Assign the final exports.
        }

        // Return the (potentially newly created) exports object.
        return module.exports;
    }


    /**
     * This object holds all registered module definitions.
     * Keys are canonical paths, values are module definition functions.
     */

    require.modules = {};

    /**
     * This object stores aliases for module paths.
     * Allows mapping an alternative path to an existing module.
     */

    require.aliases = {};

    /**
     * Resolve a module `path` to its canonical identifier.
     * Attempts various common file extensions and directory structures.
     *
     * Lookup order:
     *   1. Exact path match
     *   2. PATH.js
     *   3. PATH.json
     *   4. PATH/index.js
     *   5. PATH/index.json
     *
     * @param {String} path The module path to resolve.
     * @return {String} The resolved canonical path, or `null` if not found.
     * @api private
     */

    require.resolve = function( path ) {
        // If path starts with '/', remove it to normalize.
        if ( path.charAt( 0 ) === '/' ) {
            path = path.slice( 1 );
        }

        // Define a list of potential paths to check.
        var paths = [
            path ,
            path + '.js' ,
            path + '.json' ,
            path + '/index.js' ,
            path + '/index.json'
        ];

        // Iterate through the potential paths.
        for ( var i = 0 ; i < paths.length ; i++ ) {
            var currentPath = paths[ i ]; // Use a different variable name for clarity within the loop.
            // Check if the current path exists in registered modules.
            if ( require.modules.hasOwnProperty( currentPath ) ) {
                return currentPath;
            }
            // Check if the current path is an alias to another module.
            if ( require.aliases.hasOwnProperty( currentPath ) ) {
                return require.aliases[ currentPath ];
            }
        }
        // If no resolution found, return undefined (implicitly `null`).
    };

    /**
     * Normalize a `path` relative to a `curr`ent path.
     * Handles `.` and `..` segments in paths.
     *
     * @param {String} curr The current base path.
     * @param {String} path The path to normalize.
     * @return {String} The normalized absolute path.
     * @api private
     */

    require.normalize = function( curr , path ) {
        var segs = []; // Array to build up the normalized path segments.

        // If path does not start with '.', it's considered absolute or external.
        if ( '.' != path.charAt( 0 ) ) {
            return path;
        }

        // Split both current and target paths into segments.
        curr = curr.split( '/' );
        path = path.split( '/' );

        // Process path segments.
        for ( var i = 0 ; i < path.length ; ++i ) {
            if ( '..' == path[ i ] ) { // If segment is '..', pop from current path.
                curr.pop();
            } else if ( '.' != path[ i ] && '' != path[ i ] ) { // Ignore '.' and empty segments.
                segs.push( path[ i ] ); // Add valid segments to the result.
            }
        }

        // Concatenate remaining current path segments with new segments and join.
        return curr.concat( segs ).join( '/' );
    };

    /**
     * Register a module definition.
     * Stores the `definition` function for the given `path`.
     *
     * @param {String} path The canonical path for the module.
     * @param {Function} definition The function that defines the module.
     * @api private
     */

    require.register = function( path , definition ) {
        require.modules[ path ] = definition; // Simply store the definition.
    };

    /**
     * Create an alias for a module.
     * Maps `to` path to an existing `from` module path.
     *
     * @param {String} from The existing module path.
     * @param {String} to The new alias path.
     * @api private
     */

    require.alias = function( from , to ) {
        // Ensure the source module exists before creating an alias.
        if ( ! require.modules.hasOwnProperty( from ) ) {
            throw new Error( 'Failed to alias "' + from + '", it does not exist in modules.' );
        }
        require.aliases[ to ] = from; // Store the alias mapping.
    };

    /**
     * Create and return a `require` function that is relative to a `parent` path.
     * This allows modules to `require` other modules using relative paths.
     *
     * @param {String} parent The base path for relative requires.
     * @return {Function} A specialized `require` function for the given parent.
     * @api private
     */

    require.relative = function( parent ) {
        // Determine the base path for relative resolution (parent's parent directory).
        var p = require.normalize( parent , '..' );

        /**
         * Helper function to find the last index of an `obj` in an `arr`.
         * This is a simple implementation for internal use.
         *
         * @param {Array} arr The array to search in.
         * @param {Object} obj The object to search for.
         * @return {Number} The last index of `obj`, or -1 if not found.
         */

        function lastIndexOf( arr , obj ) {
            var i = arr.length;
            while ( i-- ) {
                if ( arr[ i ] === obj ) {
                    return i;
                }
            }
            return -1;
        }

        /**
         * The actual relative `require` function.
         * It first resolves the path relative to its parent, then calls the global `require`.
         *
         * @param {String} path The module path to require.
         * @return {Object} The exports of the required module.
         */

        function localRequire( path ) {
            var resolved = localRequire.resolve( path ); // Resolve the path using local context.
            // Call the global require with additional context for error reporting.
            return require( resolved , parent , path );
        }

        /**
         * Resolve a path relative to the `parent` context of `localRequire`.
         * Handles absolute paths, relative paths (starting with '.'), and component deps.
         *
         * @param {String} path The path to resolve.
         * @return {String} The resolved canonical path.
         */

        localRequire.resolve = function( path ) {
            var c = path.charAt( 0 ); // Get the first character to determine path type.

            // If it's an absolute path (starts with '/'), remove the leading slash.
            if ( '/' == c ) {
                return path.slice( 1 );
            }
            // If it's a relative path (starts with '.'), normalize it.
            if ( '.' == c ) {
                return require.normalize( p , path );
            }

            // For other paths, assume it's a component dependency.
            // Resolve deps by finding the nearest "deps" directory in the parent path.
            var segs = parent.split( '/' );
            var i = lastIndexOf( segs , 'deps' ) + 1; // Find the 'deps' segment.
            if ( ! i ) {
                i = 0; // If 'deps' not found, start from the beginning.
            }
            // Construct the path relative to the 'deps' directory.
            path = segs.slice( 0 , i + 1 ).join( '/' ) + '/deps/' + path;
            return path;
        };

        /**
         * Check if a module is defined (registered) at the given `path`
         * relative to the `localRequire`'s parent context.
         *
         * @param {String} path The module path to check.
         * @return {Boolean} True if the module exists, false otherwise.
         */

        localRequire.exists = function( path ) {
            // Resolve the path and then check if it exists in the global modules registry.
            return require.modules.hasOwnProperty( localRequire.resolve( path ) );
        };

        return localRequire; // Return the specialized relative require function.
    }; // End of require.relative function.


    // --- Module Registrations Below ---


    // Register "component-event/index.js" module.
    require.register( "component-event/index.js" , function( exports , require , module ) {

        /**
         * Bind an event listener to an HTML element.
         *
         * @param {Element} el The DOM element to bind the event to.
         * @param {String} type The event type (e.g., 'click', 'mouseover').
         * @param {Function} fn The callback function to execute.
         * @param {Boolean} capture Whether to use capture phase (optional).
         * @return {Function} The bound function (for easy unbinding).
         * @api public
         */

        exports.bind = function( el , type , fn , capture ) {
            // Check for modern addEventListener support.
            if ( el.addEventListener ) {
                el.addEventListener( type , fn , capture );
            } else {
                // Fallback for older IE using attachEvent.
                el.attachEvent( 'on' + type , fn );
            }
            return fn; // Return the function for potential later unbinding.
        };

        /**
         * Unbind an event listener from an HTML element.
         *
         * @param {Element} el The DOM element to unbind from.
         * @param {String} type The event type.
         * @param {Function} fn The callback function that was previously bound.
         * @param {Boolean} capture Whether capture phase was used during binding (optional).
         * @return {Function} The unbound function.
         * @api public
         */

        exports.unbind = function( el , type , fn , capture ) {
            // Check for modern removeEventListener support.
            if ( el.removeEventListener ) {
                el.removeEventListener( type , fn , capture );
            } else {
                // Fallback for older IE using detachEvent.
                el.detachEvent( 'on' + type , fn );
            }
            return fn; // Return the function.
        };

    } ); // End of "component-event/index.js" registration.


    // Register "component-event-manager/index.js" module.
    require.register( "component-event-manager/index.js" , function( exports , require , module ) {


        /**
         * Expose the `EventManager` constructor.
         * This makes it available as the module's export.
         */

        module.exports = EventManager;

        /**
         * Initialize an `EventManager`.
         * This manager facilitates binding and unbinding events
         * on a `target` object, with callbacks routed to methods on an `obj`.
         *
         * @param {Object} target The object (e.g., DOM element) to which events will be bound.
         * @param {Object} obj The object whose methods will be called when events fire.
         * @api public
         */

        function EventManager( target , obj ) {
            this.target = target; // The event source.
            this.obj = obj; // The object containing event handler methods.
            this._bindings = {}; // Stores references to bound callbacks for management.
        }

        /**
         * Register a custom binding function.
         * This function will be used by the manager to perform the actual event binding.
         *
         * @param {Function} fn The function to use for binding events (e.g., `event.bind`).
         * @return {EventManager} Returns `this` for chaining.
         * @api public
         */

        EventManager.prototype.onbind = function( fn ) {
            this._bind = fn; // Store the custom bind function.
            return this;
        };

        /**
         * Register a custom unbinding function.
         * This function will be used by the manager to perform the actual event unbinding.
         *
         * @param {Function} fn The function to use for unbinding events (e.g., `event.unbind`).
         * @return {EventManager} Returns `this` for chaining.
         * @api public
         */

        EventManager.prototype.onunbind = function( fn ) {
            this._unbind = fn; // Store the custom unbind function.
            return this;
        };

        /**
         * Bind an event on the `target` to a method on the `obj`.
         *
         * If `method` is not specified, it defaults to `'on' + event`.
         *
         * Example usage:
         *    events.bind('click') // calls obj.onclick
         *    events.bind('submit', 'onSubmitForm') // calls obj.onSubmitForm
         *
         * @param {String} event The name of the event to bind (e.g., 'click').
         * @param {String} [method] The name of the method on `obj` to call.
         * @return {Function} The generated callback function that was bound.
         * @api public
         */

        EventManager.prototype.bind = function( event , method ) {
            var fn = this.addBinding.apply( this , arguments ); // Create the actual callback.
            // If a custom `_onbind` handler is registered, call it.
            if ( this._onbind ) {
                this._onbind( event , method , fn );
            }
            this._bind( event , fn ); // Perform the actual event binding using the registered function.
            return fn;
        };

        /**
         * Internal helper to add an event binding and generate the callback.
         * This callback will invoke the specified method on `this.obj`.
         *
         * @param {String} event The event name.
         * @param {String} method The method name on `obj`.
         * @return {Function} The generated callback function.
         * @api private
         */

        EventManager.prototype.addBinding = function( event , method ) {
            var obj = this.obj;
            var methodName = method || 'on' + event; // Default method name.
            var args = [].slice.call( arguments , 2 ); // Any additional arguments passed to `bind` become fixed args for the callback.

            // Define the callback function.
            function callback() {
                // Collect arguments passed by the event system, then append fixed args.
                var a = [].slice.call( arguments ).concat( args );
                // Invoke the target method on the object with the collected arguments.
                obj[ methodName ].apply( obj , a );
            }

            // Store the binding for later unbinding.
            this._bindings[ event ] = this._bindings[ event ] || {};
            this._bindings[ event ][ methodName ] = callback;

            return callback;
        };

        /**
         * Unbind events managed by this `EventManager`.
         *
         * Can unbind:
         *   - A specific binding (`event`, `method`)
         *   - All bindings for a given `event`
         *   - All bindings managed by this instance (no arguments)
         *
         * @param {String} [event] Optional: The event name.
         * @param {String} [method] Optional: The method name.
         * @return {Function|undefined} The unbound function if specific, or undefined.
         * @api public
         */

        EventManager.prototype.unbind = function( event , method ) {
            // No arguments: unbind all events.
            if ( 0 == arguments.length ) {
                return this.unbindAll();
            }
            // One argument: unbind all for a specific event.
            if ( 1 == arguments.length ) {
                return this.unbindAllOf( event );
            }

            // Two arguments: unbind a specific event and method.
            var fn = this._bindings[ event ][ method ]; // Retrieve the stored callback.
            if ( this._onunbind ) {
                this._onunbind( event , method , fn ); // Call custom unbind handler if present.
            }
            this._unbind( event , fn ); // Perform the actual unbinding.
            // Clean up the internal _bindings record for this specific binding
            if (this._bindings[event] && this._bindings[event][method]) {
                delete this._bindings[event][method];
                if (Object.keys(this._bindings[event]).length === 0) {
                    delete this._bindings[event]; // Remove event entry if no more methods
                }
            }
            return fn;
        };

        /**
         * Unbind all events managed by this `EventManager` instance.
         * Iterates through all registered events and unbinds them.
         *
         * @api private
         */

        EventManager.prototype.unbindAll = function() {
            // Iterate over each event type that has registered bindings.
            for ( var event in this._bindings ) {
                // Ensure it's an own property to avoid prototype chain issues.
                if (this._bindings.hasOwnProperty(event)) {
                    this.unbindAllOf( event ); // Unbind all methods for this event.
                }
            }
            this._bindings = {}; // Clear all bindings after unbinding.
        };

        /**
         * Unbind all methods associated with a specific `event`.
         *
         * @param {String} event The event name for which to unbind all methods.
         * @api private
         */

        EventManager.prototype.unbindAllOf = function( event ) {
            var bindings = this._bindings[ event ];
            if ( ! bindings ) { // If no bindings for this event, do nothing.
                return;
            }
            // Iterate over each method bound to this event.
            for ( var method in bindings ) {
                // Ensure it's an own property.
                if (bindings.hasOwnProperty(method)) {
                    this.unbind( event , method ); // Recursively call unbind for each method.
                }
            }
            delete this._bindings[ event ]; // Remove the event entry after all methods are unbound.
        };

    } ); // End of "component-event-manager/index.js" registration.


    // Register "component-events/index.js" module.
    require.register( "component-events/index.js" , function( exports , require , module ) {

        /**
         * Module dependencies for `component-events`.
         * This module requires `event-manager` and `event` components.
         */

        var Manager = require( 'event-manager' )
            , event = require( 'event' ); // Note the comma-separated variable declarations.

        /**
         * Export a factory function that creates a new event manager.
         * This function abstracts the EventManager setup.
         *
         * @param {Object} target The object to which events will be bound.
         * @param {Object} obj The object containing event handler methods.
         * @return {EventManager} A new EventManager instance, configured with `event.bind` and `event.unbind`.
         */

        module.exports = function( target , obj ) {
            var manager = new Manager( target , obj ); // Create a new EventManager instance.

            // Configure the manager to use the `event.bind` function from 'component-event'.
            manager.onbind( function( name , fn ) {
                event.bind( target , name , fn );
            } );

            // Configure the manager to use the `event.unbind` function from 'component-event'.
            manager.onunbind( function( name , fn ) {
                event.unbind( target , name , fn );
            } );

            return manager; // Return the configured manager.
        };

    } ); // End of "component-events/index.js" registration.


    // Register "component-has-translate3d/index.js" module.
    require.register( "component-has-translate3d/index.js" , function( exports , require , module ) {

        // Require the 'transform-property' module to get the CSS transform property name.
        var prop = require( 'transform-property' );
        // If no transform property is found, translate3d is not supported.
        if ( ! prop ) {
            return module.exports = false;
        }

        // Map standard JS property names to their CSS equivalents for getComputedStyle.
        var map = {
            webkitTransform : '-webkit-transform' ,
            OTransform      : '-o-transform' ,
            msTransform     : '-ms-transform' ,
            MozTransform    : '-moz-transform' ,
            transform       : 'transform'
        };

        // This technique is inspired by: https://gist.github.com/lorenzopolidori/3794226
        // Create a temporary DOM element to test for 3D transform support.
        var el = document.createElement( 'div' );
        // Apply a translate3d style to the element using the detected transform property.
        el.style[ prop ] = 'translate3d(1px,1px,1px)';
        // Append the element to the body to allow computed style calculation.
        document.body.insertBefore( el , null ); // null makes it append as the last child.

        // Get the computed style value for the transform property.
        var val = window.getComputedStyle( el ).getPropertyValue( map[ prop ] );
        // Remove the temporary element from the DOM.
        document.body.removeChild( el );

        // Determine if translate3d is supported:
        // - `val` must not be null.
        // - `val` must have a length (not an empty string).
        // - `val` must not be 'none' (which indicates no transform applied or invalid).
        module.exports = null != val && val.length && 'none' != val;

    } ); // End of "component-has-translate3d/index.js" registration.


    // Register "component-transform-property/index.js" module.
    require.register( "component-transform-property/index.js" , function( exports , require , module ) {

        // List of potential CSS transform property names (vendor-prefixed and standard).
        var styles = [
            'webkitTransform' ,
            'MozTransform' ,
            'msTransform' ,
            'OTransform' ,
            'transform'
        ];

        // Create a dummy paragraph element to test for property support.
        var el = document.createElement( 'p' );
        var style; // Variable to hold the found style property.

        // Iterate through the list of styles.
        for ( var i = 0 ; i < styles.length ; i++ ) {
            style = styles[ i ];
            // Check if the property exists on the element's style object.
            // `null != el.style[style]` checks for existence and non-null value.
            if ( null != el.style[ style ] ) {
                module.exports = style; // Export the first found supported property.
                break; // Exit the loop once a property is found.
            }
        }

    } ); // End of "component-transform-property/index.js" registration.


    // Register "jonykrause-translate/index.js" module.
    require.register( "jonykrause-translate/index.js" , function( exports , require , module ) {

        /**
         * Module dependencies for the `translate` utility.
         * This module needs `transform-property` to detect the correct CSS property
         * and `has-translate3d` to check for 3D transform support.
         */

        var transform = require( 'transform-property' );
        var has3d = require( 'has-translate3d' );

        /**
         * Expose the `translate` function as the module's export.
         */

        module.exports = translate;

        /**
         * Applies a CSS `translate` or `translate3d` transformation to an element.
         * This function sets the `transform` style property of the given element.
         *
         * @param {Element} el The DOM element to translate.
         * @param {Number} x The X-axis translation value.
         * @param {Number} y The Y-axis translation value.
         * @param {String} unit The unit for x and y (e.g., 'px', '%', 'em'). Defaults to 'px'.
         * @api public
         */

        function translate( el , x , y , unit ) {
            unit || ( unit = 'px' ); // Default unit to 'px' if not provided.

            // Only proceed if a CSS transform property was detected.
            if ( typeof transform === 'string' ) {
                // If the browser supports 3D transforms, use translate3d for potentially better performance.
                if ( has3d ) {
                    el.style[ transform ] = 'translate3d(' + x + unit + ',' + y + unit + ', 0)';
                } else {
                    // Fallback to 2D translate if 3D is not supported.
                    el.style[ transform ] = 'translate(' + x + unit + ',' + y + unit + ')';
                }
            }
            // If `transform` is not a string, it means no transform property was found, so do nothing.
        }

    } ); // End of "jonykrause-translate/index.js" registration.


} ); // End of the main module wrapper function.