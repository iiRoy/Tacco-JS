/*
 * This is a JavaScript program designed to process a series of numbers.
 * It reads input from standard input, parses it, and performs calculations.
 *
 * Author: Code Clone Generator
 * Date: [Current Date]
 */

// Import the 'fs' (file system) module to read input.
var input =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
// The above line reads the entire content of /dev/stdin as a UTF-8 string.

// Process the input string:
// 1. Trim leading/trailing whitespace.
// 2. Split the string into an array of lines based on newline character.
// 3. Convert each line (string) to a number using the Number constructor.
var  Arr  =  ( input . trim ( ) ) . split ( "\n" ) . map ( Number ) ;


// Main processing loop: continues as long as the array 'Arr' is not empty.
while ( Arr . length  !=  0 ) {

    // Extract the first element, divide it by 4, and store in 'n'.
    // This 'n' determines how many subsequent numbers to sum.
    var  n  =  ( Arr . shift ( ) )  /  4 ;

    // Check for termination condition: if n becomes 0, exit the loop.
    if  ( n  ==  0 )
        break ; // Exit the 'while(Arr.length != 0)' loop.

    // Initialize a variable 'sum' to accumulate values for the current block.
    var  sum  =  0 ;

    // Inner loop: sums 'n' numbers from the array.
    while ( n  !=  0 ) {
        // Add the next number from the array to 'sum'.
        sum  +=  Arr . shift ( ) ;
        // Decrement 'n' to count down the numbers processed.
        n -- ;
    }

    // After summing 'n' numbers, print the calculated sum to the console.
    console . log ( sum ) ;

} // End of main processing loop.

/*
 * End of program.
 * All input has been processed and results displayed.
 */