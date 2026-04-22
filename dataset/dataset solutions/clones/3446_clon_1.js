/*
 * This JavaScript program is designed to read input from standard input (stdin),
 * process it line by line, and then perform a specific calculation
 * once the input stream has been closed.
 * It leverages Node.js's 'readline' module for efficient input handling.
 */

// Resume the standard input stream to ensure data can be read.
// This is important in environments where stdin might be paused by default.
process . stdin . resume ( ) ;

// Set the character encoding for the standard input stream.
// UTF-8 is a common and robust encoding for text data.
process . stdin . setEncoding (   'utf8'   )   ;


// Declare an array to store all lines read from standard input.
// This array will accumulate input until the 'close' event is triggered.
var   lines   =   [ ]   ;

// Create an interface for reading data from a Readable stream (like stdin)
// one line at a time. The output stream is also specified, though not directly
// used for prompts in this particular script.
var   reader   =   require (   'readline'   ) . createInterface (   {
    // The input source for the readline interface.
    input   :   process . stdin   ,
    // The output destination for the readline interface (e.g., for prompts).
    output   :   process . stdout
}   )   ;

// Attach an event listener for the 'line' event.
// This callback function executes every time a complete line of input is received.
reader . on (   'line'   ,   (   line   )   =>   {
    // Add the newly read line to the 'lines' array.
    lines . push (   line   )   ;
}   )   ;

// Attach an event listener for the 'close' event.
// This callback function executes once the input stream has ended (e.g., user presses Ctrl+D or input pipe closes).
reader . on (   'close'   ,   (   )   =>   {
    // Take the very first line from the accumulated input.
    // Split this line into an array of strings based on space (' ') as the delimiter.
    // The resulting array is assigned to the variable 'l'.
    var   l   =   lines [   0   ] . split (   ' '   )   ;

    // Perform a calculation:
    // 1. Take the first element of the 'l' array (l[0]).
    //    Multiply it by 1 to ensure it's treated as a number (type coercion).
    // 2. Take the third element of the 'l' array (l[2]).
    //    Divide it by 2.
    // 3. Add the results of steps 1 and 2.
    // 4. Print the final numerical result to the console.
    console . log (   l [   0   ]   *   1   +   l [   2   ]   /   2   )   ;
}   )   ;

// End of script. The program will wait for input until the 'close' event.