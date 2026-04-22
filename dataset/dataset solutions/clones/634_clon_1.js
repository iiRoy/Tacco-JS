/*
 * This JavaScript file implements a solution for a specific problem
 * involving string processing and distance calculation for a particular character.
 * It utilizes custom input/output and repetition utilities for execution within a Node.js environment.
 * The core logic resides in the 'main' function, which processes multiple lines of input.
 */


function   main   (   )
{
    // The main entry point of the program.
    // It coordinates the reading of input parameters and the subsequent processing loop.


    var   n   =   scan   (   )   ;   // Reads the first integer, representing the number of rows/lines to process.
    var   m   =   scan   (   )   ;   // Reads the second integer, representing the length of each string/row.


    // Initiates a repetition loop for 'n' times, processing each input line.
    rep   (   n   ,   function   (   )
    {
        var   x   =   scan   (   'string'   )   ;   // Reads a single string for the current iteration.
        var   y   =   [   ]   ;   // An array to store the calculated distances for the current string 'x'.
        var   c   =   -1   ;   // A counter to track the distance from the most recently encountered 'c' character.
                            // Initialized to -1 to signify that no 'c' has been found yet.


        // Loops 'm' times, iterating through each character of the string 'x'.
        rep   (   m   ,   function   (   i   )
        {
            // Checks if the character at the current index 'i' is 'c'.
            if   (   x   .   charAt   (   i   )   ==   'c'   )
            {
                y   .   push   (   0   )   ;   // If the character is 'c', its distance from itself is 0.
                c   =   1   ;   // Resets the counter for subsequent characters, as a new 'c' has been found.
            }
            else
            {
                // If the character is not 'c', calculate its distance from the last 'c'.
                // If 'c' has been encountered previously (i.e., c is not -1), increment 'c' and push its value.
                // Otherwise, if no 'c' has been found yet, push -1.
                y   .   push   (   c   !=   -1   ?   c   ++   :   -1   )   ;
            }
        }   )   ;


        print   (   y   .   join   (   ' '   )   )   ;   // Outputs the elements of array 'y', joined by spaces, to the console.
    }   )   ;
}


// A general-purpose utility function to repeat a given function 'n' times.
function   rep   (   n   ,   func   )
{
    // Standard for-loop structure for iteration.
    for   (   var   i   =   0   ;   i   <   n   ;   ++   i   )
    {
        func   (   i   )   ;   // Executes the provided function, passing the current loop index as an argument.
    }
}


// Node.js specific setup for handling standard input.
process   .   stdin   .   resume   (   )   ;   // Resumes the stdin stream, allowing it to emit 'data' events.
process   .   stdin   .   setEncoding   (   'utf8'   )   ;   // Sets the encoding for the input stream to UTF-8.


// Global variables used for managing the input data.
var   input   =   ''   ;   // An empty string to accumulate all incoming data chunks from stdin.
var   input_index   =   0   ;   // An index to keep track of the current position when reading from the 'input' array.


// A custom scanning function to retrieve values from the processed input.
// It can read either strings or numbers based on the 'type' parameter.
function   scan   (   type   )
{
    if   (   type   ===   'string'   )
    {
        return   input   [   input_index   ++   ]   ;   // Returns the next item from the input array as a string.
    }
    else
    {
        return   +   input   [   input_index   ++   ]   ;   // Returns the next item from the input array, converted to a number (unary plus).
    }
}


// A custom printing function to output values.
function   print   (   val   )
{
    console   .   log   (   val   )   ;   // Uses the standard console.log for displaying output.
}


// Event listener for the 'data' event on the standard input stream.
// This event fires whenever new data is available.
process   .   stdin   .   on   (   'data'   ,   function   (   chunk   )
{
    input   +=   chunk   ;   // Appends the received data 'chunk' to the 'input' string.
}   )   ;


// Event listener for the 'end' event on the standard input stream.
// This event fires when no more data is expected from stdin.
process   .   stdin   .   on   (   'end'   ,   function   (   )
{
    // Once all input has been received, it's split into an array of strings
    // based on whitespace, preparing it for sequential scanning.
    input   =   input   .   split   (   /\s+/   )   ;
    main   (   )   ;   // Invokes the main function to begin the program's core logic.
}   )   ;