var Handlebars = ( function ( ) {

    // This is the beginning of the main Handlebars module IIFE.
    // It encapsulates all the internal modules.

    // Module: handlebars/safe-string.js
    // This module defines the SafeString object.
    var __module4__ = ( function ( ) {

        "use strict" ; /* Enforce strict mode for this module */

        var __exports__ ; // This variable will hold the module's exports.

        // Build out our basic SafeString type.
        // It's used to mark strings that are safe for direct output without escaping.
        function SafeString ( string ) {
            this . string = string ;
        } // End of SafeString constructor.

        SafeString . prototype . toString = function ( ) {
            /*
             * The toString method returns the raw string content.
             * It's crucial for how SafeString interacts with escapeExpression.
             */
            return "" + this . string ;
        } ;

        __exports__ = SafeString ; // Export the SafeString constructor.
        return __exports__ ; // Return the exports object.
    } ) ( ) ; /* End of __module4__ IIFE */



    // Module: handlebars/utils.js
    // This module provides utility functions for Handlebars.
    var __module3__ = ( function ( __dependency1__ ) {

        "use strict" ; /* Strict mode activation */

        var __exports__ = { } ; // Initialize exports object.
        var SafeString = __dependency1__ ; // Import SafeString from __module4__.

        // Check if a value is an array.
        var isArray = Array . isArray ;

        // HTML escape map.
        var escape = {
            "&" : "&amp;" ,
            "<" : "&lt;" ,
            ">" : "&gt;" ,
            '"' : "&quot;" ,
            "'" : "&#x27;" ,
            "`" : "&#x60;"
        } ; // End of escape character map.

        // Regular expression to find characters that need escaping.
        var badChars = /[&<>"'`]/g ;
        // Regular expression to quickly check if escaping might be needed.
        var possible = /[&<>"'`]/ ;

        /*
         * Helper function to replace a single character with its HTML entity.
         * @param {string} chr - The character to escape.
         * @returns {string} The escaped character or default &amp;.
         */
        function escapeChar ( chr ) {
            return escape [ chr ] || "&amp;" ;
        } // End of escapeChar function.

        // Extends an object with properties from another object.
        function extend ( obj , value ) {
            for ( var key in value ) { // Iterate over all properties.
                if ( value . hasOwnProperty ( key ) ) { // Ensure it's an own property.
                    obj [ key ] = value [ key ] ; // Copy the property.
                } // End of hasOwnProperty check.
            } // End of for...in loop.
        } // End of extend function.

        __exports__ . extend = extend ; /* Export the extend utility function. */

        // Escapes HTML entities in a given string.
        function escapeExpression ( string ) {
            // Don't escape SafeStrings, since they're already marked as safe.
            if ( string instanceof SafeString ) {
                return string . toString ( ) ;
            } else if ( ! string && string !== 0 ) { // Handle falsy values except 0.
                return "" ; // Return an empty string for null, undefined, false.
            }

            // Force a string conversion as this will be done by the append regardless
            // and the regex test will do this transparently behind the scenes, potentially
            // causing issues if an object's toString method has escaped characters in it.
            string = "" + string ;

            // Quick check if any bad characters are present before doing a full replace.
            if ( ! possible . test ( string ) ) { return string ; }
            return string . replace ( badChars , escapeChar ) ; // Perform the actual escaping.
        } // End of escapeExpression function.

        __exports__ . escapeExpression = escapeExpression ; /* Export the escapeExpression function. */

        // Checks if a value is considered "empty" by Handlebars.
        function isEmpty ( value ) {
            if ( ! value && value !== 0 ) { // Null, undefined, false, empty string (but not 0).
                return true ;
            } else if ( isArray ( value ) && value . length === 0 ) { // Empty array.
                return true ;
            } else {
                return false ;
            } // End of conditional checks.
        } // End of isEmpty function.

        __exports__ . isEmpty = isEmpty ; /* Export the isEmpty utility. */
        return __exports__ ; // Return all exports from this module.
    } ) ( __module4__ ) ; /* End of __module3__ IIFE, depending on __module4__. */



    // Module: handlebars/exception.js
    // This module defines a custom Exception type for Handlebars.
    var __module5__ = ( function ( ) {

        "use strict" ; // Strict mode.

        var __exports__ ; // Module exports.

        // Properties typically found on Error objects.
        var errorProps = [ 'description' , 'fileName' , 'lineNumber' , 'message' , 'name' , 'number' , 'stack' ] ;

        /**
         * Custom Exception constructor.
         * Inherits from native Error.
         * @param {string} message - The error message.
         */
        function Exception ( /* message */ ) {
            // Call the Error constructor to set basic error properties.
            var tmp = Error . prototype . constructor . apply ( this , arguments ) ;

            // Unfortunately, error properties are not enumerable in Chrome (at least),
            // so `for prop in tmp` doesn't work reliably.
            // Manually copy common error properties.
            for ( var idx = 0 ; idx < errorProps . length ; idx ++ ) {
                this [ errorProps [ idx ] ] = tmp [ errorProps [ idx ] ] ;
            } // End of error properties copy loop.
        } // End of Exception constructor.

        Exception . prototype = new Error ( ) ; // Set up prototype chain for inheritance.

        __exports__ = Exception ; // Export the Exception constructor.
        return __exports__ ; // Return the module's exports.
    } ) ( ) ; /* End of __module5__ IIFE. */



    // Module: handlebars/base.js
    // This module defines the core Handlebars environment and basic helpers.
    var __module2__ = ( function ( __dependency1__ , __dependency2__ ) {

        "use strict" ; /* Enforce strict mode. */

        var __exports__ = { } ; // Module exports object.
        /*globals Exception, Utils */ // These are provided as dependencies.

        var Utils = __dependency1__ ; // Import utility functions.
        var Exception = __dependency2__ ; // Import custom Exception class.

        // Current version of Handlebars.
        var VERSION = "1.1.0" ;
        __exports__ . VERSION = VERSION ;

        // Compiler revision number.
        var COMPILER_REVISION = 4 ;
        __exports__ . COMPILER_REVISION = COMPILER_REVISION ;

        // Mapping compiler revisions to Handlebars versions.
        var REVISION_CHANGES = {
            1 : '<= 1.0.rc.2' , // Revision 1: up to 1.0.rc.2 (though 1.0.rc.2 was rev2 internally).
            2 : '== 1.0.0-rc.3' , // Revision 2: for 1.0.0-rc.3.
            3 : '== 1.0.0-rc.4' , // Revision 3: for 1.0.0-rc.4.
            4 : '>= 1.0.0'       // Revision 4: from 1.0.0 onwards.
        } ;
        __exports__ . REVISION_CHANGES = REVISION_CHANGES ;

        // Cache Object.prototype.toString for type checking.
        var toString = Object . prototype . toString ,
            objectType = '[object Object]' ; // String representation of a plain object.

        // Sourced from lodash (https://github.com/bestiejs/lodash/blob/master/LICENSE.txt)
        // Helper to check if a value is a function.
        var isFunction = function ( value ) {
            return typeof value === 'function' ;
        } ;
        // Fallback for older versions of Chrome and Safari where regexes might report as functions.
        if ( isFunction ( /x/ ) ) {
            isFunction = function ( value ) {
                return typeof value === 'function' && toString . call ( value ) === '[object Function]' ;
            } ;
        } // End of isFunction polyfill.

        // Helper to check if a value is an array.
        function isArray ( value ) {
            return ( value && typeof value === 'object' ) ? toString . call ( value ) === '[object Array]' : false ;
        } // End of isArray helper.

        /**
         * Handlebars environment constructor.
         * Manages helpers and partials.
         * @param {object} helpers - Initial set of helpers.
         * @param {object} partials - Initial set of partials.
         */
        function HandlebarsEnvironment ( helpers , partials ) {
            this . helpers = helpers || { } ; // Initialize helpers.
            this . partials = partials || { } ; // Initialize partials.

            registerDefaultHelpers ( this ) ; // Register standard helpers.
        } // End of HandlebarsEnvironment constructor.

        __exports__ . HandlebarsEnvironment = HandlebarsEnvironment ; /* Export the environment constructor. */

        HandlebarsEnvironment . prototype = {
            constructor : HandlebarsEnvironment , // Ensure correct constructor reference.

            logger : logger , // Reference to the logger object.
            log : log ,       // Reference to the log function.

            /**
             * Register a new helper or a map of helpers.
             * @param {string|object} name - Helper name or object of helpers.
             * @param {function} fn - The helper function.
             * @param {boolean} [inverse] - If the helper is an inverse helper (deprecated).
             */
            registerHelper : function ( name , fn , inverse ) {
                if ( toString . call ( name ) === objectType ) { // If name is an object, it's a map of helpers.
                    if ( inverse || fn ) {
                        // Error if additional arguments are provided with a helper map.
                        throw new Exception ( 'Arg not supported with multiple helpers' ) ;
                    }
                    Utils . extend ( this . helpers , name ) ; // Extend existing helpers.
                } else { // Single helper registration.
                    if ( inverse ) { fn . not = inverse ; } // Attach inverse property if provided.
                    this . helpers [ name ] = fn ; // Register the helper.
                } // End of helper registration logic.
            } , // End of registerHelper method.

            /**
             * Register a new partial or a map of partials.
             * @param {string|object} name - Partial name or object of partials.
             * @param {string} str - The partial template string.
             */
            registerPartial : function ( name , str ) {
                if ( toString . call ( name ) === objectType ) { // If name is an object, it's a map of partials.
                    Utils . extend ( this . partials , name ) ; // Extend existing partials.
                } else { // Single partial registration.
                    this . partials [ name ] = str ; // Register the partial.
                } // End of partial registration logic.
            } // End of registerPartial method.
        } ; // End of HandlebarsEnvironment.prototype.

        // Registers the default helpers into the provided Handlebars environment instance.
        function registerDefaultHelpers ( instance ) {
            instance . registerHelper ( 'helperMissing' , function ( arg ) {
                if ( arguments . length === 2 ) { // If block helper was invoked without a context.
                    return undefined ;
                } else {
                    // Throw an error for a genuinely missing helper.
                    throw new Error ( "Missing helper: '" + arg + "'" ) ;
                } // End of helperMissing logic.
            } ) ; // End of helperMissing registration.

            instance . registerHelper ( 'blockHelperMissing' , function ( context , options ) {
                var inverse = options . inverse || function ( ) { } , // Default inverse function.
                    fn = options . fn ; // The main block function.

                if ( isFunction ( context ) ) { context = context . call ( this ) ; } // Resolve context if it's a function.

                if ( context === true ) {
                    return fn ( this ) ; // Render block if context is true.
                } else if ( context === false || context == null ) {
                    return inverse ( this ) ; // Render inverse if context is false or null/undefined.
                } else if ( isArray ( context ) ) {
                    if ( context . length > 0 ) {
                        return instance . helpers . each ( context , options ) ; // Use 'each' helper for non-empty arrays.
                    } else {
                        return inverse ( this ) ; // Render inverse for empty arrays.
                    } // End of array length check.
                } else {
                    return fn ( context ) ; // Render block with context for other truthy values.
                } // End of context type checks.
            } ) ; // End of blockHelperMissing registration.

            instance . registerHelper ( 'each' , function ( context , options ) {
                var fn = options . fn , // Main block function.
                    inverse = options . inverse ; // Inverse block function.
                var i = 0 , // Loop counter.
                    ret = "" , // Result string.
                    data ; // Data frame for iteration.

                if ( isFunction ( context ) ) { context = context . call ( this ) ; } // Resolve context if it's a function.

                if ( options . data ) {
                    data = createFrame ( options . data ) ; // Create a new data frame for iteration.
                } // End of data frame creation.

                if ( context && typeof context === 'object' ) {
                    if ( isArray ( context ) ) {
                        for ( var j = context . length ; i < j ; i ++ ) { // Iterate over array elements.
                            if ( data ) {
                                data . index = i ; // Current index.
                                data . first = ( i === 0 ) ; // Is this the first element?
                                data . last = ( i === ( context . length - 1 ) ) ; // Is this the last element?
                            } // End of data frame updates.
                            ret = ret + fn ( context [ i ] , { data : data } ) ; // Render block for each item.
                        } // End of array iteration loop.
                    } else { // Iterate over object properties.
                        for ( var key in context ) {
                            if ( context . hasOwnProperty ( key ) ) { // Ensure it's an own property.
                                if ( data ) { data . key = key ; } // Current key.
                                ret = ret + fn ( context [ key ] , { data : data } ) ; // Render block for each property.
                                i ++ ; // Increment counter for object iteration.
                            } // End of hasOwnProperty check.
                        } // End of object iteration loop.
                    } // End of array/object check.
                } // End of context existence and type check.

                if ( i === 0 ) { // If no items were iterated (empty array/object).
                    ret = inverse ( this ) ; // Render the inverse block.
                } // End of empty check.

                return ret ; // Return the accumulated string.
            } ) ; // End of 'each' helper registration.

            instance . registerHelper ( 'if' , function ( conditional , options ) {
                if ( isFunction ( conditional ) ) { conditional = conditional . call ( this ) ; } // Resolve conditional if it's a function.

                // Default behavior is to render the positive path if the value is truthy and not empty.
                // The `includeZero` option may be set to treat the conditional as purely not empty based on the
                // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
                if ( ( ! options . hash . includeZero && ! conditional ) || Utils . isEmpty ( conditional ) ) {
                    return options . inverse ( this ) ; // Render inverse block.
                } else {
                    return options . fn ( this ) ; // Render main block.
                } // End of 'if' conditional logic.
            } ) ; // End of 'if' helper registration.

            instance . registerHelper ( 'unless' , function ( conditional , options ) {
                // 'unless' is the inverse of 'if'.
                return instance . helpers [ 'if' ] . call ( this , conditional , { fn : options . inverse , inverse : options . fn , hash : options . hash } ) ;
            } ) ; // End of 'unless' helper registration.

            instance . registerHelper ( 'with' , function ( context , options ) {
                if ( isFunction ( context ) ) { context = context . call ( this ) ; } // Resolve context if it's a function.

                if ( ! Utils . isEmpty ( context ) ) {
                    return options . fn ( context ) ; // Render block if context is not empty.
                } // End of context empty check.
            } ) ; // End of 'with' helper registration.

            instance . registerHelper ( 'log' , function ( context , options ) {
                // Determine log level, default to 1 (INFO).
                var level = options . data && options . data . level != null ? parseInt ( options . data . level , 10 ) : 1 ;
                instance . log ( level , context ) ; // Call the instance's log method.
            } ) ; // End of 'log' helper registration.
        } // End of registerDefaultHelpers function.

        // Logger object for Handlebars.
        var logger = {
            methodMap : { 0 : 'debug' , 1 : 'info' , 2 : 'warn' , 3 : 'error' } , // Map log levels to console methods.

            // State enum for log levels.
            DEBUG : 0 ,
            INFO : 1 ,
            WARN : 2 ,
            ERROR : 3 ,
            level : 3 , // Default log level (ERROR).

            // Log function that can be overridden in the host environment.
            log : function ( level , obj ) {
                if ( logger . level <= level ) { // Check if the message should be logged.
                    var method = logger . methodMap [ level ] ; // Get the appropriate console method name.
                    if ( typeof console !== 'undefined' && console [ method ] ) {
                        console [ method ] . call ( console , obj ) ; // Call the console method.
                    } // End of console existence check.
                } // End of log level check.
            } // End of log method.
        } ; // End of logger object.
        __exports__ . logger = logger ;

        // Simple wrapper for the logger's log method.
        function log ( level , obj ) { logger . log ( level , obj ) ; }

        __exports__ . log = log ;

        // Creates a new data frame by extending an existing object.
        var createFrame = function ( object ) {
            var obj = { } ; // New empty object.
            Utils . extend ( obj , object ) ; // Extend it with properties from the provided object.
            return obj ; // Return the new data frame.
        } ;
        __exports__ . createFrame = createFrame ;

        return __exports__ ; // Return all exports from this base module.
    } ) ( __module3__ , __module5__ ) ; /* End of __module2__ IIFE, depending on __module3__ and __module5__. */



    // Module: handlebars/runtime.js
    // This module contains the Handlebars runtime functions.
    var __module6__ = ( function ( __dependency1__ , __dependency2__ , __dependency3__ ) {

        "use strict" ; /* Strict mode enabled. */

        var __exports__ = { } ; // Exports object.
        /*global Utils */ // Utils is imported.

        var Utils = __dependency1__ ; // Import utilities.
        var Exception = __dependency2__ ; // Import Exception class.
        var COMPILER_REVISION = __dependency3__ . COMPILER_REVISION ; // Import compiler revision.
        var REVISION_CHANGES = __dependency3__ . REVISION_CHANGES ; // Import revision changes map.

        // Checks if the template's compiler revision is compatible with the current runtime.
        function checkRevision ( compilerInfo ) {
            var compilerRevision = compilerInfo && compilerInfo [ 0 ] || 1 , // Get template's compiler revision.
                currentRevision = COMPILER_REVISION ; // Get current runtime's compiler revision.

            if ( compilerRevision !== currentRevision ) {
                if ( compilerRevision < currentRevision ) {
                    var runtimeVersions = REVISION_CHANGES [ currentRevision ] , // Get compatible runtime versions.
                        compilerVersions = REVISION_CHANGES [ compilerRevision ] ; // Get compatible compiler versions.
                    throw new Error ( "Template was precompiled with an older version of Handlebars than the current runtime. " +
                                      "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ")." ) ;
                } else {
                    // Use the embedded version info since the runtime doesn't know about this newer revision yet.
                    throw new Error ( "Template was precompiled with a newer version of Handlebars than the current runtime. " +
                                      "Please update your runtime to a newer version (" + compilerInfo [ 1 ] + ")." ) ;
                } // End of revision comparison.
            } // End of revision mismatch check.
        } // End of checkRevision function.

        // TODO: Remove this line and break up compilePartial
        // This comment should be preserved or modified, not removed.

        /**
         * Creates a template function from a template specification.
         * @param {object} templateSpec - The precompiled template specification.
         * @param {object} env - The Handlebars environment.
         * @returns {function} The runnable template function.
         */
        function template ( templateSpec , env ) {
            if ( ! env ) {
                throw new Error ( "No environment passed to template" ) ; // Environment is required.
            } // End of env check.

            var invokePartialWrapper ; // Function to invoke partials.

            if ( env . compile ) { // If the environment has a compiler (not runtime-only).
                invokePartialWrapper = function ( partial , name , context , helpers , partials , data ) {
                    // TODO : Check this for all inputs and the options handling (partial flag, etc).
                    // This feels like there should be a common execution path.
                    var result = invokePartial . apply ( this , arguments ) ; // Try to invoke existing partial.
                    if ( result ) { return result ; } // If successful, return result.

                    // If partial is not found directly, compile it if possible and store.
                    var options = { helpers : helpers , partials : partials , data : data } ;
                    partials [ name ] = env . compile ( partial , { data : data !== undefined } , env ) ;
                    return partials [ name ] ( context , options ) ; // Execute the newly compiled partial.
                } ;
            } else { // Runtime-only mode, no compiler available.
                invokePartialWrapper = function ( partial , name /* , context, helpers, partials, data */ ) {
                    var result = invokePartial . apply ( this , arguments ) ; // Try to invoke existing partial.
                    if ( result ) { return result ; } // If successful, return result.
                    throw new Exception ( "The partial " + name + " could not be compiled when running in runtime-only mode" ) ;
                } ;
            } // End of invokePartialWrapper definition.

            // The 'container' object provides runtime utilities to the template.
            var container = {
                escapeExpression : Utils . escapeExpression , // HTML escaping utility.
                invokePartial : invokePartialWrapper , // Partial invocation logic.
                programs : [ ] , // Cache for compiled program functions.
                program : function ( i , fn , data ) {
                    var programWrapper = this . programs [ i ] ; // Check cache.
                    if ( data ) {
                        programWrapper = program ( i , fn , data ) ; // If data is provided, create a new program instance.
                    } else if ( ! programWrapper ) {
                        programWrapper = this . programs [ i ] = program ( i , fn ) ; // Cache if not found.
                    }
                    return programWrapper ; // Return the program function.
                } , // End of program method.
                merge : function ( param , common ) {
                    var ret = param || common ; // Start with param if it exists, otherwise common.

                    if ( param && common && ( param !== common ) ) { // If both exist and are different.
                        ret = { } ; // Create a new object.
                        Utils . extend ( ret , common ) ; // Extend with common properties.
                        Utils . extend ( ret , param ) ; // Override with param properties.
                    } // End of merge logic.
                    return ret ; // Return the merged object.
                } , // End of merge method.
                programWithDepth : programWithDepth , // Program with depth support.
                noop : noop , // No-operation function.
                compilerInfo : null // Placeholder for compiler info.
            } ; // End of container object.

            // The main template function that will be returned.
            return function ( context , options ) {
                options = options || { } ; // Ensure options object exists.
                var namespace = options . partial ? options : env , // Determine namespace for lookup.
                    helpers ,
                    partials ;

                if ( ! options . partial ) { // If not rendering a partial directly.
                    helpers = options . helpers ; // Get helpers from options.
                    partials = options . partials ; // Get partials from options.
                }
                var result = templateSpec . call (
                                container , // 'this' context for the template.
                                namespace , // Namespace for resolution.
                                context ,   // The data context.
                                helpers ,   // Available helpers.
                                partials ,  // Available partials.
                                options . data ) ; // Additional data.

                if ( ! options . partial ) {
                    checkRevision ( container . compilerInfo ) ; // Check compiler revision after execution.
                }

                return result ; // Return the rendered result.
            } ; // End of returned template function.
        } // End of template function.

        __exports__ . template = template ;

        /**
         * Creates a program function that supports depth arguments.
         * Used for nested contexts like `../`.
         * @param {number} i - Program index.
         * @param {function} fn - The program's rendering function.
         * @param {object} data - Data frame.
         * @param {...any} $depth - Additional depth arguments.
         * @returns {function} The program function.
         */
        function programWithDepth ( i , fn , data /*, $depth */ ) {
            var args = Array . prototype . slice . call ( arguments , 3 ) ; // Capture depth arguments.

            var prog = function ( context , options ) {
                options = options || { } ; // Ensure options exist.

                // Apply the function with context, data, and depth arguments.
                return fn . apply ( this , [ context , options . data || data ] . concat ( args ) ) ;
            } ;
            prog . program = i ; // Store program index.
            prog . depth = args . length ; // Store depth.
            return prog ; // Return the program function.
        } // End of programWithDepth function.

        __exports__ . programWithDepth = programWithDepth ;

        /**
         * Creates a basic program function.
         * @param {number} i - Program index.
         * @param {function} fn - The program's rendering function.
         * @param {object} data - Data frame.
         * @returns {function} The program function.
         */
        function program ( i , fn , data ) {
            var prog = function ( context , options ) {
                options = options || { } ; // Ensure options exist.

                return fn ( context , options . data || data ) ; // Execute the function with context and data.
            } ;
            prog . program = i ; // Store program index.
            prog . depth = 0 ; // No depth for basic program.
            return prog ; // Return the program function.
        } // End of program function.

        __exports__ . program = program ;

        /**
         * Invokes a partial template.
         * @param {function|string} partial - The partial function or string.
         * @param {string} name - The name of the partial.
         * @param {object} context - The data context.
         * @param {object} helpers - Available helpers.
         * @param {object} partials - Available partials.
         * @param {object} data - Data frame.
         * @returns {string} The rendered partial output.
         * @throws {Exception} If partial is not found.
         */
        function invokePartial ( partial , name , context , helpers , partials , data ) {
            var options = { partial : true , helpers : helpers , partials : partials , data : data } ;

            if ( partial === undefined ) {
                throw new Exception ( "The partial " + name + " could not be found" ) ;
            } else if ( partial instanceof Function ) {
                return partial ( context , options ) ; // Execute the partial function.
            } // End of partial type check.
        } // End of invokePartial function.

        __exports__ . invokePartial = invokePartial ;

        // A no-operation function that returns an empty string.
        function noop ( ) { return "" ; }

        __exports__ . noop = noop ;
        return __exports__ ; // Return all exports from this runtime module.
    } ) ( __module3__ , __module5__ , __module2__ ) ; /* End of __module6__ IIFE. */



    // Module: handlebars.runtime.js
    // This module combines all runtime components into the main Handlebars object.
    var __module1__ = ( function ( __dependency1__ , __dependency2__ , __dependency3__ , __dependency4__ , __dependency5__ ) {

        "use strict" ; /* Strict mode. */

        var __exports__ ; // Module exports (will be the Handlebars object).
        var base = __dependency1__ ; // Import base environment.

        // Each of these augment the Handlebars object.
        // No need to set up here; this is done to easily share code
        // between commonjs and browser environments.
        var SafeString = __dependency2__ ; // Import SafeString.
        var Exception = __dependency3__ ; // Import Exception.
        var Utils = __dependency4__ ; // Import utilities.
        var runtime = __dependency5__ ; // Import runtime functions.

        // For compatibility and usage outside of module systems,
        // make the Handlebars object a namespace.
        var create = function ( ) {
            var hb = new base . HandlebarsEnvironment ( ) ; // Create a new Handlebars environment.

            Utils . extend ( hb , base ) ; // Extend with base properties.
            hb . SafeString = SafeString ; // Attach SafeString.
            hb . Exception = Exception ; // Attach Exception.
            hb . Utils = Utils ; // Attach Utils.

            hb . VM = runtime ; // Attach the runtime (VM).
            hb . template = function ( spec ) {
                return runtime . template ( spec , hb ) ; // Create a template function.
            } ;

            return hb ; // Return the configured Handlebars object.
        } ; // End of create function.

        var Handlebars = create ( ) ; // Create the initial Handlebars instance.
        Handlebars . create = create ; // Allow creating new instances.

        __exports__ = Handlebars ; // Export the Handlebars object.
        return __exports__ ; // Return the module's exports.
    } ) ( __module2__ , __module4__ , __module5__ , __module3__ , __module6__ ) ; /* End of __module1__ IIFE. */



    // Module: handlebars/compiler/ast.js
    // This module defines Abstract Syntax Tree (AST) nodes used by the Handlebars compiler.
    // NOTE: The provided code snippet only includes a partial definition of this module.
    var __module7__ = ( function ( __dependency1__ ) {

        "use strict" ; /* Strict mode. */

        var __exports__ = { } ; // Module exports object.
        var Exception = __dependency1__ ; // Import Exception class.

        /**
         * Represents a Program AST node.
         * @param {Array<ASTNode>} statements - List of statements in the program.
         * @param {object} inverseStrip - Stripping information for the inverse block.
         * @param {Array<ASTNode>} inverse - Statements for the inverse block (if any).
         */
        function ProgramNode ( statements , inverseStrip , inverse ) {
            this . type = "program" ; // Node type.
            this . statements = statements ; // Child statements.
            this . strip = { } ; // Whitespace stripping information.

            if ( inverse ) {
                this . inverse = new ProgramNode ( inverse , inverseStrip ) ; // Create an inverse program node.
                this . strip . right = inverseStrip . left ; // Inherit right strip from inverse's left strip.
            } // End of inverse block handling.