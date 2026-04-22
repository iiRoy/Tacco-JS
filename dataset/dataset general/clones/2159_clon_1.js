;(function() {

    /*
     * This core function is responsible for requiring modules.
     * It attempts to locate and load a module based on the provided path string.
     *
     * @param { String } path The module path or identifier to resolve.
     * @param { Object } parent The parent module, if this is a nested require call.
     * @param { String } orig The original path requested, primarily for error reporting.
     * @returns { Object } The exports object of the successfully required module.
     * @access public
     */

    function require(path, parent, orig) {
        var resolved = require.resolve(path); // First, try to resolve the module path to its canonical form.


        // If the module resolution process failed, an error must be thrown.
        if (null == resolved) {
            orig = orig || path;       // Use the original path for the error message if 'orig' is not set.
            parent = parent || 'root'; // Default the parent to 'root' if it's not provided.

            var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
            err.path = orig;           // Attach the original path to the error object.
            err.parent = parent;       // Attach the parent path to the error object.
            err.require = true;        // Indicate that this is a require-related error.
            throw err;                 // Terminate execution by throwing the error.
        }

        var module = require.modules[resolved]; // Retrieve the module definition from the registry using the resolved path.


        // If the module's exports have not yet been populated, perform the actual module execution.
        // This involves invoking the module's registered function.
        if ( !module.exports ) {
            module.exports = {};                     // Initialize an empty exports object for the module.
            module.client = module.component = true; // Mark the module as client-side and a component.
            module.call(this, module.exports, require.relative(resolved), module); // Execute the module's definition function.
        }

        return module.exports; // Return the fully populated exports object of the module.
    }


    /*
     * This object serves as a registry for all registered modules.
     * Modules are stored here, keyed by their unique, resolved paths.
     */
    require.modules = {};


    /*
     * This object holds a mapping of module aliases.
     * It allows modules to be referred to by alternative or shorter names.
     */
    require.aliases = {};


    /**
     * Resolves a given `path` to its canonical and absolute module identifier.
     * It performs a series of lookups to find a matching registered module.
     *
     * The lookup order prioritizes direct matches and common file extensions:
     *
     *   - PATH (e.g., "my-module")
     *   - PATH.js (e.g., "my-module.js")
     *   - PATH.json (e.g., "my-module.json")
     *   - PATH/index.js (e.g., "my-module/index.js")
     *   - PATH/index.json (e.g., "my-module/index.json")
     *
     * @param { String } path The module path string to be resolved.
     * @returns { String | null } The resolved module path string, or `null` if no module is found.
     * @access private
     */

    require.resolve = function(path) {
        // Remove a leading slash if the path starts with one, as module paths are typically relative.
        if (path.charAt(0) === '/') {
            path = path.slice(1);
        }

        var index = path + '/index.js'; // Pre-calculate the 'index.js' variant for potential alias checks.

        // Define a list of potential paths to check, in order of precedence.
        var paths = [
            path,               // Direct path match.
            path + '.js',       // Append '.js' extension.
            path + '.json',     // Append '.json' extension.
            path + '/index.js', // Look for 'index.js' within the directory.
            path + '/index.json'// Look for 'index.json' within the directory.
        ];

        // Iterate through the list of potential paths to find a match in the registered modules.
        for (var i = 0; i < paths.length; i++) {
            var currentPath = paths[i]; // Get the current path candidate.
            if (require.modules.hasOwnProperty(currentPath)) {
                return currentPath; // If found, return the resolved path immediately.
            }
        }

        // If no direct module was found, check if an alias exists for the 'index.js' variant.
        if (require.aliases.hasOwnProperty(index)) {
            return require.aliases[index]; // Return the aliased path.
        }

        return null; // If no module or alias is found after all checks, return null.
    };


    /*
     * Normalizes a given `path` string relative to a `curr`ent base path.
     * This function handles common path segments like '..' (parent directory) and '.' (current directory).
     *
     * @param { String } curr The current base path string.
     * @param { String } path The path string to normalize.
     * @returns { String } The resulting normalized path string.
     * @access private
     */

    require.normalize = function(curr, path) {
        var segs = []; // Initialize an array to store the resulting path segments.

        // If the path does not start with '.', it's considered absolute or already normalized, so return it as is.
        if ('.' != path.charAt(0)) {
            return path;
        }

        // Split both the current path and the target path into individual segments.
        curr = curr.split('/');
        path = path.split('/');

        // Process each segment of the target path.
        for (var i = 0; i < path.length; ++i) {
            if ('..' == path[i]) {
                curr.pop(); // If '..', navigate up one directory in the current path.
            } else if ('.' != path[i] && '' != path[i]) {
                segs.push(path[i]); // If it's a valid segment (not '.' or empty), add it to the new segments.
            }
        }

        // Concatenate the modified current path segments with the new segments and join them with '/'.
        return curr.concat(segs).join('/');
    };


    /*
     * Registers a new module by associating a `definition` function with a unique `path`.
     * This makes the module available for resolution and requiring by other parts of the application.
     *
     * @param { String } path The unique identifier path for the module.
     * @param { Function } definition The function that defines the module's content and exports.
     * @access private
     */

    require.register = function(path, definition) {
        require.modules[path] = definition; // Store the definition function directly in the modules registry.
    };


    /*
     * Creates an alias, allowing a module to be accessed via an alternative `to` path.
     * The `to` path will effectively point to the module defined at the `from` path.
     *
     * @param { String } from The original path of the module to be aliased.
     * @param { String } to The new alias path for the module.
     * @access private
     */

    require.alias = function(from, to) {
        // Before creating an alias, ensure that the source module (`from` path) actually exists.
        if ( !require.modules.hasOwnProperty(from) ) {
            throw new Error('Failed to alias "' + from + '", it does not exist'); // Throw an error if the source module is not found.
        }
        require.aliases[to] = from; // Establish the alias by mapping the 'to' path to the 'from' path.
    };


    /*
     * Generates and returns a specialized `require` function that is contextualized
     * to a specific `parent` module's path. This is crucial for handling relative
     * module imports within packages or components.
     *
     * @param { String } parent The path of the parent module, from which the relative require originates.
     * @returns { Function } A new `require` function configured for relative path resolution.
     * @access private
     */

    require.relative = function(parent) {
        var p = require.normalize(parent, '..'); // Calculate the parent's parent directory path, used for relative resolution.

        /**
         * A utility helper function to find the last occurrence of an `obj`ect within an `arr`ay.
         * This is a custom implementation for `lastIndexOf`.
         *
         * @param { Array } arr The array to search within.
         * @param { Any } obj The object or value to search for.
         * @returns { Number } The index of the last occurrence, or -1 if the object is not found.
         */

        function lastIndexOf(arr, obj) {
            var i = arr.length; // Start searching from the end of the array.
            while (i--) {
                if (arr[i] === obj) return i; // If a match is found, return its index.
            }
            return -1; // If the loop completes without finding the object, return -1.
        }

        /**
         * The actual relative `require` function that will be returned.
         * It first resolves the path locally and then delegates to the global `require`.
         *
         * @param { String } path The module path to be required, relative to the current context.
         * @returns { Object } The exports object of the resolved and required module.
         */

        function localRequire(path) {
            var resolved = localRequire.resolve(path); // Resolve the module path using the local resolver.
            return require(resolved, parent, path);    // Call the global `require` with the resolved path and context.
        }

        /**
         * Resolves a module `path` relative to the current `parent` context.
         * This handles absolute paths, relative paths (starting with '.'), and special 'deps' paths.
         *
         * @param { String } path The module path string to resolve.
         * @returns { String } The fully resolved and canonical path string for the module.
         */

        localRequire.resolve = function(path) {
            var c = path.charAt(0); // Get the first character of the path for quick checks.

            // If the path starts with '/', it's an absolute path (relative to the root of the module system).
            if ('/' == c) {
                return path.slice(1); // Remove the leading slash.
            }
            // If the path starts with '.', it's a standard relative path.
            if ('.' == c) {
                return require.normalize(p, path); // Normalize it using the parent's parent path.
            }

            // For other paths, attempt to resolve them as dependencies within a 'deps' directory structure.
            var segs = parent.split('/');             // Split the parent path into segments.
            var i = lastIndexOf(segs, 'deps') + 1;    // Find the last 'deps' segment and get the index after it.
            if (!i) {
                i = 0; // If no 'deps' segment is found, start from the beginning of the segments.
            }
            path = segs.slice(0, i + 1).join('/') + '/deps/' + path; // Construct the path to look inside 'deps'.
            return path; // Return the constructed dependency path.
        };

        /*
         * Checks if a module exists and is defined at the given `path`,
         * using the local resolution logic.
         *
         * @param { String } path The module path to check for existence.
         * @returns { Boolean } `true` if the module exists, `false` otherwise.
         */

        localRequire.exists = function(path) {
            return require.modules.hasOwnProperty(localRequire.resolve(path)); // Check the global module registry after local resolution.
        };

        return localRequire; // Return the configured local `require` function.
    };

    // --- Module Registrations ---

    require.register("component-indexof/index.js", function(exports, require, module){

        var indexOf = [].indexOf; // Cache the native `Array.prototype.indexOf` method for efficiency.

        module.exports = function(arr, obj){
            if (indexOf) {
                return arr.indexOf(obj); // If native `indexOf` exists, use it directly.
            }
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i] === obj) {
                    return i; // Manually iterate and return the index if a match is found.
                }
            }
            return -1; // If no match is found after iteration, return -1.
        };

    });

    require.register("component-emitter/index.js", function(exports, require, module){

        /*
         * External module dependencies required by the Emitter component.
         */

        var index = require('indexof'); // Import the 'indexof' utility module.

        /*
         * Export the `Emitter` constructor function as the module's primary export.
         */

        module.exports = Emitter;

        /*
         * Initializes a new `Emitter` instance.
         * If an object (`obj`) is provided, it will extend that object with emitter capabilities.
         *
         * @param { Object } obj An optional object to mixin emitter properties into.
         * @access public
         */

        function Emitter(obj) {
            if (obj) return mixin(obj); // If an object is passed, mixin emitter methods into it.
        };

        /*
         * Mixes all properties from `Emitter.prototype` into the target `obj`ect.
         * This allows any object to become an emitter.
         *
         * @param { Object } obj The target object to extend.
         * @returns { Object } The `obj`ect after being extended with emitter properties.
         * @access private
         */

        function mixin(obj) {
            for (var key in Emitter.prototype) {
                obj[key] = Emitter.prototype[key]; // Copy each method from the Emitter prototype.
            }
            return obj; // Return the modified object.
        }

        /*
         * Attaches a listener `fn` to the specified `event`.
         * When the `event` is emitted, the `fn` callback will be invoked.
         *
         * @param { String } event The name of the event to listen for.
         * @param { Function } fn The callback function to execute when the event occurs.
         * @returns { Emitter } The current Emitter instance, allowing for method chaining.
         * @access public
         */

        Emitter.prototype.on = function(event, fn){
            this._callbacks = this._callbacks || {}; // Ensure the _callbacks object exists.
            (this._callbacks[event] = this._callbacks[event] || [])
                .push(fn); // Add the new function to the array of callbacks for this event.
            return this; // Return the emitter instance.
        };

        /*
         * Adds an `event` listener that will be executed only once.
         * After the first invocation, the listener is automatically removed.
         *
         * @param { String } event The name of the event.
         * @param { Function } fn The callback function to be executed a single time.
         * @returns { Emitter } The current Emitter instance for chaining.
         * @access public
         */

        Emitter.prototype.once = function(event, fn){
            var self = this; // Capture the 'this' context for use within the wrapper function.
            this._callbacks = this._callbacks || {}; // Ensure the callbacks object is initialized.

            function on() {
                self.off(event, on); // Remove this one-time listener before executing the original function.
                fn.apply(this, arguments); // Call the original function with the correct context and arguments.
            }

            fn._off = on; // Store a reference to the wrapper function `on` on the original `fn`.
            this.on(event, on); // Register the wrapper function `on` as the event listener.
            return this; // Return the emitter instance.
        };

        /*
         * Removes event listeners from the emitter.
         *
         * - If no arguments are provided, all listeners for all events are removed.
         * - If only `event` is provided, all listeners for that specific event are removed.
         * - If both `event` and `fn` are provided, only the specific `fn` listener for that `event` is removed.
         *
         * @param { String } event Optional: The name of the event.
         * @param { Function } fn Optional: The specific callback function to remove.
         * @returns { Emitter } The current Emitter instance for chaining.
         * @access public
         */

        Emitter.prototype.off =
        Emitter.prototype.removeListener =
        Emitter.prototype.removeAllListeners = function(event, fn){
            this._callbacks = this._callbacks || {}; // Ensure the callbacks object exists.

            // Case 1: No arguments - remove all callbacks for all events.
            if (0 == arguments.length) {
                this._callbacks = {}; // Reset the entire callbacks object.
                return this;
            }

            // Get the array of callbacks for the specified event.
            var callbacks = this._callbacks[event];
            if (!callbacks) return this; // If no callbacks exist for this event, do nothing.

            // Case 2: One argument (`event`) - remove all callbacks for this specific event.
            if (1 == arguments.length) {
                delete this._callbacks[event]; // Delete the entire array of callbacks for the event.
                return this;
            }

            // Case 3: Two arguments (`event`, `fn`) - remove a specific handler.
            // Use the `_off` property if it's a 'once' listener, otherwise use the function itself.
            var i = index(callbacks, fn._off || fn);
            if (~i) {
                callbacks.splice(i, 1); // If the function is found, remove it from the array.
            }
            return this; // Return the emitter instance.
        };

        /*
         * Emits an `event`, asynchronously invoking all registered listeners for that event.
         * Any additional arguments passed to `emit` will be forwarded to the listeners.
         *
         * @param { String } event The name of the event to emit.
         * @param { Mixed } ...args Any number of additional arguments to pass to the listeners.
         * @returns { Emitter } The current Emitter instance for chaining.
         */

        Emitter.prototype.emit = function(event){
            this._callbacks = this._callbacks || {}; // Ensure the callbacks object is initialized.
            var args = [].slice.call(arguments, 1);  // Convert arguments object to an array, excluding the event name.
            var callbacks = this._callbacks[event];  // Get the array of callback functions for the specified event.

            if (callbacks) {
                callbacks = callbacks.slice(0); // Create a shallow copy of the callbacks array to prevent issues if listeners modify it during iteration.
                for (var i = 0, len = callbacks.length; i < len; ++i) {
                    callbacks[i].apply(this, args); // Invoke each callback function with the correct 'this' context and arguments.
                }
            }

            return this; // Return the emitter instance.
        };

        /*
         * Returns an array containing all callback functions currently registered
         * for the specified `event`.
         *
         * @param { String } event The name of the event.
         * @returns { Array } An array of registered callback functions, or an empty array if none exist.
         * @access public
         */

        Emitter.prototype.listeners = function(event){
            this._callbacks = this._callbacks || {}; // Ensure the callbacks object is initialized.
            return this._callbacks[event] || []; // Return the array of callbacks for the event, or an empty array.
        };

        /*
         * Checks if there are any listeners registered for the given `event`.
         *
         * @param { String } event The name of the event to check.
         * @returns { Boolean } `true` if there are one or more listeners, `false` otherwise.
         * @access public
         */

        Emitter.prototype.hasListeners = function(event){
            return !! this.listeners(event).length; // Check if the array of listeners has a length greater than zero.
        };

    });

    require.register("RedVentures-reduce/index.js", function(exports, require, module){

        /*
         * Reduces an `arr`ay down to a single value by applying a `fn`ction against an accumulator
         * and each element in the array (from left to right).
         *
         * @param { Array } arr The array of elements to reduce.
         * @param { Function } fn The reducer function: `function(accumulator, currentValue, currentIndex, array)`.
         * @param { Mixed } initial Optional: The initial value of the accumulator. If not provided, `arr[0]` is used.
         *
         * // TODO: Consider adding more robust error handling for edge cases, e.g., empty array without initial value.
         */

        module.exports = function(arr, fn, initial){
            var idx = 0;     // Initialize the current index for iteration.
            var len = arr.length; // Get the total length of the array.
            var curr;        // Declare the variable for the accumulator.

            // Determine the initial value of the accumulator.
            // If `initial` is provided (3 arguments), use it; otherwise, use the first element of the array.
            curr = arguments.length == 3
                ? initial
                : arr[idx++]; // If using the first element, increment `idx` immediately.

            // Iterate through the rest of the array elements.
            while (idx < len) {
                // Apply the reducer function, updating the accumulator with its result.
                // Pass `null` as the `this` context, the current accumulator, the current array element,
                // the incremented index, and the full array.
                curr = fn.call(null, curr, arr[idx], ++idx, arr);
            }

            return curr; // Return the final accumulated value.
        };

    });

    require.register("superagent/lib/client.js", function(exports, require, module){

        /*
         * External module dependencies used by the Superagent client library.
         */

        var Emitter = require('emitter'); // Import the Emitter module for event handling.
        var reduce = require('reduce');   // Import the reduce utility function.

        /*
         * Determine the global root object, which varies between browser and Node.js environments.
         * This is used to access global objects like `window` or `this`.
         */

        var root = 'undefined' == typeof window
            ? this   // In a Node.js-like environment, 'this' refers to the global object.
            : window; // In a browser environment, 'window' is the global object.

        /*
         * A simple no-operation function.
         * Useful as a default callback or placeholder.
         */

        function noop(){};

        /*
         * Checks if a given `obj`ect is considered a "host object".
         * Host objects are typically native browser objects (e.g., File, Blob, FormData)
         * that should not be serialized in the same way as plain JavaScript objects.
         *
         * // TODO: This check could potentially be extracted into a dedicated component or utility.
         *
         * @param { Object } obj The object to evaluate.
         * @returns { Boolean } `true` if `obj` is a recognized host object, `false` otherwise.
         * @access private
         */

        function isHost(obj) {
            var str = {}.toString.call(obj); // Get the internal `[[Class]]` property of the object.

            switch (str) {
                case '[object File]':
                case '[object Blob]':
                case '[object FormData]':
                    return true; // These are common host objects.
                default:
                    return false; // Any other object type is not considered a host object by this check.
            }
        }

        /*
         * Determines and returns the appropriate XMLHttpRequest (XHR) object for the current environment.
         * It attempts to instantiate the most capable XHR object available, including support for older IE versions.
         *
         * @returns { XMLHttpRequest | ActiveXObject | Boolean } An instance of XMLHttpRequest or ActiveXObject,
         *                                                     or `false` if no XHR capability is detected.
         */

        function getXHR() {
            // Modern browsers and non-file protocol requests.
            if (root.XMLHttpRequest && ('file:' != root.location.protocol || !root.ActiveXObject)) {
                return new XMLHttpRequest(); // Return a standard XMLHttpRequest object.
            } else {
                // Fallback for Internet Explorer versions using ActiveX objects.
                try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {} // IE 6+
                try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {} // IE 6 (MSXML3)
                try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {} // IE 6 (MSXML2)
                try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}    // IE 5
            }
            return false; // If no compatible XHR object can be created, return false.
        }

        /*
         * A utility function to remove leading and trailing whitespace from a string.
         * It leverages the native `String.prototype.trim()` method if available,
         * otherwise, it provides a regular expression-based fallback for older environments (like IE).
         *
         * @param { String } s The input string to be trimmed.
         * @returns { String } The string with leading and trailing whitespace removed.
         * @access private
         */

        var trim = ''.trim
            ? function(s) { return s.trim(); } // Use the native `trim` method if supported.
            : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); }; // Fallback to regex replacement for trimming.

        /*
         * Checks if the given `obj`ect is a plain JavaScript object.
         * This differentiates between primitive values, arrays, functions, and other non-plain objects.
         *
         * @param { Object } obj The value to check.
         * @returns { Boolean } `true` if `obj` is a plain object, `false` otherwise.
         * @access private
         */

        function isObject(obj) {
            return obj === Object(obj); // Compares the object to its wrapper object to check for primitivity.
        }

        /*
         * Serializes the given `obj`ect into a string representation.
         * The specific serialization logic will depend on the type and content of `obj`.
         * This function typically prepares data for transmission (e.g., in a URL query string or request body).
         *
         * @param { Object } obj The object or data structure to serialize.
         * @returns { String } The serialized string representation of the object.
         * @access private
         */