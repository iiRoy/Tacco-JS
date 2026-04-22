/***************************************************************************************************
 *
 *  Handlebars.js - Version 3.0.0
 *
 *  Copyright (C) 2011-2014 by Yehuda Katz
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (this "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 * @license
 **************************************************************************************************/

// This file exports the Handlebars library.
// It uses a Universal Module Definition (UMD) pattern.
/* exported Handlebars */

( function ( root, factory ) {

    // Check for AMD loader
    if ( typeof define === 'function' && define.amd ) {

        define( [], factory );

    }

    // Check for CommonJS environment
    else if ( typeof exports === 'object' ) {

        module.exports = factory();

    }

    // Browser global
    else {

        root.Handlebars = factory();
    }

} ( this, function () { // Self-executing anonymous function to encapsulate modules

    // handlebars/utils.js
    var __module3__ = ( function () {
        "use strict";

        var __exports__ = {};

        /*jshint -W004 */
        // Utility for escaping HTML characters.
        var escape = {
            "&" : "&amp;",
            "<" : "&lt;",
            ">" : "&gt;",
            "\"" : "&quot;",
            "'" : "&#x27;",
            "`" : "&#x60;"
        };

        // Regular expression to detect characters that need escaping.
        var badChars = /[&<>"'`]/g;
        // Optimization: check for *any* bad char before running replace.
        var possible = /[&<>"'`]/;

        /**
         * Replaces a single character with its HTML entity equivalent.
         * @param {string} chr - The character to escape.
         * @returns {string} The HTML entity.
         */
        function escapeChar( chr ) {
            return escape[ chr ];
        }


        /**
         * Extends an object with properties from one or more source objects.
         * @param {object} obj - The target object.
         * @param {...object} source - The source objects.
         * @returns {object} The modified target object.
         */
        function extend( obj /* , ...source */ ) {
            for ( var i = 1; i < arguments.length; i++ ) {
                var source = arguments[ i ];
                for ( var key in source ) {
                    // Ensure the property belongs to the object itself, not its prototype chain.
                    if ( Object.prototype.hasOwnProperty.call( source, key ) ) {
                        obj[ key ] = source[ key ];
                    }
                }
            }

            return obj;
        }

        __exports__.extend = extend;

        var toString = Object.prototype.toString;
        __exports__.toString = toString;

        // Sourced from lodash
        // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
        /**
         * Checks if `value` is classified as a `Function` object.
         * @param {*} value - The value to check.
         * @returns {boolean} `true` if `value` is a function, else `false`.
         */
        var isFunction = function ( value ) {
            return typeof value === 'function';
        };

        // fallback for older versions of Chrome and Safari where typeof /x/ is 'function'
        /* istanbul ignore next */
        if ( isFunction( /x/ ) ) {
            isFunction = function ( value ) {
                return typeof value === 'function' && toString.call( value ) === '[object Function]';
            };
        }
        // Re-declare for scope (or just remove the first `var isFunction` if not needed)
        var isFunction;
        __exports__.isFunction = isFunction;


        /* istanbul ignore next */
        // Polyfill for Array.isArray for older browsers.
        var isArray = Array.isArray || function ( value ) {
            return ( value && typeof value === 'object' ) ? toString.call( value ) === '[object Array]' : false;
        };
        __exports__.isArray = isArray;


        // Older IE versions do not directly support indexOf so we must implement our own, sadly.
        /**
         * Finds the first index of a given value in an array.
         * @param {Array} array - The array to search.
         * @param {*} value - The value to find.
         * @returns {number} The index of the value, or -1 if not found.
         */
        function indexOf( array, value ) {
            for ( var i = 0, len = array.length; i < len; i++ ) {
                if ( array[ i ] === value ) {
                    return i;
                }
            }
            return -1;
        }

        __exports__.indexOf = indexOf;


        /**
         * Escapes HTML characters in a string for safe output.
         * @param {*} string - The string or object to escape.
         * @returns {string} The escaped string.
         */
        function escapeExpression( string ) {
            // don't escape SafeStrings, since they're already safe
            if ( string && string.toHTML ) {
                return string.toHTML();
            } else if ( string == null ) { // Handles null or undefined
                return "";
            } else if ( !string ) { // Handles false, 0, empty string, etc.
                return string + '';
            }

            // Force a string conversion as this will be done by the append regardless and
            // the regex test will do this transparently behind the scenes, causing issues if
            // an object's to string has escaped characters in it.
            string = "" + string;

            // Only perform replace if there are characters that need escaping.
            if ( !possible.test( string ) ) {
                return string;
            }

            return string.replace( badChars, escapeChar );
        }

        __exports__.escapeExpression = escapeExpression;


        /**
         * Checks if a value is "empty" according to Handlebars' logic.
         * @param {*} value - The value to check.
         * @returns {boolean} `true` if empty, `false` otherwise.
         */
        function isEmpty( value ) {
            if ( !value && value !== 0 ) {
                return true;
            } else if ( isArray( value ) && value.length === 0 ) {
                return true;
            } else {
                return false;
            }
        }

        __exports__.isEmpty = isEmpty;


        /**
         * Adds path information to block parameters.
         * @param {Array} params - The block parameters.
         * @param {Array} ids - The path IDs.
         * @returns {Array} The modified block parameters.
         */
        function blockParams( params, ids ) {
            params.path = ids;
            return params;
        }

        __exports__.blockParams = blockParams;


        /**
         * Appends an ID to a context path.
         * @param {string} contextPath - The current context path.
         * @param {string} id - The ID to append.
         * @returns {string} The new context path.
         */
        function appendContextPath( contextPath, id ) {
            return ( contextPath ? contextPath + '.' : '' ) + id;
        }

        __exports__.appendContextPath = appendContextPath;

        return __exports__;
    } )();


    // handlebars/exception.js
    var __module4__ = ( function () {
        "use strict";

        var __exports__;

        // Properties typically found on Error objects.
        var errorProps = [ 'description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack' ];

        /**
         * Custom Handlebars Exception.
         * @param {string} message - The error message.
         * @param {object} node - The AST node where the error occurred (optional).
         * @constructor
         */
        function Exception( message, node ) {
            var loc = node && node.loc,
                line,
                column;

            if ( loc ) {
                line = loc.start.line;
                column = loc.start.column;

                message += ' - ' + line + ':' + column;
            }

            // Call parent Error constructor
            var tmp = Error.prototype.constructor.call( this, message );

            // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
            for ( var idx = 0; idx < errorProps.length; idx++ ) {
                this[ errorProps[ idx ] ] = tmp[ errorProps[ idx ] ];
            }

            if ( loc ) {
                this.lineNumber = line;
                this.column = column;
            }
        }

        // Inherit from Error.
        Exception.prototype = new Error();

        __exports__ = Exception;
        return __exports__;
    } )();


    // handlebars/base.js
    var __module2__ = ( function ( __dependency1__, __dependency2__ ) {
        "use strict";

        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;

        var VERSION = "3.0.0";
        __exports__.VERSION = VERSION;

        var COMPILER_REVISION = 6;
        __exports__.COMPILER_REVISION = COMPILER_REVISION;

        // Mapping compiler revisions to Handlebars versions.
        var REVISION_CHANGES = {
            1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
            2: '== 1.0.0-rc.3',
            3: '== 1.0.0-rc.4',
            4: '== 1.x.x',
            5: '== 2.0.0-alpha.x',
            6: '>= 2.0.0-beta.1'
        };
        __exports__.REVISION_CHANGES = REVISION_CHANGES;

        // Destructure commonly used utilities.
        var isArray = Utils.isArray,
            isFunction = Utils.isFunction,
            toString = Utils.toString,
            objectType = '[object Object]';


        /**
         * Represents a Handlebars environment (helpers and partials).
         * @param {object} helpers - Initial helpers.
         * @param {object} partials - Initial partials.
         * @constructor
         */
        function HandlebarsEnvironment( helpers, partials ) {
            this.helpers = helpers || {};
            this.partials = partials || {};

            registerDefaultHelpers( this );
        }

        __exports__.HandlebarsEnvironment = HandlebarsEnvironment;

        HandlebarsEnvironment.prototype = {
            constructor: HandlebarsEnvironment,

            logger: logger,
            log: log,

            /**
             * Registers a helper function or a map of helpers.
             * @param {string|object} name - The helper name or an object of name-function pairs.
             * @param {function} [fn] - The helper function.
             */
            registerHelper: function ( name, fn ) {
                if ( toString.call( name ) === objectType ) {
                    if ( fn ) {
                        throw new Exception( 'Arg not supported with multiple helpers' );
                    }
                    Utils.extend( this.helpers, name );
                } else {
                    this.helpers[ name ] = fn;
                }
            },

            /**
             * Unregisters a helper by name.
             * @param {string} name - The name of the helper to unregister.
             */
            unregisterHelper: function ( name ) {
                delete this.helpers[ name ];
            },

            /**
             * Registers a partial template or a map of partials.
             * @param {string|object} name - The partial name or an object of name-template pairs.
             * @param {string|function} [partial] - The partial template string or compiled function.
             */
            registerPartial: function ( name, partial ) {
                if ( toString.call( name ) === objectType ) {
                    Utils.extend( this.partials, name );
                } else {
                    if ( typeof partial === 'undefined' ) {
                        throw new Exception( 'Attempting to register a partial as undefined' );
                    }
                    this.partials[ name ] = partial;
                }
            },

            /**
             * Unregisters a partial by name.
             * @param {string} name - The name of the partial to unregister.
             */
            unregisterPartial: function ( name ) {
                delete this.partials[ name ];
            }
        };


        /**
         * Registers the default built-in helpers with the given Handlebars environment instance.
         * @param {HandlebarsEnvironment} instance - The Handlebars environment instance.
         */
        function registerDefaultHelpers( instance ) {

            // Helper for missing helpers/fields.
            instance.registerHelper( 'helperMissing', function ( /* [args, ]options */ ) {
                if ( arguments.length === 1 ) {
                    // A missing field in a {{foo}} construct.
                    return undefined;
                } else {
                    // Someone is actually trying to call something, blow up.
                    throw new Exception( "Missing helper: '" + arguments[ arguments.length - 1 ].name + "'" );
                }
            } );


            // Helper for missing block helpers.
            instance.registerHelper( 'blockHelperMissing', function ( context, options ) {
                var inverse = options.inverse,
                    fn = options.fn;

                if ( context === true ) {
                    return fn( this );
                } else if ( context === false || context == null ) {
                    return inverse( this );
                } else if ( isArray( context ) ) {
                    if ( context.length > 0 ) {
                        if ( options.ids ) {
                            options.ids = [ options.name ];
                        }

                        return instance.helpers.each( context, options );
                    } else {
                        return inverse( this );
                    }
                } else {
                    // If context is an object and not empty, render the block.
                    if ( options.data && options.ids ) {
                        var data = createFrame( options.data );
                        data.contextPath = Utils.appendContextPath( options.data.contextPath, options.name );
                        options = { data: data }; // Reassign options to use the new data frame.
                    }

                    return fn( context, options );
                }
            } );


            // The `each` helper for iterating over arrays or objects.
            instance.registerHelper( 'each', function ( context, options ) {
                if ( !options ) {
                    throw new Exception( 'Must pass iterator to #each' );
                }

                var fn = options.fn,
                    inverse = options.inverse;
                var i = 0,
                    ret = "",
                    data;

                var contextPath;
                if ( options.data && options.ids ) {
                    contextPath = Utils.appendContextPath( options.data.contextPath, options.ids[ 0 ] ) + '.';
                }

                // Resolve context if it's a function.
                if ( isFunction( context ) ) {
                    context = context.call( this );
                }

                if ( options.data ) {
                    data = createFrame( options.data );
                }

                // Helper function for executing an iteration.
                function execIteration( key, i, last ) {
                    if ( data ) {
                        data.key = key;
                        data.index = i;
                        data.first = i === 0;
                        data.last = !!last;

                        if ( contextPath ) {
                            data.contextPath = contextPath + key;
                        }
                    }

                    ret = ret + fn( context[ key ], {
                        data: data,
                        blockParams: Utils.blockParams( [ context[ key ], key ], [ contextPath + key, null ] )
                    } );
                }

                if ( context && typeof context === 'object' ) {
                    if ( isArray( context ) ) {
                        for ( var j = context.length; i < j; i++ ) {
                            execIteration( i, i, i === context.length - 1 );
                        }
                    } else {
                        var priorKey;

                        for ( var key in context ) {
                            if ( context.hasOwnProperty( key ) ) {
                                // We're running the iterations one step out of sync so we can detect
                                // the last iteration without have to scan the object twice and create
                                // an itermediate keys array.
                                if ( priorKey ) {
                                    execIteration( priorKey, i - 1 );
                                }
                                priorKey = key;
                                i++;
                            }
                        }
                        if ( priorKey ) {
                            execIteration( priorKey, i - 1, true );
                        }
                    }
                }

                if ( i === 0 ) {
                    ret = inverse( this );
                }

                return ret;
            } );


            // The `if` conditional helper.
            instance.registerHelper( 'if', function ( conditional, options ) {
                if ( isFunction( conditional ) ) {
                    conditional = conditional.call( this );
                }

                // Default behavior is to render the positive path if the value is truthy and not empty.
                // The `includeZero` option may be set to treat the condtional as purely not empty based on the
                // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
                if ( ( !options.hash.includeZero && !conditional ) || Utils.isEmpty( conditional ) ) {
                    return options.inverse( this );
                } else {
                    return options.fn( this );
                }
            } );


            // The `unless` conditional helper (inverse of `if`).
            instance.registerHelper( 'unless', function ( conditional, options ) {
                return instance.helpers[ 'if' ].call( this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash } );
            } );


            // The `with` helper for changing context.
            instance.registerHelper( 'with', function ( context, options ) {
                if ( isFunction( context ) ) {
                    context = context.call( this );
                }

                var fn = options.fn;

                if ( !Utils.isEmpty( context ) ) {
                    if ( options.data && options.ids ) {
                        var data = createFrame( options.data );
                        data.contextPath = Utils.appendContextPath( options.data.contextPath, options.ids[ 0 ] );
                        options = { data: data };
                    }

                    return fn( context, options );
                } else {
                    return options.inverse( this );
                }
            } );


            // The `log` helper for logging messages.
            instance.registerHelper( 'log', function ( message, options ) {
                var level = options.data && options.data.level != null ? parseInt( options.data.level, 10 ) : 1;
                instance.log( level, message );
            } );


            // The `lookup` helper for dynamic property access.
            instance.registerHelper( 'lookup', function ( obj, field ) {
                return obj && obj[ field ];
            } );
        }


        // Logger object for Handlebars.
        var logger = {
            methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

            // State enum for log levels
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 1, // Default log level is INFO

            // Can be overridden in the host environment
            log: function ( level, message ) {
                if ( typeof console !== 'undefined' && logger.level <= level ) {
                    var method = logger.methodMap[ level ];
                    ( console[ method ] || console.log ).call( console, message );
                }
            }
        };
        __exports__.logger = logger;


        var log = logger.log;
        __exports__.log = log;


        /**
         * Creates a new data frame, inheriting from a parent data frame.
         * @param {object} object - The parent data frame.
         * @returns {object} The new data frame.
         */
        var createFrame = function ( object ) {
            var frame = Utils.extend( {}, object );
            frame._parent = object;
            return frame;
        };
        __exports__.createFrame = createFrame;

        return __exports__;
    } )( __module3__, __module4__ );


    // handlebars/safe-string.js
    var __module5__ = ( function () {
        "use strict";

        var __exports__;

        // Build out our basic SafeString type
        /**
         * Represents a string that should not be escaped by Handlebars.
         * @param {string} string - The raw string content.
         * @constructor
         */
        function SafeString( string ) {
            this.string = string;
        }

        // Methods to convert SafeString to a plain string.
        SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
            return "" + this.string;
        };

        __exports__ = SafeString;
        return __exports__;
    } )();


    // handlebars/runtime.js
    var __module6__ = ( function ( __dependency1__, __dependency2__, __dependency3__ ) {
        "use strict";

        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;
        var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
        var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
        var createFrame = __dependency3__.createFrame;


        /**
         * Checks if the template's compiler revision is compatible with the current runtime.
         * @param {Array} compilerInfo - The compiler revision and version string from the compiled template.
         * @throws {Exception} If the compiler revision is incompatible.
         */
        function checkRevision( compilerInfo ) {
            var compilerRevision = compilerInfo && compilerInfo[ 0 ] || 1,
                currentRevision = COMPILER_REVISION;

            if ( compilerRevision !== currentRevision ) {
                if ( compilerRevision < currentRevision ) {
                    var runtimeVersions = REVISION_CHANGES[ currentRevision ],
                        compilerVersions = REVISION_CHANGES[ compilerRevision ];
                    throw new Exception( "Template was precompiled with an older version of Handlebars than the current runtime. " +
                        "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ")." );
                } else {
                    // Use the embedded version info since the runtime doesn't know about this revision yet
                    throw new Exception( "Template was precompiled with a newer version of Handlebars than the current runtime. " +
                        "Please update your runtime to a newer version (" + compilerInfo[ 1 ] + ")." );
                }
            }
        }

        __exports__.checkRevision = checkRevision;

        // TODO: Remove this line and break up compilePartial (comment kept from original, as per instructions)


        /**
         * Creates a compiled template function from a template specification.
         * @param {object} templateSpec - The precompiled template specification.
         * @param {object} env - The Handlebars environment.
         * @returns {function} A function that renders the template.
         */
        function template( templateSpec, env ) {
            /* istanbul ignore next */
            if ( !env ) {
                throw new Exception( "No environment passed to template" );
            }
            if ( !templateSpec || !templateSpec.main ) {
                throw new Exception( 'Unknown template object: ' + typeof templateSpec );
            }

            // Note: Using env.VM references rather than local var references throughout this section to allow
            // for external users to override these as psuedo-supported APIs.
            env.VM.checkRevision( templateSpec.compiler );

            // Wrapper for invoking partials.
            var invokePartialWrapper = function ( partial, context, options ) {
                if ( options.hash ) {
                    context = Utils.extend( {}, context, options.hash );
                }

                partial = env.VM.resolvePartial.call( this, partial, context, options );
                var result = env.VM.invokePartial.call( this, partial, context, options );

                if ( result == null && env.compile ) { // If partial not found and compile is available, compile it.
                    options.partials[ options.name ] = env.compile( partial, templateSpec.compilerOptions, env );
                    result = options.partials[ options.name ]( context, options );