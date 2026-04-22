/*
 This is a Type I clone of the original JavaScript code.
 This means that all functional aspects, variable names,
 and expressions are exactly the same.
 Only whitespace and comments have been altered significantly.
 */


module . exports = function ( t ) {
    // This 'e' object serves as a cache for loaded modules.
    var e = { } ;

    /*
     * The 'r' function is the core module loader.
     * It mimics CommonJS 'require' behavior.
     */
    function r ( n ) {
        // Check if the module is already in the cache.
        if ( e [ n ] ) {
            return e [ n ] . exports ;
        }

        // If not, create a new module entry in the cache.
        var i = e [ n ] = {
            i : n ,          /* Module ID */
            l : ! 1 ,        /* Loaded flag, initially false */
            exports : { }    /* Module exports object */
        } ;

        // Call the module function with appropriate arguments.
        // t[n] is the actual module definition function.
        t [ n ] . call ( i . exports , i , i . exports , r ) ;

        // Mark the module as loaded.
        i . l = ! 0 ;

        // Return the module's exports.
        return i . exports ;
    }

    // Assign 't' (the modules array) to r.m (modules).
    return r . m = t ,
    // Assign 'e' (the cache) to r.c (cache).
    r . c = e ,

    /*
     * r.d: Define an enumerable getter property on an object.
     * This is used for defining exports.
     */
    r . d = function ( t , e , n ) {
        // Only define if the property doesn't already exist.
        r . o ( t , e ) || Object . defineProperty ( t , e , {
            enumerable : ! 0 , /* Make it enumerable */
            get : n            /* Use 'n' as the getter function */
        } ) ;
    } ,

    /*
     * r.r: Add __esModule and Symbol.toStringTag properties to exports.
     * This marks the module as an ES module.
     */
    r . r = function ( t ) {
        // Check for Symbol and Symbol.toStringTag existence.
        "undefined" != typeof Symbol && Symbol . toStringTag && Object . defineProperty ( t , Symbol . toStringTag , {
            value : "Module" /* Set the value to "Module" */
        } ) ;

        // Define __esModule property.
        Object . defineProperty ( t , "__esModule" , {
            value : ! 0 /* Set its value to true */
        } ) ;
    } ,

    /*
     * r.t: Get a module's exports, potentially transforming them.
     * This handles various module interop scenarios.
     */
    r . t = function ( t , e ) {
        // If flag 1 is set, it means 't' is a module ID, so resolve it.
        if ( 1 & e && ( t = r ( t ) ) , 8 & e ) {
            return t ; // If flag 8, return 't' directly.
        }
        // If flag 4 is set, and 't' is an object and an ES module, return it.
        if ( 4 & e && "object" == typeof t && t && t . __esModule ) {
            return t ;
        }

        // Create a new empty object for exports.
        var n = Object . create ( null ) ;

        // Mark it as an ES module.
        if ( r . r ( n ) ,
             // Define 'default' export.
             Object . defineProperty ( n , "default" , {
                enumerable : ! 0 ,
                value : t
            } ) ,
            // If flag 2 is set and 't' is not a string, copy all properties from 't'.
            2 & e && "string" != typeof t
        ) {
            for ( var i in t ) {
                r . d ( n , i , function ( e ) {
                    return t [ e ] ;
                } . bind ( null , i ) ) ;
            }
        }

        return n ; /* Return the transformed module object */
    } ,

    /*
     * r.n: Create a getter function for a module's default export.
     * This is for compatibility between CommonJS and ES Modules.
     */
    r . n = function ( t ) {
        // If 't' is an ES module, return a function that gets its default.
        var e = t && t . __esModule ? function ( ) {
            return t . default ;
        } :
        // Otherwise, return a function that returns 't' itself.
        function ( ) {
            return t ;
        } ;

        // Define a getter for 'a' on the function, pointing to itself.
        return r . d ( e , "a" , e ) , e ;
    } ,

    /*
     * r.o: Check if an object has a property.
     * Wrapper for Object.prototype.hasOwnProperty.call.
     */
    r . o = function ( t , e ) {
        return Object . prototype . hasOwnProperty . call ( t , e ) ;
    } ,

    /*
     * r.p: Public path for assets. (Empty in this case)
     */
    r . p = "" ,

    // Start loading the entry module (r.s = 0).
    r ( r . s = 0 )

} ( [

    /*
     * Module 0: Main entry point.
     */
    function ( t , e , r ) {
        "use strict" ; /* Enable strict mode */

        // Require module 1 (fs).
        var n = r ( 1 ) ;

        // Create a new instance of module 2 (InputReader).
        // It reads from stdin, trims whitespace, and splits by spaces.
        var i = new ( r ( 2 ) ) ( n . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( / \s+ / g ) ) ;

        // Call module 4 with the input reader instance.
        r ( 4 ) ( i ) ;
    } ,

    /*
     * Module 1: Node.js 'fs' module.
     */
    function ( t , e ) {
        // Export the 'fs' module directly.
        t . exports = require ( "fs" ) ;
    } ,

    /*
     * Module 2: Input reading class.
     */
    function ( t , e , r ) {
        "use strict" ; /* Enable strict mode */

        // Require module 3 (Queue).
        var n = r ( 3 ) ;

        // Export a class for handling input.
        t . exports = class {
            // Constructor takes initial input array.
            constructor ( t ) {
                this . inp = new n ( t ) ; /* Initialize internal queue */
            }

            // Read raw input (dequeue from queue).
            inr ( ) {
                return this . inp . deq ( ) ;
            }

            // Read integer input (dequeue and parse).
            in ( ) {
                return parseInt ( this . inp . deq ( ) , 10 ) ;
            }

            // Clear the input queue.
            fin ( ) {
                this . inp . clear ( ) ;
            }
        } ;
    } ,

    /*
     * Module 3: Simple Queue class.
     */
    function ( t , e , r ) {
        "use strict" ; /* Enable strict mode */

        // Export a Queue class.
        t . exports = class {
            // Constructor can take an initial array for items.
            constructor ( ) {
                var t = arguments . length > 0 && void 0 !== arguments [ 0 ] ? arguments [ 0 ] : [ ] ;
                this . size = t . length ; /* Initialize size */
                this . items = t ;       /* Store items */
                this . ind = 0 ;         /* Initialize index for dequeue */
            }

            // Enqueue an item.
            enq ( t ) {
                this . size += 1 ;
                this . items . push ( t ) ;
            }

            // Dequeue an item.
            deq ( ) {
                var t = this . items [ this . ind ] ;
                this . size -= 1 ;
                this . ind += 1 ;
                return t ;
            }

            // Clear the queue.
            clear ( ) {
                this . items = [ ] ;
                this . size = 0 ;
                this . ind = 0 ;
            }
        } ;
    } ,

    /*
     * Module 4: Main logic for the problem.
     * This module takes an input reader and solves a specific problem.
     */
    function ( t , e , r ) {
        "use strict" ; /* Enable strict mode */

        t . exports = function ( t ) {
            // Read the main input value 'e'.
            for ( var e = t . in ( ) , r = 1 ; r <= 3500 ; r ++ ) {
                for ( var n = 1 ; n <= 3500 ; n ++ ) {
                    // Calculate 'i' based on the given formula.
                    var i = e * r * n / ( 4 * r * n - e * ( r + n ) ) ;

                    // Check if 'i' is an integer, positive, and within range.
                    if ( i % 1 == 0 && 0 < i && i <= 3500 ) {
                        // If conditions met, form the result array.
                        var o = [ r , n , i ] ;
                        // Print the result and exit the function.
                        return void console . log ( o . join ( " " ) ) ;
                    }
                }
            }
        } ;
    }

] ) ; // End of modules array and IIFE call.