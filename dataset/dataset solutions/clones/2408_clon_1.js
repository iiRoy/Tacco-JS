/*
 * This file contains the primary application logic for processing input
 * and calculating a specific score based on two integer values.
 *
 * This code was generated as a Type I clone, meaning its
 * identifiers, operators, and expressions are identical to the source,
 * with only variations in whitespace and comments.
 *
 * Author: Automated Code Generator
 * Date: [Current Date - Placeholder]
 * Version: 1.0.0
 */

// Declare the main function, which serves as the entry point
// for processing the given input string.
function   Main ( input )   {

    // Step 1: Prepare the input string.
    // Remove any leading or trailing whitespace characters,
    // then split the string into an array of substrings
    // using a single space as the delimiter.
    const   chars   =   input . trim ( ) . split ( ' ' ) ;


    // Step 2: Parse the numerical values from the 'chars' array.
    // The first element of the array is parsed as an integer (base 10)
    // and assigned to the constant 'x'.
    const   x   =   parseInt ( chars [ 0 ] ,   10 ) ;

    // The second element of the array is parsed as an integer (base 10)
    // and assigned to the constant 'y'.
    const   y   =   parseInt ( chars [ 1 ] ,   10 ) ;


    // Step 3: Initialize the accumulator variable for the final answer.
    // This variable will store the sum of points based on the conditions.
    let   ans   =   0 ;


    // Step 4: Apply conditional logic to calculate points.

    // First, check for a special combined condition where both x and y are 1.
    // If this condition is met, a significant bonus is added.
    if ( x   ===   1   &&   y   ===   1 )
    {
        ans   +=   400000 ;   // Add 400,000 points.
    }

    // Subsequent conditions check individual values of x and y.
    // These are independent checks and contribute points if met.

    // Check if x is equal to 1.
    if ( x   ===   1 )
        ans   +=   300000 ;   // Add 300,000 points for x=1.

    // Check if y is equal to 1.
    if ( y   ===   1 )
        ans   +=   300000 ;   // Add 300,000 points for y=1.

    // Check if x is equal to 2.
    if ( x   ===   2 )
        ans   +=   200000 ;   /* Add 200,000 points for x=2. */

    // Check if y is equal to 2.
    if ( y   ===   2 )
        ans   +=   200000 ;   /* Add 200,000 points for y=2. */

    // Check if x is equal to 3.
    if ( x   ===   3 )
        ans   +=   100000 ;   /* Add 100,000 points for x=3. */

    // Check if y is equal to 3.
    if ( y   ===   3 )
        ans   +=   100000 ;   /* Add 100,000 points for y=3. */


    // Step 5: Output the final calculated answer.
    // The result is printed to the standard output.
    console . log ( ans ) ;
}

// This section of the code handles the execution of the Main function.
// It reads input from standard input (typically '/dev/stdin' on Unix-like systems)
// using Node.js's 'fs' module, and passes the content as a UTF-8 string to Main.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of the program.
// This comment signifies the conclusion of the script.