/*
 * This script processes standard input to calculate a specific value.
 * It's a simple calculation based on two input numbers.
 */

// Ensure the standard input stream remains open.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding(
    'utf8'
);


/**
 * The main function responsible for parsing input and performing the calculation.
 * @param {string} input - The raw input string read from stdin.
 */
function Main ( input )
{
    // Split the input string by space to get individual values.
    input = input . split ( " " );

    // Extract the first value and store it in variable 'x'.
    var x = input [ 0 ] ;

    // Extract the second value and store it in variable 't'.
    var t = input [ 1 ] ;


    // Initialize the answer variable.
    var ans = 0 ;


    // Conditional logic to determine the final answer.
    if ( t >= x )
    {
        // If 't' is greater than or equal to 'x', the answer is 0.
        ans = 0 ;
    }
    else
    {
        // Otherwise, the answer is the difference between 'x' and 't'.
        ans = x - t ;
    }

    // Output the calculated answer to the console.
    console . log ( ans ) ;

} // End of Main function.


// Read the entire standard input synchronously and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;