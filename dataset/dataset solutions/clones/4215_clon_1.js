/*
 * This file contains a module export, likely a webpack bootstrap or similar
 * module system implementation.
 *
 * It defines a function that takes a 'modules' array (t) and sets up the
 * module loading and caching mechanism.
 */
module . exports = function ( t ) {

    // Cache for loaded modules.
    var e = {};

    /*
     * The core module loading function.
     * n: The module ID.
     */
    function r ( n ) {

        // If the module is already in the cache, return its exports.
        if ( e [ n ] ) {
            return e [ n ] . exports ;
        }

        // Create a new module entry in the cache.
        // i: The module object itself.
        var i = e [ n ] = {
            i       :   n           ,   // Module ID
            l       :   ! false     ,   // Flag indicating if the module has been loaded
            exports :   {}              // The exports object for the module
        };

        // Execute the module function, passing the module object,
        // its exports, and the 'r' (require) function.
        t [ n ] . call ( i . exports , i , i . exports , r ) ;

        // Mark the module as loaded.
        i . l = ! 0 ;

        // Return the module's exports.
        return i . exports ;
    }

    // Store the modules array (t) on the 'r' function.
    r . m = t ;

    // Store the module cache (e) on the 'r' function.
    r . c = e ;

    /**
     * Define a getter function for a module property.
     * This is used for compatibility with ES module exports.
     *
     * @param {object} t - The target object (module exports).
     * @param {string} e - The property name.
     * @param {function} n - The getter function for the property.
     */
    r . d = function ( t , e , n ) {
        // Check if the property already exists on the object.
        if ( ! r . o ( t , e ) ) {
            // If not, define it as an enumerable property with the given getter.
            Object . defineProperty ( t , e , {
                enumerable  :   ! 0     ,
                get         :   n
            } ) ;
        }
    };

    /**
     * Mark a module as an ES module.
     * This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"'.
     *
     * @param {object} t - The module exports object.
     */
    r . r = function ( t ) {
        // Add Symbol.toStringTag for better debugging/inspection if available.
        if ( "undefined" != typeof Symbol && Symbol . toStringTag ) {
            Object . defineProperty ( t , Symbol . toStringTag , { value : "Module" } ) ;
        }
        // Mark the module as an ES module.
        Object . defineProperty ( t , "__esModule" , { value : ! 0 } ) ;
    } ;

    /**
     * Compatibility getter for non-ES modules.
     * This helps in handling default exports and namespace imports.
     *
     * @param {any} t - The module value.
     * @param {number} e - Flags indicating how to interpret 't'.
     *                      1: If 't' is a module ID, load it.
     *                      4: If 't' is an ES module, return it directly.
     *                      8: Return 't' directly.
     *                      2: Bind getters for all properties if 't' is not a string.
     * @returns {object} The normalized module object.
     */
    r . t = function ( t , e ) {
        // Flag 1: If 't' is a module ID, load it.
        if ( 1 & e ) {
            t = r ( t ) ;
        }
        // Flag 8: Return 't' directly.
        if ( 8 & e ) {
            return t ;
        }
        // Flag 4: If 't' is an ES module, return it directly.
        if ( 4 & e && "object" == typeof t && t && t . __esModule ) {
            return t ;
        }
        // Create a new object for the normalized module.
        var n = Object . create ( null ) ;
        // Mark it as an ES module.
        if ( r . r ( n ) ) {
            // Define the 'default' export.
            Object . defineProperty ( n , "default" , { enumerable : ! 0 , value : t } ) ;
        }
        // Flag 2: If 't' is not a string, bind getters for all its properties.
        if ( 2 & e && "string" != typeof t ) {
            for ( var i in t ) {
                r . d ( n , i , function ( e ) {
                    return t [ e ] ;
                } . bind ( null , i ) ) ;
            }
        }
        return n ;
    } ;

    /**
     * Create a namespace object for a module.
     * This handles modules with or without a default export.
     *
     * @param {object} t - The module object.
     * @returns {function} A getter function for the module's default export
     *                     or the module itself.
     */
    r . n = function ( t ) {
        var e = t && t . __esModule ?
            function ( ) { return t . default ; } :
            function ( ) { return t ; } ;
        // Define an 'a' property on the getter function that returns the getter itself.
        r . d ( e , "a" , e ) ;
        return e ;
    } ;

    /**
     * Check if an object has a property.
     * This is a wrapper for Object.prototype.hasOwnProperty.call.
     *
     * @param {object} t - The object to check.
     * @param {string} e - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    r . o = function ( t , e ) {
        return Object . prototype . hasOwnProperty . call ( t , e ) ;
    } ;

    // Set the public path for asset loading (empty in this case).
    r . p = "" ;

    // Load the entry module (module 0 in this case) and return its exports.
    return r ( r . s = 0 ) ;

} ( [

    /*
     * Module 0: Main entry point.
     * This module reads from stdin and processes the input.
     */
    function ( t , e , r ) {
        "use strict" ;

        // Require module 1 (fs)
        var n = r ( 1 ) ;

        // Require module 2 and call it with the content read from stdin.
        // The input is read as UTF-8.
        r ( 2 ) ( n . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
    } ,

    /*
     * Module 1: File System (fs) module.
     * This module simply exports the built-in 'fs' Node.js module.
     */
    function ( t , e ) {
        t . exports = require ( "fs" ) ;
    } ,

    /*
     * Module 2: Input processing logic.
     * This module exports a function that takes a string input,
     * creates an InputReader, and then calls a solver function.
     */
    function ( t , e , r ) {
        "use strict" ;

        // Require module 3 (InputReader class)
        var n = r ( 3 ) ;
        // Require module 5 (solver function)
        var i = r ( 5 ) ;

        // Export a function that processes the input string.
        t . exports = function ( t ) {
            // Create a new instance of the InputReader with the input string.
            var e = new n ( t ) ;
            // Call the solver function with the InputReader instance.
            i ( e ) ;
        } ;
    } ,

    /*
     * Module 3: InputReader class.
     * This class provides methods to read tokenized input.
     */
    function ( t , e , r ) {
        "use strict" ;

        // Require module 4 (Queue class)
        var n = r ( 4 ) ;

        // Export the InputReader class.
        t . exports = class {

            /**
             * Constructor for InputReader.
             * @param {string} t - The raw input string.
             */
            constructor ( t ) {
                // Trim whitespace and split the input string by any whitespace
                // into an array of tokens.
                var e = t . trim ( ) . split ( / \s+ / g ) ;
                // Create a new Queue instance with the tokenized input.
                this . inp = new n ( e ) ;
            }

            /**
             * Dequeues and returns the next raw input token.
             * @returns {string} The next token from the input queue.
             */
            inr ( ) {
                return this . inp . deq ( ) ;
            }

            /**
             * Dequeues and returns the next input token as an integer.
             * @returns {number} The next token parsed as an integer.
             */
            in ( ) {
                return parseInt ( this . inp . deq ( ) , 10 ) ;
            }

            /**
             * Clears the input queue.
             */
            fin ( ) {
                this . inp . clear ( ) ;
            }
        } ;
    } ,

    /*
     * Module 4: Queue class.
     * A simple queue implementation.
     */
    function ( t , e , r ) {
        "use strict" ;

        // Export the Queue class.
        t . exports = class {

            /**
             * Constructor for Queue.
             * @param {Array} [t=[]] - Initial items for the queue.
             */
            constructor ( ) {
                // Default to an empty array if no initial items are provided.
                var t = arguments . length > 0 && void 0 !== arguments [ 0 ] ? arguments [ 0 ] : [ ] ;

                this . size  = t . length ; // Current number of items in the queue.
                this . items = t          ; // The internal array holding queue items.
                this . ind   = 0          ; // Index of the front of the queue.
            }

            /**
             * Adds an item to the back of the queue.
             * @param {any} t - The item to add.
             */
            enq ( t ) {
                this . size += 1 ;
                this . items . push ( t ) ;
            }

            /**
             * Removes and returns the item from the front of the queue.
             * @returns {any} The item at the front of the queue.
             */
            deq ( ) {
                var t = this . items [ this . ind ] ;
                this . size -= 1 ;
                this . ind  += 1 ;
                return t ;
            }

            /**
             * Clears all items from the queue.
             */
            clear ( ) {
                this . items = [ ] ;
                this . size  = 0   ;
                this . ind   = 0   ;
            }
        } ;
    } ,

    /*
     * Module 5: Solver logic.
     * This module exports a function that takes an InputReader instance
     * and solves a specific problem related to repeating digits.
     */
    function ( t , e , r ) {
        "use strict" ;

        // Export the solver function.
        t . exports = function ( t ) {
            // e: Counter for consecutive identical digits. Initialized to 1.
            var e = 1 ;
            // r: The previous digit encountered. Initialized to -1 (sentinel).
            var r = -1 ;
            // n: The number to process, read from input.
            for ( var n = t . in ( ) ; n > 0 ; ) {
                // i: The current digit (last digit of n).
                var i = n % 10 ;

                // Check if the current digit is the same as the previous digit.
                if ( i == r ) {
                    // If same, increment the consecutive count.
                    e ++ ;
                } else {
                    // If different, reset the previous digit and reset count to 1.
                    r = i ;
                    e = 1 ;
                }

                // Move to the next digit by removing the last digit from n.
                n = Math . floor ( n / 10 ) ;
            }

            // After processing all digits, check if any digit appeared 3 or more times consecutively.
            if ( e >= 3 ) {
                console . log ( "Yes" ) ;
            } else {
                console . log ( "No" ) ;
            }
        } ;
    }
] ) ;
// End of the main module export function.