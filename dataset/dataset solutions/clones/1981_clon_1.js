/*
 * This JavaScript file processes input from stdin.
 * It calculates a specific sum based on the provided numerical input.
 *
 * The program reads a single number from standard input.
 * It then iterates from 1 up to that number (inclusive).
 * For each number in the iteration, if the number is not divisible by 3
 * AND not divisible by 5, it is added to a running total.
 * Finally, the accumulated sum is printed to the console.
 */

// Set the character encoding for standard input to UTF-8.
// This ensures that incoming data is interpreted correctly.
process.stdin.setEncoding('utf-8');


// Register an event listener for the 'data' event on the standard input stream.
// The provided callback function will be executed whenever data is received.
process.stdin.on('data', function  (  data  )   {

    // Initialize a variable named 'sum' to zero.
    // This variable will accumulate the total of numbers meeting the criteria.
    let   sum   =   0;


    // Begin a for loop.
    // The loop iterates from 'i' equals 1 up to, but not including, the input number plus one.
    // In simpler terms, it iterates from 1 up to and including the input number itself.
    // The 'data' received from stdin is converted to a Number type.
    for  (  let   i   =   1;   i   <   Number(data)   +   1;   i++  )   {

        // Check the condition: if 'i' is not divisible by 3 AND 'i' is not divisible by 5.
        // The modulo operator (%) returns the remainder of a division.
        // If the remainder is not 0, it means the number is not divisible.
        if  (  i   %   3   !==   0   &&   i   %   5   !==   0  )   {

            // If the condition is true (i.e., 'i' is not a multiple of 3 and not a multiple of 5),
            // add the current value of 'i' to the 'sum'.
            sum   =   sum   +   i;

        }   // End of the conditional block for checking divisibility

    }   // End of the for loop iteration


    // After the loop has completed processing all numbers,
    // print the final calculated 'sum' to the standard output (console).
    console.log(sum);

}  );  // End of the 'data' event handler function definition