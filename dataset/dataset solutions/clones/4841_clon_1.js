module . exports = function ( r ) {
    // This is the webpack bootstrap function.
    // It manages modules and their dependencies.
    var e = { } ;

    // The 't' function is the core module loader.
    function t ( n ) {

        // Check if the module is already in the cache.
        if ( e [ n ] ) {
            // If yes, return its exports.
            return e [ n ] . exports ;
        }

        // If not, create a new module entry in the cache.
        var o = e [ n ] = {
            i : n , // module id
            l : ! 1 , // loaded flag
            exports : { } // module exports object
        } ;

        // Execute the module function, passing in 'module', 'module.exports', and the 'require' function.
        r [ n ] . call ( o . exports , o , o . exports , t ) ;

        // Mark the module as loaded.
        o . l = ! 0 ;

        // Return the module's exports.
        return o . exports ;
    }

    // Attach modules object to the loader.
    t . m = r ;

    // Attach module cache to the loader.
    t . c = e ;

    // Define a utility function for defining properties on exports.
    // This is used for non-ESM modules to expose named exports.
    t . d = function ( r , e , n ) {
        // Check if property doesn't already exist.
        if ( ! t . o ( r , e ) ) {
            Object . defineProperty ( r , e , {
                enumerable : ! 0 , // Make it enumerable
                get : n // Define a getter for the value
            } ) ;
        }
    } ;

    // Define a utility function for marking exports as ES module.
    t . r = function ( r ) {
        // Add Symbol.toStringTag for better debugging.
        if ( typeof Symbol !== "undefined" && Symbol . toStringTag ) {
            Object . defineProperty ( r , Symbol . toStringTag , { value : "Module" } ) ;
        }
        // Set __esModule flag to true.
        Object . defineProperty ( r , "__esModule" , { value : ! 0 } ) ;
    } ;

    // Define a utility function for getting a default export.
    t . t = function ( r , e ) {
        // If bit 1 is set, it means it's a direct module ID, so load it.
        if ( 1 & e ) {
            r = t ( r ) ;
        }
        // If bit 8 is set, just return the module directly.
        if ( 8 & e ) {
            return r ;
        }
        // If bit 4 is set and it's an object and an ES module, return it directly.
        if ( 4 & e && typeof r === "object" && r && r . __esModule ) {
            return r ;
        }

        // Create a new namespace object.
        var n = Object . create ( null ) ;
        // Mark it as an ES module.
        t . r ( n ) ;
        // Define 'default' property.
        Object . defineProperty ( n , "default" , { enumerable : ! 0 , value : r } ) ;
        // If bit 2 is set and it's not a string, copy all properties from original module.
        if ( 2 & e && typeof r !== "string" ) {
            for ( var o in r ) {
                t . d ( n , o , ( function ( e ) {
                    return r [ e ] ;
                } ) . bind ( null , o ) ) ;
            }
        }
        return n ;
    } ;

    // Define a utility function for creating a getter for default export.
    t . n = function ( r ) {
        // If it's an ES module, return a function that gets its default.
        var e = r && r . __esModule ?
            function ( ) {
                return r . default ;
            } :
            // Otherwise, return a function that returns the module itself.
            function ( ) {
                return r ;
            } ;
        // Attach a property 'a' (alias for default) to the getter.
        t . d ( e , "a" , e ) ;
        return e ;
    } ;

    // Define a utility function for checking if a property exists.
    t . o = function ( r , e ) {
        return Object . prototype . hasOwnProperty . call ( r , e ) ;
    } ;

    // Public path for assets. (Empty in this case).
    t . p = "" ;

    // Load the entry module (module 0) and return its exports.
    return t ( t . s = 0 ) ;
} ( [
    /* Module 0 */
    function ( r , e , t ) {
        // This is the entry point of the application.
        // It requires module 1, passing it the result of reading from stdin via module 2.
        t ( 1 ) ( t ( 2 ) . readFileSync ( "/dev/stdin" , "UTF-8" ) . split ( "\n" ) ) ;
    } ,

    /* Module 1 */
    function ( r , e ) {
        // Helper function to safely destructure arrays.
        function t ( r , e ) {
            return function ( r ) {
                if ( Array . isArray ( r ) ) {
                    return r ;
                }
            } ( r ) || function ( r , e ) {
                var t = [ ] ,
                    n = ! 0 ,
                    o = ! 1 ,
                    u = void 0 ;
                try {
                    // Iterate through the iterable.
                    for ( var i , f = r [ Symbol . iterator ] ( ) ; ! ( n = ( i = f . next ( ) ) . done ) && ( t . push ( i . value ) , ! e || t . length !== e ) ; n = ! 0 ) {
                        // This loop continues until 'done' is true or the desired length 'e' is reached.
                    }
                } catch ( r ) {
                    o = ! 0 ;
                    u = r ;
                } finally {
                    try {
                        if ( ! n && null != f . return ) {
                            f . return ( ) ;
                        }
                    } finally {
                        if ( o ) {
                            throw u ;
                        }
                    }
                }
                return t ;
            } ( r , e ) || function ( ) {
                throw new TypeError ( "Invalid attempt to destructure non-iterable instance" ) ;
            } ( ) ;
        }

        // The main export of this module.
        r . exports = function ( r ) {
            // Parse the first line of input to get N and O.
            var e = t ( r [ 0 ] . split ( " " ) . map ( function ( r ) {
                    return Number ( r ) ;
                } ) , 2 ) ,
                n = e [ 0 ] , // N
                o = e [ 1 ] ; // O (max capacity)

            // Parse the second line of input to get the array of items.
            var u = r [ 1 ] . split ( " " ) . map ( function ( r ) {
                return Number ( r ) ;
            } ) ;

            var i = 0 ; // Total overflow removed (answer)
            var f = 0 ; // Loop counter

            // Loop through the items.
            for ( ; f < n ; f ++ ) {
                // If current item exceeds capacity, remove the excess and add to overflow.
                if ( u [ f ] > o ) {
                    i += u [ f ] - o ;
                    u [ f ] = o ;
                }

                // If current item and next item together exceed capacity,
                // remove excess from next item and add to overflow.
                if ( f < n - 1 && u [ f ] + u [ f + 1 ] > o ) {
                    var l = u [ f ] + u [ f + 1 ] - o ;
                    u [ f + 1 ] -= l ;
                    i += l ;
                }
            }

            // Print the total overflow.
            console . log ( i ) ;
        } ;
    } ,

    /* Module 2 */
    function ( r , e ) {
        // This module simply exports the Node.js 'fs' (file system) module.
        r . exports = require ( "fs" ) ;
    }
] ) ;