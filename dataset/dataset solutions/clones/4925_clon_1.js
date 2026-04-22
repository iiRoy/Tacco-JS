module . exports = function ( e ) {
    // This `t` variable serves as the cache for loaded modules, storing them by their ID.
    var t = {} ;


    // The core module loading and caching function, similar to a simplified `require`.
    function n ( r ) {
        // If the module with ID `r` is already present in our internal cache `t`,
        // we can immediately return its exported value to avoid redundant loading.
        if ( t [ r ] ) {
            return t [ r ] . exports ;
        }


        // If the module is not in the cache, we proceed to create a new module object.
        // This object is then stored in the cache `t` at the key `r`.
        // `i`: Stores the module's unique identifier.
        // `l`: A boolean flag indicating whether the module has been fully loaded (initialized to false).
        // `exports`: The object that will hold the module's exported values.
        var o = t [ r ] = {
            i : r ,
            l : ! 1 ,
            exports : {}
        } ;


        // Now, we execute the module definition function itself.
        // The module definitions are stored in the array `e` (passed to the outer wrapper function).
        // `e[r]` is the actual function code for the module.
        // `call` is used to set the `this` context for the module function and pass specific arguments:
        // 1. `o.exports`: The `this` context for the module function.
        // 2. `o`: The module object itself.
        // 3. `o.exports`: The exports object, which the module will populate.
        // 4. `n`: A reference to this module loading function (`require`-like), allowing nested `require` calls.
        // The comma operator sequences these expressions: first the module execution,
        // then `o.l = !0` (marking as loaded), and finally `o.exports` (which is the return value).
        return e [ r ] . call (
            o . exports , // 'this' context for the module's execution.
            o ,           // The module object, often available as `module`.
            o . exports , // The exports object, often available as `exports`.
            n             // The local `require` function for this module.
        ) , o . l = ! 0 , o . exports ;
    }


    // `n.m` stores a reference to the array of all module definitions `e`.
    // This allows the module system to access the raw module functions.
    n . m = e ;
    // `n.c` stores a reference to the module cache `t`.
    // This cache holds all already-loaded module objects.
    n . c = t ;


    // `n.d` is a helper function designed to define a getter for an export property.
    // This is typically used to ensure properties are enumerable and have a custom getter.
    // `e`: The exports object on which to define the property.
    // `t`: The name of the property to define.
    // `r`: The getter function for the property.
    n . d = function ( e , t , r ) {
        // `n.o(e, t)` checks if the property `t` already exists on object `e`.
        // The `||` (OR) operator here acts as a conditional:
        // if `n.o(e, t)` is false (meaning the property does NOT exist), then
        // `Object.defineProperty` is executed to define the new property.
        n . o ( e , t ) || Object . defineProperty ( e , t , {
            enumerable : ! 0 , // Make the property visible during enumeration (e.g., `for...in`).
            get : r            // Assign the provided function `r` as the getter for this property.
        } ) ;
    } ;


    // `n.r` is a helper function to mark an object as an ES module.
    // This involves setting specific properties for compatibility and identification.
    // `e`: The exports object to mark as an ES module.
    n . r = function ( e ) {
        // This line uses the comma operator to sequence two distinct operations:
        // 1. Conditionally sets `Symbol.toStringTag`: If `Symbol` and `Symbol.toStringTag` are available
        //    (indicating a modern JavaScript environment), it sets `Symbol.toStringTag` on the exports object `e`
        //    to "Module". This helps identify the object as an ES module when `Object.prototype.toString` is called.
        "undefined" != typeof Symbol && Symbol . toStringTag && Object . defineProperty ( e , Symbol . toStringTag , {
            value : "Module"
        } ) ,
        // 2. Always sets `__esModule`: This flag is a common convention used by bundlers (like webpack)
        //    to indicate that an object is an ES module.
        Object . defineProperty ( e , "__esModule" , {
            value : ! 0
        } ) ;
    } ;


    // `n.t` is a complex helper function to create a "fake" namespace object for interoperability
    // between different module formats (e.g., CommonJS, AMD, ES Modules).
    // `e`: The module exports or module ID.
    // `t`: A bitmask of flags indicating how `e` should be treated.
    n . t = function ( e , t ) {
        // This `if` condition utilizes the comma operator within its condition.
        // 1. `1 & t && ( e = n ( e ) )`: This part is evaluated first. If the first bit of `t` is set (`1 & t` is truthy),
        //    AND `e` is not falsey, then `e` is treated as a module ID and loaded via `n(e)`. The result of `n(e)` is
        //    assigned back to `e`. This part primarily has side effects.
        // 2. `8 & t`: This part is evaluated second. The result of the comma operator is the value of its last operand,
        //    so `8 & t` becomes the actual condition that determines if the `if` block executes.
        // If the 8th bit of `t` is set, simply return `e` as is (after potential loading/reassignment).
        if ( 1 & t && ( e = n ( e ) ) , 8 & t ) {
            return e ;
        }


        // If the 4th bit of `t` is set, AND `e` is an object, AND `e` is truthy, AND `e` is already marked as an ES module (`__esModule`),
        // then return `e` directly as it's already in the desired ES module format.
        if ( 4 & t && "object" == typeof e && e && e . __esModule ) {
            return e ;
        }


        // If none of the above conditions are met, create a new empty object to act as the namespace.
        var r = Object . create ( null ) ;

        // This `if` condition also uses the comma operator for sequencing and condition evaluation.
        // 1. `n . r ( r )`: Calls `n.r` to mark the newly created object `r` as an ES module.
        // 2. `Object . defineProperty ( r , "default" , { enumerable : ! 0 , value : e } )`: Defines a 'default' export property
        //    on `r`, whose value is the original `e`. This makes `e` accessible as `namespace.default`.
        // 3. `2 & t && "string" != typeof e`: This is the actual condition for the `if` block. It checks if the 2nd bit of `t` is set
        //    AND `e` is not a string.
        // If this final condition is true, it means `e` is a non-string object whose properties should be exposed.
        if ( n . r ( r ) , Object . defineProperty ( r , "default" , { enumerable : ! 0 , value : e } ) , 2 & t && "string" != typeof e ) {
            // Iterate over all enumerable properties `o` in `e`.
            for ( var o in e ) {
                // For each property, define a getter on `r` so that `r.o` resolves to `e.o`.
                // `bind(null, o)` creates a new function that, when called, will invoke `return e[t]` with `t` being `o`.
                n . d ( r , o , ( function ( t ) {
                    return e [ t ] ;
                } ) . bind ( null , o ) ) ;
            }
        }
        return r ; // Return the constructed namespace object.
    } ;


    // `n.n` is a helper function to create a getter for a module's default export.
    // It handles cases where the module might be a true ES module or a CommonJS module.
    // `e`: The module's exports object.
    n . n = function ( e ) {
        // `t` will be a function that, when called, returns the default export.
        // If `e` is an ES module (`e.__esModule` is true), `t` returns `e.default`.
        // Otherwise (for CommonJS), `t` simply returns `e` itself.
        var t = e && e . __esModule ?
            function () {
                return e . default ;
            } :
            function () {
                return e ;
            } ;
        // Define a getter named 'a' on the function `t` itself. This getter, when accessed,
        // will return the function `t`. This is a common pattern for default export access.
        n . d ( t , "a" , t ) ;
        return t ; // Return the getter function.
    } ;


    // `n.o` is a simple shortcut for `Object.prototype.hasOwnProperty.call(e, t)`.
    // It's used to safely check if an object `e` has a property `t` directly on itself (not inherited).
    n . o = function ( e , t ) {
        return Object . prototype . hasOwnProperty . call ( e , t ) ;
    } ;


    // `n.p` is the public path for assets. It's often an empty string when assets are served from the same domain root.
    n . p = "" ;


    // This is the entry point of the bundled application.
    // `n.s = 0` assigns `0` as the startup module ID to `n.s`.
    // Then, `n(0)` is called, which loads and executes module `0`.
    // The return value of `n(0)` is the final result of the entire bundle.
    return n ( n . s = 0 ) ;

} (
    // This array contains all the module definitions that the module system will manage.
    // Each element in this array is a function representing a single module.
    [
        // Module 0: The main application logic orchestrator.
        function ( e , t , n ) {
            // This module's primary responsibility is to read input from standard input (`/dev/stdin`),
            // process it using another module, and then output the result.
            // `n(1)` loads the processing logic module.
            // `n(2)` loads the Node.js 'fs' (file system) module.
            n ( 1 ) (
                n ( 2 ) // Load the 'fs' module.
                . readFileSync ( "/dev/stdin" , "UTF-8" ) // Read the entire content of standard input synchronously, using UTF-8 encoding.
                . split ( "\n" )                        // Split the read content into an array of strings, one for each line.
            ) ;
        } ,


        // Module 1: Contains the core algorithm for processing the input string.
        function ( e , t ) {
            // This module exports a single function.
            // This exported function takes an array `e` (which is expected to contain input lines).
            e . exports = function ( e ) {
                // `e[0]` is assumed to be the primary input string for the algorithm (e.g., "ppgg").
                var t = e [ 0 ] ,    // `t` refers to the first line of input.
                    n = t . length , // `n` stores the total length of the input string `t`.
                    r = 0 ,          // `r` is the final score or result counter, initialized to zero.
                    o = 0 ,          // `o` is a balance counter, used to track 'p' and 'g' characters, initialized to zero.
                    u = 0 ;          // `u` is the loop iterator, used to traverse the input string, initialized to zero.

                // Loop through each character of the input string `t` from beginning to end.
                for ( ; u < n ; u ++ ) {
                    // This uses a ternary (conditional) operator to branch logic based on the balance `o`.
                    // The comma operator is used within each branch to sequence multiple expressions.
                    o > 0 ?                                     // Condition: Is the balance `o` positive?
                        ( "g" == t [ u ] && r ++ , o -- ) :     // If true: If current char is 'g', increment `r`, then decrement `o`.
                        ( "p" == t [ u ] && r -- , o ++ ) ;     // If false: If current char is 'p', decrement `r`, then increment `o`.
                }
                // After processing all characters, print the final calculated score `r` to the console.
                console . log ( r ) ;
            } ;
        } ,


        // Module 2: A simple wrapper for Node.js's built-in 'fs' (file system) module.
        function ( e , t ) {
            // This module simply re-exports the Node.js 'fs' module, making it available to other modules
            // within this bundled system when `n(2)` is called.
            e . exports = require ( "fs" ) ;
        }
    ]
) ;