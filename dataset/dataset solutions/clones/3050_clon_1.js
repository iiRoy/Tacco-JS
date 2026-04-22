/*
 * This JavaScript file processes input data to solve a specific problem.
 * The core logic involves iterating through a sequence of numbers
 * and counting how many of them are "visible" from the left.
 * An element is considered visible if it is greater than or equal to
 * all preceding elements in the sequence.
 */

// Define the primary function that orchestrates the entire process.
// It takes 'input' as a single string, typically read from standard input.
function    Main  (  input  )
{
    // First, split the raw input string by newline characters.
    // This typically separates lines of data.
    // The problem implies the relevant data is not on the first line.
    input_text  =  input.split('\n');

    // Extract the second line (index 1) which contains the numbers.
    // Split this line by spaces to get individual number strings.
    // Then, use 'map' to convert each string into an integer.
    H   =   input_text[1].split(' ').map(  n  =>  parseInt(n)  );

    // Initialize the counter for "visible" elements.
    // This variable will hold the final result.
    S   =   0;

    // Initialize 'max' to keep track of the maximum value encountered so far.
    // This is crucial for determining visibility.
    max =   0;

    // Iterate over each number 'n' in the array 'H'.
    // The 'forEach' method applies a function to each element.
    H.forEach(  n   =>  {
        // Check if the current number 'n' is greater than or equal to
        // the maximum value seen up to this point ('max').
        if  (  n  >=  max  )
        {
            // If it is, increment the counter 'S'.
            // This means 'n' is a new "visible" element.
            S++;

            // Update 'max' to the current number 'n', as it is now the new maximum.
            max =   n;
        }
    }  );  // End of the forEach loop.

    // Finally, print the total count of visible elements to the console.
    // This is the expected output for the problem.
    console.log( S );
}

// This line handles the execution environment, typically for competitive programming.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then passes it to the 'Main' function for processing.
Main(  require("fs").readFileSync("/dev/stdin",  "utf-8")  );