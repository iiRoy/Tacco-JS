/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It processes input from standard input, performs calculations, and outputs results.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

function   main(  input  )
{
    // The main function that orchestrates the program's logic.
    // It takes a string 'input' as its argument.

    var   array   =   input.split('\n') ; // Split the input string by newline characters
                                         // to get an array of lines.

    var   num   =   parseInt( array[0],   10 ) ; // Parse the first line as an integer,
                                                 // representing the number of test cases or iterations.

    // Loop through each test case, starting from the second line (index 1).
    for ( var   i   =   1;   i   <=   num;   i++ )
    {
        var   flag   =   0 ; /* Initialize a flag variable.
                                This flag will be used to track whether a condition
                                has been met within the inner loop. */

        // Split the current line (representing a test case) by spaces.
        var   num_array   =   array[i].split( ' ' ) ;

        // Parse the individual components of the current line into integers.
        var   A   =   parseInt( num_array[0] ) ; // First number
        var   B   =   parseInt( num_array[1] ) ; // Second number
        var   C   =   parseInt( num_array[2] ) ; // Third number
        var   D   =   parseInt( num_array[3] ) ; // Fourth number

        // Store the original value of A for later comparison.
        var   oldA   =   A ;

        // Calculate the remainder of A divided by B.
        var   newA   =   A % B ;

        // --- Conditional checks for early exit ---

        // If A is less than B, it's an immediate "No" case.
        if ( A   <   B )
        {
            console.log( "No" ) ; // Output "No"
            continue ;            // Move to the next iteration of the loop.
        }

        // If D is less than B, it's also an immediate "No" case.
        if ( D   <   B )
        {
            console.log( "No" ) ; // Output "No"
            continue ;            // Move to the next iteration.
        }

        // If A is less than C, it's an immediate "Yes" case.
        if ( A   <   C )
        {
            console.log( "Yes" ) ; // Output "Yes"
            continue ;             // Move to the next iteration.
        }

        /*
         * Main logic block begins here if none of the above
         * early exit conditions were met.
         */

        // Reassign A based on the calculated newA and B.
        A   =   newA   +   B ;

        // Enter a loop that continues as long as A is greater than or equal to B.
        while ( A   >=   B )
        {
            // Check if the difference (A-B) is less than or equal to C.
            if ( ( A   -   B )   <=   C )
            {
                // If true, update newA and A using D.
                newA   =   A   -   B   +   D ;
                A   =   newA ; // Assign the new value to A.
            }
            else
            {
                // If false, simply update newA and A by subtracting B.
                newA   =   A   -   B ;
                A   =   newA ; // Assign the new value to A.
            }

            // Check if the current value of A has become greater than or equal to its original value.
            if ( A   >=   oldA )
            {
                console.log( "Yes" ) ; // If so, output "Yes".
                flag   =   1 ;         // Set the flag to indicate success.
                break ;                // Exit the while loop.
            }
        }

        // After the while loop, if the flag is still 0, it means the condition was not met.
        if ( flag   ==   0 )   console.log( "No" ) ; // Output "No".
    }
}


// This part of the code reads input from standard input and passes it to the main function.
// It uses Node.js's 'fs' module to read the entire file synchronously.
main( require( 'fs' ).readFileSync( '/dev/stdin',   'utf8' ) ) ;