// This JavaScript file processes a single line of input to calculate the Euclidean distance
// between two points in a 2D plane. The input line is expected to contain four space-separated
// integer values representing the coordinates (x1, y1, x2, y2).

// A reader interface is created using Node.js's 'readline' module.
// This allows for reading input line by line from the standard input.
var   reader   =   require ( 'readline' ) . createInterface ( {

    input   :   process . stdin,      // Specifies standard input as the source for reading
    output  :   process . stdout      // Specifies standard output as the destination for writing (though not directly used by reader here)

} ) ;


// An event listener is attached to the 'reader' object.
// This function will be executed every time a new line of input is received.
reader . on ( 'line' ,   function   (   line   )   {

    // The input 'line' string is split into an array of strings using space as the delimiter.
    var   a   =   line . split ( ' ' ) ;

    // Each string element from the array 'a' is then parsed into an integer.
    // The base 10 (decimal) is explicitly specified for parseInt.
    // These variables represent the coordinates of two points: (b, c) and (d, e).
    var   b   =   parseInt (   a [ 0 ]   ,   10   ) ;    // x1 coordinate
    var   c   =   parseInt (   a [ 1 ]   ,   10   ) ;    // y1 coordinate
    var   d   =   parseInt (   a [ 2 ]   ,   10   ) ;    // x2 coordinate
    var   e   =   parseInt (   a [ 3 ]   ,   10   ) ;    // y2 coordinate

    /*
     * The Euclidean distance formula is applied here:
     * Distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)
     * In this context: sqrt((d - b)^2 + (e - c)^2)
     * The result is stored back into variable 'b'.
     */
    b   =   Math . sqrt (   (   b   -   d   )   *   (   b   -   d   )   +   (   c   -   e   )   *   (   c   -   e   )   ) ;

    // The calculated distance (stored in 'b') is then printed to the console.
    // The 'toFixed(8)' method formats the number to exactly 8 decimal places.
    console . log (   b . toFixed (   8   )   ) ;

    // After processing the first line and printing the result, the Node.js process is exited.
    // This means the script is designed to handle only a single input line.
    process . exit ( ) ;

} ) ;


// Another event listener is set up for the 'end' event on the standard input stream.
// This typically fires when the input stream has no more data to provide.
// However, due to the 'process.exit()' call above, this event might not always be reached
// or relevant in the typical execution flow of this specific script.
process . stdin . on ( 'end' ,   function   ( )   {

    // This function body is intentionally left empty, mirroring the original code's behavior.
    // No specific actions are taken when the input stream concludes.

} ) ;