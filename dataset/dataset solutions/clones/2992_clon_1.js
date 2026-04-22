module . exports = function ( e ) {
    // This is the main webpack bootstrap function.
    // It takes the modules object as an argument.

    // The cache for loaded modules.
    var t = {
    };

    /**
     *  Webpack's require function.
     *  @param {number} n - The module ID.
     *  @returns {object} The exports of the module.
     */
    function r ( n ) {
        // If module is already in cache, return its exports.
        if ( t [ n ] ) {
            return t [ n ] . exports ;
        }

        // Create a new module object and put it into the cache.
        var o = t [ n ] = {
            i       : n ,    // Module ID
            l       : ! ! ! false , // Flag to indicate if module is loaded (initially false)
            exports : { }    // The exports object for the module
        } ;

        // Execute the module function.
        // `e[n]` is the module factory function.
        // `o.exports` is passed as `this` context, and as the first argument.
        // `r` is passed as the local `require` function.
        e [ n ] . call ( o . exports , o , o . exports , r ) ;

        // Mark the module as loaded.
        o . l = true ;

        // Return the exports of the module.
        return o . exports ;
    }

    // Attach modules object to the runtime (r.m = modules).
    r . m = e ;

    // Attach cache object to the runtime (r.c = cache).
    r . c = t ;

    /**
     *  Define getter function for harmony exports.
     *  @param {object} e - The exports object.
     *  @param {string} t - The property name.
     *  @param {function} n - The getter function.
     */
    r . d = function ( e , t , n ) {
        // Check if the property already exists on the exports object.
        // If not, define it using Object.defineProperty.
        if ( ! r . o ( e , t ) ) {
            Object . defineProperty ( e , t , {
                enumerable : true , // Make the property enumerable.
                get        : n     // Set the getter function.
            } ) ;
        }
    } ;

    /**
     *  Define __esModule on exports.
     *  @param {object} e - The exports object.
     */
    r . r = function ( e ) {
        // If Symbol is defined and Symbol.toStringTag exists, set it to "Module".
        if ( typeof Symbol !== "undefined" && Symbol . toStringTag ) {
            Object . defineProperty ( e , Symbol . toStringTag , {
                value : "Module"
            } ) ;
        }
        // Always define __esModule as true for ES module interoperability.
        Object . defineProperty ( e , "__esModule" , {
            value : true
        } ) ;
    } ;

    /**
     *  Create a fake namespace object for module.
     *  @param {any} e - The module's exports.
     *  @param {number} t - Bitmask flags for the module type.
     *  @returns {object} The namespace object.
     */
    r . t = function ( e , t ) {
        // If bit 1 is set, and e is not yet loaded, load it.
        if ( 1 & t ) {
            e = r ( e ) ;
        }

        // If bit 8 is set, return e directly (meaning e is already a namespace object).
        if ( 8 & t ) {
            return e ;
        }

        // If bit 4 is set, and e is an object and has __esModule, return e.
        if ( 4 & t && typeof e === "object" && e && e . __esModule ) {
            return e ;
        }

        // Create a new namespace object.
        var n = Object . create ( null ) ;

        // Set __esModule and Symbol.toStringTag for the new namespace.
        r . r ( n ) ;

        // Define a 'default' property on the namespace, pointing to the original module exports.
        Object . defineProperty ( n , "default" , {
            enumerable : true ,
            value      : e
        } ) ;

        // If bit 2 is set, and e is not a string, iterate over its properties
        // and define getters for them on the new namespace object.
        if ( 2 & t && typeof e !== "string" ) {
            for ( var o in e ) {
                // Check if the property is directly on 'e' and not inherited.
                if ( r . o ( e , o ) ) {
                    r . d ( n , o , ( function ( t ) {
                        return e [ t ] ;
                    } ) . bind ( null , o ) ) ;
                }
            }
        }

        // Return the constructed namespace object.
        return n ;
    } ;

    /**
     *  Get the default export of a module.
     *  @param {object} e - The module's exports.
     *  @returns {function} A function that returns the default export.
     */
    r . n = function ( e ) {
        var t = e && e . __esModule
            ? function ( ) { return e . default ; } // If it's an ES module, return its default.
            : function ( ) { return e ; } ;       // Otherwise, return the module itself.

        // Define a getter for 'a' on the function, pointing to itself.
        r . d ( t , "a" , t ) ;

        return t ;
    } ;

    /**
     *  Check if an object has a property.
     *  @param {object} e - The object.
     *  @param {string} t - The property name.
     *  @returns {boolean} True if the object has the property, false otherwise.
     */
    r . o = function ( e , t ) {
        return Object . prototype . hasOwnProperty . call ( e , t ) ;
    } ;

    // Public path for assets (empty in this case).
    r . p = "" ;

    // Load the entry module (module ID 0) and return its exports.
    return r ( r . s = 0 ) ;
}

