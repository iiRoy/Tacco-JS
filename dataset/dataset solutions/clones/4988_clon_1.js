'use strict'
// This is the main program entry point.
// It reads input, processes it, and prints the result.
function Main (input)
{
    // Initialize a new Scanner to parse the input string.
    let sc = new Scanner( input ) ;

    // Read three integer values from the input.
    let a = sc.nextInt(); // First integer value
    let b = sc.nextInt(); // Second integer value
    let c = sc.nextInt(); // Third integer value

    // Calculate the maximum length among a, b, and c.
    let maxLen = Math.max( a, b, c );

    // Initialize an array to store "other" values (those not equal to maxLen).
    let others = [];

    // Calculate the redHeight and blueHeight based on maxLen.
    // redHeight is roughly half of maxLen, rounded down.
    let redHeight = Math.floor( maxLen / 2 );

    // blueHeight is the remainder of maxLen after redHeight.
    let blueHeight = maxLen - redHeight;

    // Check if any of the input numbers are even.
    // If any are even, the answer is 0.
    if ( a % 2 == 0 || b % 2 == 0 || c % 2 == 0 )
    {
        console.log( 0 ) ; // Output 0.
        return ; // Exit the function.
    }

    // Iterate through a, b, and c to find values smaller than maxLen.
    [ a, b, c ].forEach(
        i =>
        {
            if ( i < maxLen ) // If current number is less than maxLen...
            {
                others.push( i ); // Add it to the 'others' array.
            }
        }
    ) ;

    // Ensure 'others' array has at least two elements.
    // If it has less than two, fill it with 'maxLen'.
    while ( others.length < 2 )
    {
        others.push( maxLen ) ; // Add maxLen to 'others'.
    }

    // Calculate and print the final result.
    // The formula involves the absolute difference between blueHeight and redHeight,
    // multiplied by the first two elements of the 'others' array.
    console.log( Math.abs( blueHeight - redHeight ) * others[ 0 ] * others[ 1 ] ) ;
}


// A helper class for parsing input strings.
class Scanner
{
    // Constructor initializes the scanner with an input string.
    constructor ( input )
    {
        this.input = [ ] ; // Initialize an empty array for parsed tokens.

        // If input is a string, trim it and split into tokens by whitespace.
        if ( typeof input === 'string' )
        {
            this.input = input.trim().split( /\s+/ ) ;
        }

        this.index = 0 ; // Initialize the current token index.
    }

    // Retrieves the next token from the input.
    next ( )
    {
        // Check if there are more tokens available.
        return this.hasNext() ? this.input[ this.index++ ] : null ;
    }

    // Retrieves the next token as an integer.
    nextInt ( )
    {
        // Check if there are more tokens and parse it as an integer with base 10.
        return this.hasNext() ? parseInt( this.input[ this.index++ ], 10 ) : null ;
    }

    // Checks if there are more tokens remaining in the input.
    hasNext ( )
    {
        return this.index < this.input.length ;
    }
}


// Read input from standard input and pass it to the Main function.
Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;