/*
 * Pavlov - A behavioral API for testing.
 *
 * Current version: 0.4.0pre
 *
 * Project Home: http://github.com/mmonteleone/pavlov
 *
 * (c) 2009-2011 Michael Monteleone.
 * Licensed under terms of the MIT License (see README.markdown for details).
 */
( function ( global ) {


    // --- Helper Functions ---


    var util = {

        /*
         * Iterates over provided object or array.
         *
         * @param {Object|Array} object - The collection to iterate.
         * @param {Function} callback - Function invoked for each item.
         */
        each: function ( object, callback ) {
            if ( typeof object === 'undefined' || typeof callback === 'undefined'
              || object === null || callback === null )
            {
                throw "both 'target' and 'callback' arguments are required";
            }
            var name
              , i = 0
              , length = object.length
              , value
              ;


            if ( length === undefined ) {
                for ( name in object ) {
                    if ( object.hasOwnProperty( name ) ) {
                        if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                            break;
                        }
                    }
                }
            } else {
                for ( value = object[ 0 ] ;
                      i < length && callback.call( value, i, value ) !== false ;
                      value = object[ ++i ] )
                {
                }
            }

            return object;
        }

        /*
         * Converts an array-like object into a true Array.
         *
         * @param {Object} array - The array-like object.
         * @returns {Array} - The converted array.
         */
        , makeArray: function ( array ) {
            return Array.prototype.slice.call( array );
        }

        /*
         * Checks if an object is an array.
         *
         * @param {Object} obj - Object to check.
         * @returns {boolean} - True if an array, false otherwise.
         */
        , isArray: function ( obj ) {
            return Object.prototype.toString.call( obj ) === "[object Array]";
        }

        /*
         * Merges properties from source object to destination object.
         *
         * @param {Object} dest - Destination object.
         * @param {Object} src - Source object.
         */
        , extend: function ( dest, src ) {
            if ( typeof dest === 'undefined' || typeof src === 'undefined' ||
                 dest === null || src === null )
            {
                throw "both 'source' and 'target' arguments are required";
            }
            var prop;
            for ( prop in src ) {
                if ( src.hasOwnProperty( prop ) ) {
                    dest[ prop ] = src[ prop ];
                }
            }
        }

        /*
         * Naive display serializer for objects.
         * Not for JSON, just for simple display in test results.
         *
         * @param {Object} obj - Object to serialize.
         * @returns {string} - Serialized string.
         */
        , serialize: function ( obj ) {
            if ( typeof obj === 'undefined' ) {
                return "";
            } else if ( Object.prototype.toString.call( obj ) === "[object Array]" ) {
                return '[' + obj.toString() + ']';
            } else if ( Object.prototype.toString.call( obj ) === "[object Function]" ) {
                return "function()";
            } else if ( typeof obj === "string" ) {
                return '"' + obj + '"';
            } else {
                return obj;
            }
        }

        /*
         * Transforms camelCase/PascalCase to lower-case space-separated phrase.
         *
         * @param {string} value - Input string.
         * @returns {string} - Phrase-cased string.
         */
        , phraseCase: function ( value ) {
            return value.replace( /([A-Z])/g, ' $1' ).toLowerCase();
        }
    };


    // --- Example Building ---


    var examples = []
      , currentExample
      ;

    /*
     * Rolls up values for a given property from an example and its ancestors.
     *
     * @param {Object} example - The starting example.
     * @param {string} prop - The property name to roll up.
     * @returns {Array} - Array of property values.
     */
    var rollup = function ( example, prop ) {
        var items = [];
        while ( example !== null ) {
            items.push( example[ prop ] );
            example = example.parent;
        }
        return items;
    };


    /*
     * Example Class: Represents a 'describe' block.
     *
     * @constructor
     * @param {Example} parent - The parent example (optional).
     */
    function Example ( parent ) {
        if ( parent ) {
            // If parent exists, append self as a nested example.
            this.parent = parent;
            this.parent.children.push( this );
        } else {
            // Otherwise, this is a root example.
            examples.push( this );
        }

        this.children = [];
        this.specs = [];
    }

    util.extend( Example.prototype, {
        name: ''             // Name of this description.
      , parent: null         // Parent example reference.
      , children: []         // Nested examples.
      , specs: []            // Array of 'it()' tests/specs.
      , before: function () { } // Function called before contained specs.
      , after: function () { }  // Function called after contained specs.

        /*
         * Rolls up 'before' functions from this and ancestor examples.
         * @returns {Array<Function>} Array of 'before' functions.
         */
      , befores: function () {
            return rollup( this, 'before' ).reverse();
        }

        /*
         * Rolls up 'after' functions from this and ancestor examples.
         * @returns {Array<Function>} Array of 'after' functions.
         */
      , afters: function () {
            return rollup( this, 'after' );
        }

        /*
         * Rolls up description names from this and ancestor examples, joined.
         * @returns {string} Joined description names.
         */
      , names: function () {
            return rollup( this, 'name' ).reverse().join( ', ' );
        }
    } );


    // --- Assertions ---


    /*
     * AssertionHandler: Provides an API for asserting values.
     *
     * @constructor
     * @param {Object} value - The actual value to assert against.
     */
    function AssertionHandler ( value ) {
        this.value = value;
    }

    /*
     * Dynamically adds assertion methods to AssertionHandler.prototype.
     *
     * @param {Object} asserts - Object containing assertion implementations.
     */
    var addAssertions = function ( asserts ) {
        util.each( asserts, function ( name, fn ) {
            AssertionHandler.prototype[ name ] = function () {
                // Prepend AssertionHandler's current value to arguments.
                var args = util.makeArray( arguments );
                args.unshift( this.value );

                // If no explicit message, construct a friendly one.
                if ( fn.length === 2 ) {
                    args[ 1 ] = args[ 1 ] || 'asserting ' + util.serialize( args[ 0 ] ) + ' ' + util.phraseCase( name );
                } else if ( fn.length === 3 ) {
                    var expected = util.serialize( args[ 1 ] );
                    args[ 2 ] = args[ 2 ] || 'asserting ' + util.serialize( args[ 0 ] ) + ' ' + util.phraseCase( name ) + ( expected ? ' ' + expected : expected );
                }

                fn.apply( this, args );
            };
        } );
    };

    /*
     * Add default assertion implementations.
     */
    addAssertions( {
        equals: function ( actual, expected, message ) {
            adapter.assert( actual == expected, message );
        }
      , isEqualTo: function ( actual, expected, message ) {
            adapter.assert( actual == expected, message );
        }
      , isNotEqualTo: function ( actual, expected, message ) {
            adapter.assert( actual != expected, message );
        }
      , isStrictlyEqualTo: function ( actual, expected, message ) {
            adapter.assert( actual === expected, message );
        }
      , isNotStrictlyEqualTo: function ( actual, expected, message ) {
            adapter.assert( actual !== expected, message );
        }
      , isTrue: function ( actual, message ) {
            adapter.assert( actual, message );
        }
      , isFalse: function ( actual, message ) {
            adapter.assert( !actual, message );
        }
      , isNull: function ( actual, message ) {
            adapter.assert( actual === null, message );
        }
      , isNotNull: function ( actual, message ) {
            adapter.assert( actual !== null, message );
        }
      , isDefined: function ( actual, message ) {
            adapter.assert( typeof actual !== 'undefined', message );
        }
      , isUndefined: function ( actual, message ) {
            adapter.assert( typeof actual === 'undefined', message );
        }
      , pass: function ( actual, message ) {
            adapter.assert( true, message );
        }
      , fail: function ( actual, message ) {
            adapter.assert( false, message );
        }
      , isFunction: function ( actual, message ) {
            return adapter.assert( typeof actual === "function", message );
        }
      , isNotFunction: function ( actual, message ) {
            return adapter.assert( typeof actual !== "function", message );
        }
      , throwsException: function ( actual, expectedErrorDescription, message ) {
            // Optionally accepts an expected error message.
            try {
                actual();
                adapter.assert( false, message );
            } catch ( e ) {
                // This checks if the caught error matches the expected description, or if any error is acceptable.
                adapter.assert( e === ( expectedErrorDescription || e ), message );
            }
        }
    } );


    // --- Pavlov Public API ---


    // Object containing methods exposed as the public Pavlov API.
    var api = {
        /*
         * Initiates a new Example context (a 'describe' block).
         *
         * @param {string} description - Name of what's being described.
         * @param {Function} fn - Function containing the description's logic.
         */
        describe: function ( description, fn ) {
            if ( arguments.length < 2 ) {
                throw "both 'description' and 'fn' arguments are required";
            }

            // Capture current example reference.
            var originalExample = currentExample;
            try {
                // Create new current example.
                currentExample = new Example( currentExample );
                currentExample.name = description;
                fn(); // Execute the description function.
            } finally {
                // Restore original example reference.
                currentExample = originalExample;
            }
        }

        /*
         * Sets a function to run before all contained specs and nested examples.
         *
         * @param {Function} fn - The function to execute.
         */
      , before: function ( fn ) {
            if ( arguments.length === 0 ) {
                throw "'fn' argument is required";
            }
            currentExample.before = fn;
        }

        /*
         * Sets a function to run after all contained specs and nested examples.
         *
         * @param {Function} fn - The function to execute.
         */
      , after: function ( fn ) {
            if ( arguments.length === 0 ) {
                throw "'fn' argument is required";
            }
            currentExample.after = fn;
        }

        /*
         * Creates a spec (test) within an example.
         * If 'fn' is not provided, it creates a failing spec stub.
         *
         * @param {string} specification - Description of what "it" should do.
         * @param {Function} [fn] - The test implementation (optional).
         */
      , it: function ( specification, fn ) {
            if ( arguments.length === 0 ) {
                throw "'specification' argument is required";
            }
            if ( fn ) {
                if ( fn.async ) {
                    specification += " asynchronously";
                }
                currentExample.specs.push( [ specification, fn ] );
            } else {
                // If no implementation, create a failing stub.
                api.it( specification, function () { api.assert.fail( 'Not Implemented' ); } );
            }
        }

        /*
         * Wraps a spec implementation to make it asynchronous.
         * The spec must call `resume()` when ready.
         *
         * @param {Function} fn - The original spec function.
         * @returns {Function} - The wrapped asynchronous spec function.
         */
      , async: function ( fn ) {
            var implementation = function () {
                adapter.pause();
                fn.apply( this, arguments );
            };
            implementation.async = true;
            return implementation;
        }

        /*
         * Generates multiple specs, each applying a different set of arguments.
         *
         * @param {...*} arguments - List of values or arrays of values for test rows.
         * @returns {Object} An object with an `it()` method.
         */
      , given: function () {
            if ( arguments.length === 0 ) {
                throw "at least one argument is required";
            }
            var args = util.makeArray( arguments );
            if ( arguments.length === 1 && util.isArray( arguments[ 0 ] ) ) {
                args = args[ 0 ];
            }

            return {
                /*
                 * Defines a row spec that runs for each `given` argument.
                 */
                it: function ( specification, fn ) {
                    util.each( args, function () {
                        var arg = this;
                        api.it( "given " + arg + ", " + specification, function () {
                            fn.apply( this, util.isArray( arg ) ? arg : [ arg ] );
                        } );
                    } );
                }
            };
        }

        /*
         * Asserts a value using bundled or custom assertions.
         *
         * @param {Object} value - The value to be asserted.
         * @returns {AssertionHandler} An AssertionHandler instance.
         */
      , assert: function ( value ) {
            return new AssertionHandler( value );
        }

        /*
         * Instructs the test runner to synchronously wait.
         *
         * @param {Number} ms - Milliseconds to wait.
         * @param {Function} fn - Function to execute after `ms` has passed.
         */
      , wait: function ( ms, fn ) {
            if ( arguments.length < 2 ) {
                throw "both 'ms' and 'fn' arguments are required";
            }
            adapter.pause();
            global.setTimeout( function () {
                fn();
                adapter.resume();
            }, ms );
        }

        /*
         * Instructs the test framework to pause the test runner.
         */
      , pause: function () {
            adapter.pause();
        }

        /*
         * Instructs the test framework to resume the test runner.
         */
      , resume: function () {
            adapter.resume();
        }
    };

    // Extend api.assert for direct calls like `api.assert.pass()`.
    util.each( [ 'pass', 'fail' ], function ( i, method ) {
        api.assert[ method ] = function ( message ) {
            api.assert()[ method ]( message );
        };
    } );

    /*
     * Extends a function's scope by wrapping it.
     * Inspired by Yehuda Katz's metaprogramming in Screw.Unit.
     *
     * @param {Function} fn - The target function.
     * @param {Object} thisArg - The 'this' context for the function.
     * @param {Object} extraScope - Object whose members will be added to fn's scope.
     * @returns {Function} A new function with extended scope.
     */
    var extendScope = function ( fn, thisArg, extraScope ) {

        // Extract function parameters as a string.
        var params = fn.toString().match( /\(([^\)]*)\)/ )[ 1 ]
        // Extract function body as a string.
          , source = fn.toString().match( /^[^\{]*\{((.*\s*)*)\}/m )[ 1 ]
          ;

        // Create a new Function constructor with `with(extraScope)`.
        fn = new Function (
            "extraScope" + ( params ? ", " + params : "" )
          , "with(extraScope) {" + source + "}"
        );

        // Return a wrapper that prepends `extraScope` to arguments.
        return function () {
            var args = [ extraScope ];
            util.each( arguments, function () {
                args.push( this );
            } );
            fn.apply( thisArg, args );
        };
    };

    // Expose Pavlov API globally.
    global.pavlov = api;

    // Test framework adapter placeholder (e.g., for QUnit, Jasmine).
    var adapter;

    /*
     * Sets the test framework adapter.
     * @param {Object} testFrameworkAdapter - The adapter to use.
     */
    api.setAdapter = function ( testFrameworkAdapter ) {
        adapter = testFrameworkAdapter;
    };

    // Execute the IIFE with global context.
}( this ) );