(
    // Array of modules.
    [
        // Module 0: Entry point.
        function ( e , t , r ) {
            // Require module 1, and pass the result of reading stdin using module 2.
            r ( 1 ) ( r ( 2 ) . readFileSync ( "/dev/stdin" , "UTF-8" ) ) ;
        } ,

        // Module 1: Main application logic (BFS for shortest distance to '#').
        function ( e , t ) {
            e . exports = function ( e ) {
                // Split the input string into lines.
                var t = e . split ( "\n" ) ;

                // Parse the first line to get dimensions N and M.
                var r = t [ 0 ] . split ( " " ) ;
                var n = Number ( r [ 0 ] ) ; // N: number of rows
                var o = Number ( r [ 1 ] ) ; // M: number of columns

                // Initialize arrays.
                var u = [ ] ; // 'u' will store the grid characters
                var i = [ ] ; // 'i' will act as a queue for BFS (stores {x, y, dist})
                var s = [ ] ; // 's' will store visited status (1 for visited, 0 for not)

                // 'f' is the total number of cells, used for termination condition.
                var f = n * o ;

                // Loop through each row to initialize the grid and find starting '#' cells.
                for ( var l = 0 ; l < n ; l ++ ) {
                    var d = t [ l + 1 ] . split ( "" ) ; // Current row as an array of characters
                    var y = new Array ( o ) . fill ( 0 ) ; // Initialize visited array for current row with 0s.
                    s . push ( y ) ; // Add to the overall visited grid.

                    // Loop through each column in the current row.
                    for ( var p = 0 ; p < o ; p ++ ) {
                        // If the cell contains '#', add it to the BFS queue as a starting point.
                        if ( "#" == d [ p ] ) {
                            i . push ( {
                                x    : p ,
                                y    : l ,
                                dist : 0
                            } ) ;
                        }
                    }

                    u . push ( d ) ; // Add the character row to the grid 'u'.
                }

                // Perform Breadth-First Search (BFS).
                // Continue as long as there are elements in the queue.
                for ( ; i . length > 0 ; ) {
                    var c = i . shift ( ) ; // Dequeue the first element.

                    // The `1,` is a no-op, likely minifier artifact.
                    // Check if the current cell has NOT been visited yet.
                    if ( 1 != s [ c . y ] [ c . x ] ) {
                        // Mark the current cell as visited.
                        s [ c . y ] [ c . x ] = 1 ;

                        // Decrement the count of unvisited cells.
                        f -= 1 ;

                        // If all cells have been visited, we found the maximum distance.
                        if ( f <= 0 ) {
                            return void console . log ( c . dist ) ;
                        }

                        // Explore neighbors: right, left, down, up.

                        // Right neighbor:
                        if ( c . x + 1 < o && 1 != s [ c . y ] [ c . x + 1 ] ) {
                            i . push ( {
                                x    : c . x + 1 ,
                                y    : c . y ,
                                dist : c . dist + 1
                            } ) ;
                        } ;

                        // Left neighbor:
                        if ( c . x - 1 >= 0 && 1 != s [ c . y ] [ c . x - 1 ] ) {
                            i . push ( {
                                x    : c . x - 1 ,
                                y    : c . y ,
                                dist : c . dist + 1
                            } ) ;
                        } ;

                        // Down neighbor:
                        if ( c . y + 1 < n && 1 != s [ c . y + 1 ] [ c . x ] ) {
                            i . push ( {
                                x    : c . x ,
                                y    : c . y + 1 ,
                                dist : c . dist + 1
                            } ) ;
                        } ;

                        // Up neighbor:
                        if ( c . y - 1 >= 0 && 1 != s [ c . y - 1 ] [ c . x ] ) {
                            i . push ( {
                                x    : c . x ,
                                y    : c . y - 1 ,
                                dist : c . dist + 1
                            } ) ;
                        } ;
                    }
                }
            } ;
        } ,

        // Module 2: File System module.
        function ( e , t ) {
            e . exports = require ( "fs" ) ; // Export the Node.js 'fs' module.
        }
    ]
) ;