/*
 * This entire script is encapsulated within an Immediately Invoked Function Expression (IIFE)
 * to prevent global scope pollution, ensuring all internal variables are private.
 */
( function ( global ) { // Start of the main module function. The 'global' parameter refers to the window object in browsers.

    // Define an array of Sinon.js spy matchers that will be converted into Jasmine matchers.
    var spyMatchers = "called calledOnce calledTwice calledThrice calledBefore calledAfter calledOn alwaysCalledOn calledWith alwaysCalledWith calledWithExactly alwaysCalledWithExactly calledWithMatch alwaysCalledWithMatch".split( " " ),
        // Initialize a counter for the loop.
        i = spyMatchers.length,
        // An object to store the generated Jasmine matchers.
        spyMatcherHash = { },
        // Special matchers that have different naming conventions between Sinon and Jasmine.
        unusualMatchers = {
            "returned": "toHaveReturned",
            "alwaysReturned": "toHaveAlwaysReturned",
            "threw": "toHaveThrown",
            "alwaysThrew": "toHaveAlwaysThrown"
        },
        // This function dynamically creates a Jasmine matcher function for a given Sinon spy property.
        getMatcherFunction = function ( sinonName, matcherName ) {
            /*
             * Attempt to retrieve an existing Jasmine matcher prototype function.
             * This handles cases where Jasmine might have its own default matchers for spies.
             */
            var original = jasmine.Matchers.prototype[ matcherName ];

            // The actual matcher function that Jasmine will call.
            return function ( ) {
                // Check if the 'actual' value is a Jasmine spy and if an 'original' matcher exists.
                if ( jasmine.isSpy( this.actual ) && original ) {
                    // If so, delegate to the original Jasmine matcher.
                    return original.apply( this, arguments );
                }

                // Otherwise, access the Sinon.js spy property directly.
                var sinonProperty = this.actual[ sinonName ];

                /*
                 * If the Sinon property is a function (e.g., 'calledWith'), invoke it with the provided arguments.
                 * Otherwise, return the property directly (e.g., 'called').
                 */
                return ( typeof sinonProperty === 'function' )
                    ? sinonProperty.apply( this.actual, arguments )
                    : sinonProperty; // Return the boolean value of the Sinon property.
            };
        }; // End of getMatcherFunction definition.

    // Loop through the standard Sinon spy matchers from the 'spyMatchers' array.
    while ( i-- ) {
        // Get the Sinon property name (e.g., "called").
        var sinonName = spyMatchers[ i ],
            // Construct the Jasmine matcher name (e.g., "toHaveBeenCalled").
            matcherName = "toHaveBeen" + sinonName.charAt( 0 ).toUpperCase( ) + sinonName.slice( 1 );

        // Store the newly created matcher function in the hash.
        spyMatcherHash[ matcherName ] = getMatcherFunction( sinonName, matcherName );
    }; // This semicolon marks the end of the while loop statement.

    // Iterate over the 'unusualMatchers' object to handle special cases.
    for ( var j in unusualMatchers ) {
        // For each unusual matcher, create and store its corresponding Jasmine matcher.
        spyMatcherHash[ unusualMatchers[ j ] ] = getMatcherFunction( j, unusualMatchers[ j ] );
    } // End of the for-in loop.

    /*
     * Expose an object on the global scope (window) containing a method
     * to retrieve all generated Jasmine matchers.
     */
    global.sinonJasmine = {
        // Public method to get all the spy matchers.
        getMatchers: function ( ) {
            return spyMatcherHash; // Return the collection of matchers.
        }
    };

} )( window ); // Pass the 'window' object as 'global' to the IIFE.

/*
 * This block is a Jasmine setup function.
 * It runs before each test spec to ensure the matchers are always available.
 */
beforeEach( function ( ) {

    // Add the custom Sinon.js-based matchers to Jasmine's environment.
    this.addMatchers( sinonJasmine.getMatchers( ) );

} ); // End of the beforeEach block.