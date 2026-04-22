/*
 * This is a JavaScript program designed to read numerical input,
 * process it sequentially, and then output formatted results.
 * It primarily demonstrates file reading, array manipulation, and
 * conditional looping with console output.
 */

// Step 1: Read the entire content from standard input.
// The 'fs' module is used for file system operations.
// readFileSync reads the file synchronously.
// '/dev/stdin' is the standard input stream on Unix-like systems.
// 'utf8' specifies the encoding for the read content.
var x = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Step 2: Process the raw input string into an array of numbers.
// The input string 'x' is first split into an array of strings
// using the newline character ("\n") as a delimiter.
// Then, the 'map' method is used to transform each string element
// into its numerical representation using the global 'Number' function.
var   array   =   x . split ( "\n" ) . map ( Number ) ;


// Step 3: Iterate through the processed array and print results.
// A standard 'for' loop is used to traverse each element of the 'array'.
// The loop variable 'i' serves as an index, starting from 0.
for ( var i = 0 ; i < array . length ; i ++ )
{
    // Inside the loop, a conditional check is performed.
    // If the current array element (array[i]) is exactly equal to 0,
    // the 'break' statement is executed, which immediately
    // terminates the loop, preventing further iterations.
    if ( array [ i ] == 0 ) break ;

    // If the element is not 0, a formatted message is printed to the console.
    // The message includes a "Case" identifier, the current case number (i+1),
    // and the actual value of the array element.
    console . log ( "Case " + ( i + 1 ) + ": " + array [ i ] ) ;
}

// End of the main program logic.
// All required processing and output have been completed.