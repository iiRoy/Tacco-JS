/*
 * This JavaScript code snippet is designed to process
 * input from the standard input stream (stdin).
 * It utilizes the built-in 'readline' module for
 * line-by-line input handling.
 */


// First, ensure the standard input stream is kept open
// to allow for continuous data reception until explicitly closed.
process.stdin.resume( );


// Next, set the character encoding for the incoming data
// to 'utf8', which is a common and robust encoding for text.
process.stdin.setEncoding(   'utf8'   );


/*
 * Declare a global variable named 'lines'.
 * This array will serve as a buffer to store
 * each line of input received from the user or piped data.
 * It is initialized as an empty array.
 */
var    lines    =    [    ]    ;


// Create an instance of the 'readline' interface.
// This interface allows reading data from a readable stream
// (in this case, 'process.stdin') one line at a time.
var    reader    =    require(    'readline'    ).createInterface(
    {
        // Define the input stream for the readline interface.
        // It's set to the standard input stream.
        input    :    process.stdin    ,

        // Define the output stream for the readline interface.
        // It's set to the standard output stream, though not directly
        // used for echoing input in this specific script.
        output    :    process.stdout
    }
);


// Attach an event listener for the 'line' event.
// This event fires whenever the input stream receives a newline character,
// indicating a complete line of input.
reader.on(
    'line'    ,
    (    line    )    =>    {
        // When a line is received, push it into the 'lines' array.
        // This accumulates all input lines.
        lines.push(    line    )    ;
    }
);


// Attach another event listener for the 'close' event.
// This event fires when the input stream (process.stdin) ends,
// typically when the user presses Ctrl+D (on Unix-like systems)
// or Ctrl+Z then Enter (on Windows), or when a piped input finishes.
reader.on(
    'close'    ,
    (    )    =>    {
        // Once the input stream closes, retrieve the first line from the 'lines' array.
        // This first line is assumed to be the critical input value, 'N'.
        var    N    =    lines[    0    ]    ;

        // Perform a conditional check on the value of 'N'.
        // The script checks if 'N' is exactly equal to 3, 5, or 7.
        if    (    N    ==    3    ||    N    ==    5    ||    N    ==    7    )    {
            // If 'N' matches any of these values, print "YES" to the console.
            console.log(    "YES"    )    ;
        }    else    {
            // Otherwise, if 'N' does not match 3, 5, or 7, print "NO".
            console.log(    "NO"    )    ;
        }
    }
);

/*
 * End of the JavaScript program.
 * The program waits for input, processes it, and then provides an output.
 */