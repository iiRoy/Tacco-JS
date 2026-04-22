/*
 * This JavaScript file contains the implementation of a function
 * that generates a sequence of numbers based on a specific rule.
 *
 * It takes an integer `input` (which is converted to `n`)
 * and performs `n` iterations to generate and process numbers in a queue.
 */
function   main( input )
{
    // Parse the input string into an integer.
    // The resulting 'n' determines the number of iterations for the main processing loop.
    const   n   =   parseInt( input )  ;

    // Initialize a queue with the first set of single-digit numbers.
    // These are the initial elements from which new numbers will be generated.
    let   queue   =   [ 1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9 ]   ;

    // Main processing loop: iterates 'n' times.
    // In each iteration, a number is dequeued, and up to three new numbers
    // are potentially enqueued based on its last digit.
    for   ( let   i   =   0 ;   i   <   n ;   i++ )
    {
        // Dequeue the first element from the front of the queue.
        // This variable 'x' will hold the number currently being processed.
        x   =   queue.shift()  ; // 'x' is assigned the shifted value.

        // Conditional generation: if the last digit of 'x' is not 0.
        // This generates a number where the last digit is decremented by 1.
        if   (   x   %   10   !==   0   )
        {
            // Calculate and push the new number into the queue.
            // The formula is: (x * 10) + (last_digit - 1).
            queue.push(   10   *   x   +   x   %   10   -   1   )   ; /* Add new number with last digit decremented. */
        }

        // Unconditional generation: always add a number with the same last digit.
        // This forms the core of the number generation pattern.
        queue.push(   10   *   x   +   x   %   10   )   ; // Add new number keeping the same last digit.

        // Conditional generation: if the last digit of 'x' is not 9.
        // This generates a number where the last digit is incremented by 1.
        if   (   x   %   10   !==   9   )
        {
            // Calculate and push the new number into the queue.
            // The formula is: (x * 10) + (last_digit + 1).
            queue.push(   10   *   x   +   x   %   10   +   1   )   ; // Add new number with last digit incremented.
        }
    }
    // After the loop finishes, the variable 'x' will hold the value of the
    // last number that was processed (shifted out of the queue).
    console.log(   x   )  ; // Output the final value of 'x' to standard output.
}

// Entry point for the script execution.
// It reads the entire content of '/dev/stdin' as a UTF-8 string,
// and then passes this string as the 'input' argument to the 'main' function.
main(   require( 'fs' ) . readFileSync( '/dev/stdin' ,   'utf8' )   )  ; // Call the primary function 'main'.

/*
 * End of JavaScript code for the number sequence generation.
 * This script processes a series of numbers based on their last digit,
 * simulating a breadth-first search-like expansion.
 */