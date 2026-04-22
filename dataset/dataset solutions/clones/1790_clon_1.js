/*
 * This is a Type I clone of an existing JavaScript program.
 * It strictly adheres to the definition: only whitespace and comments
 * are altered. All identifiers, operators, and expressions remain identical.
 * This ensures the program's functionality is precisely the same.
 */
'use strict'; // Enforces strict mode for cleaner code and fewer errors.

function Main( stdin )
{
    // The main function that processes the input provided via standard input.

    // Step 1: Process the raw input string.
    // Trim any leading/trailing whitespace and then split the string into an array
    // of lines, using either Windows or Unix-style newlines.
    const input = stdin.trim().split( /\r?\n/g ) ;

    // Step 2: Parse the first line to extract values A and V.
    // The first line is expected to contain two space-separated numbers.
    // We split by space and then map each string part to a Number.
    const A_V = input[0].split( ' ' ).map( str => Number( str ) ) ;
    const A   = A_V[0] ,   V = A_V[1] ; // Destructure the array to assign A and V.

    // Step 3: Parse the second line to extract values B and W.
    // Similar to the first line, this line also contains two space-separated numbers.
    const B_W = input[1].split( ' ' ).map( str => Number( str ) ) ;
    const B   = B_W[0] ,   W = B_W[1] ; // Destructure the array to assign B and W.

    // Step 4: Extract the time duration T from the third line.
    // This value is directly taken from the third element of the input array.
    const T = input[2] ;

    // Initialize a variable to store the final result.
    // The default assumption is 'NO' unless a specific condition is met.
    let result = 'NO' ;

    // Calculate the initial distance (kyori) between point B and point A.
    // This is a simple subtraction to find the displacement.
    const kyori = B - A ;

    // Calculate the relative speed (tidimu).
    // This represents the rate at which the gap between the two entities closes.
    // If V > W, the gap closes; if V < W, it widens; if V = W, it stays constant.
    const tidimu = V - W ;

    // Step 5: Evaluate the condition to determine the final result.
    // The condition checks if the total distance covered by the relative speed
    // over time T is greater than the initial distance.
    // This implies that the faster entity can catch up or pass the slower one.
    if ( tidimu * T > kyori )
    {
        result = 'YES' ; // If the condition is true, update the result to 'YES'.
    }

    // Output the computed result to the standard console.
    console.log( result ) ;
}

// This part of the code is responsible for handling the input mechanism.
// It uses Node.js's 'fs' module to synchronously read the entire content
// of '/dev/stdin' (standard input stream) as a UTF-8 encoded string.
// This string is then passed to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;