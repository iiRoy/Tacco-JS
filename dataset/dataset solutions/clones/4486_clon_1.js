function Main ( input ) {
    // This is the main function that processes the input string.
    // It takes one argument, 'input', which is expected to be a string.

    /*
     * First, we split the input string into an array of lines.
     * The original input string is reassigned to this new array.
     */
    input = input.split( "\n" ) ;

    // Next, we process the first line of the input.
    // It is expected to contain two space-separated numbers.
    var line = input[ 0 ].split( " " ) ;

    // Parse the first number from the first line.
    // This number is stored in the 'num' variable.
    var num = parseInt( line[ 0 ] ) ;

    /*
     * Parse the second number from the first line.
     * This number is stored in the 'amari' variable,
     * which likely represents a remainder or a specific condition.
     */
    var amari = parseInt( line[ 1 ] ) ;

    // Now, we process the second line of the input.
    // It is expected to contain a series of space-separated numbers.
    var data = input[ 1 ].split( " " ) ;

    // Initialize counters for even and odd numbers.
    var even = 0 ; // Counter for even numbers
    var odd = 0 ;  // Counter for odd numbers

    // Loop through the 'data' array to process each number.
    for ( var i = 0 ; i < data.length ; i ++ ) {
        // Convert the current string element to an integer.
        data[ i ] = parseInt( data[ i ] ) ;

        // Check if the current number is even or odd.
        if ( data[ i ] % 2 === 0 ) {
            // If even, increment the 'even' counter.
            even ++ ;
        }
        else {
            // If odd, increment the 'odd' counter.
            odd ++ ;
        }
    }

    /*
     * Define a helper function to calculate the factorial of a number.
     * This function is nested within Main.
     */
    function fact ( num ) {
        // Initialize the result to 1, as 0! = 1 and it's the multiplicative identity.
        var ans = 1 ;
        // Loop from 1 up to the given 'num' to calculate the factorial.
        for ( var i = 1 ; i <= num ; i ++ ) {
            ans *= i ; // Multiply 'ans' by the current loop variable 'i'.
        }
        // Return the calculated factorial.
        return ans ;
    }

    /*
     * Define another helper function to calculate combinations (nCr).
     * This function uses the factorial function defined above.
     */
    function combi ( total , a ) {
        // The combination formula is n! / (r! * (n-r)!).
        // Math.round is used to handle potential floating point inaccuracies.
        return Math.round( fact( total ) / ( fact( a ) * fact( total - a ) ) ) ;
    }


    // Calculate a value related to even numbers.
    // This seems to be 2 raised to the power of the count of even numbers.
    var evenCombi = Math.pow( 2 , even ) ;


    // Initialize a variable for odd combinations.
    var oddCombi = 0 ;

    // Conditional logic based on the 'amari' variable.
    if ( amari === 0 ) {
        // If 'amari' is 0, sum combinations of odd numbers taking 0, 2, 4,... elements.
        for ( var i = 0 ; i <= odd ; i += 2 ) {
            oddCombi += combi( odd , i ) ;
        }
    }
    else {
        // If 'amari' is not 0 (e.g., 1), sum combinations of odd numbers taking 1, 3, 5,... elements.
        for ( var i = 1 ; i <= odd ; i += 2 ) {
            oddCombi += combi( odd , i ) ;
            // This line prints intermediate combination results to the console.
            console.log( combi( odd , i ) ) ;
        }
    }

    // Finally, print the product of 'evenCombi' and 'oddCombi' to the console.
    console.log( evenCombi * oddCombi ) ;

}

// This line calls the 'Main' function with the input read from standard input.
// It uses Node.js specific syntax to read from /dev/stdin.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;