/*
 * This is a JavaScript file demonstrating
 * a specific algorithm for some problem.
 * It includes two main functions: F and Main.
 * The purpose is to find a sequence of numbers
 * based on a peculiar function F.
 */

 'use strict' ; // Enforce strict mode for cleaner code and error detection.


function   F ( x )   {

    // Function F calculates a specific value based on input x.
    // It seems to be related to the sum of digits of x.
    // Specifically, it computes x divided by the sum of its digits.

    let   s   =   0 ;   // Initialize sum variable to accumulate digits.
    let   y   =   x ;   // Create a working copy of x to extract digits without modifying original x.

    while   (   y   >   0   )   {
        // Loop while y is positive, extracting digits from right to left.
        s   +=   y   %   10 ;   // Add the last digit of y to s (y % 10 gives the last digit).
        y   /=   10 ;   // Remove the last digit from y (integer division implied for numbers in JS).
    }

    return   x   /   s ;   // Return the original number x divided by the sum of its digits s.
}


/**
 * Main function to process the input and produce the output.
 * This function orchestrates the generation of the number sequence.
 * @param {string} input - The raw input string from stdin, expected to contain 'K'.
 */
function   Main ( input )   {

    input   =   input . split ( "\n" ) ; // Split the entire input string by newline characters into an array of lines.

    let   line1   =   input [ 0 ] . split ( ' ' ) ; // Take the first line of input and split it by spaces.
    let   K   =   parseInt (   line1 [ 0 ]   ) ; // Parse the first element of the split first line as an integer, assign to K.

    console . log ( 1 ) ; // Output the initial value 1 as per problem specification.

    let   x   =   2 ; // Initialize x, the starting point for the sequence generation, to 2.


    // Main loop: iterates K-1 times to generate K-1 subsequent numbers in the sequence.
    // The loop variable 'i' goes from 1 up to (but not including) K.
    for   (   let   i   =   1 ;   i   <   K ;   i   +=   1   )   {

        let   z   =   x ,   y   =   x ; // Initialize z and y with the current value of x at the start of each iteration.
        let   fm   =   F ( z ) ; // Calculate F(z) for the current best candidate z and store it as fm (minimum F value found so far).


        // Inner loop: This loop systematically modifies 'y' to find a number
        // that, when passed to function F, yields a smaller result than 'fm'.
        // 'd' iterates through powers of 10 (1, 10, 100, etc.) up to 'x'.
        for   (   let   d   =   1 ;   d   <=   x ;   d   *=   10   )   {

            // This line modifies 'y' by changing one of its digits to '9'
            // to potentially find a number with a smaller F value.
            // (y / d) % 10 extracts the digit at the position 'd'.
            y   =   y   +   (   9   -   (   y   /   d   )   %   10   )   *   d ;

            let   fy   =   F ( y ) ; // Calculate F for the newly modified y.

            // If the F value of the modified 'y' is smaller than the current minimum 'fm',
            // then 'y' becomes the new best candidate 'z', and 'fy' becomes the new minimum 'fm'.
            if   (   fy   <   fm   )   {
                z   =   y ; // Update z to the new best candidate.
                fm   =   fy ; // Update fm to the new minimum F value.
            }
        }

        console . log ( z ) ; // Output the best 'z' found in this iteration of the main loop.
        x   =   z   +   1 ; // Update 'x' for the next iteration, moving to the next number after 'z'.
    }

    return   0 ; // Indicate successful execution of the Main function.
}


// Read input from the standard input stream, decode it as UTF-8,
// and then pass this raw string to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;