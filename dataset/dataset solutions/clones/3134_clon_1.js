/*
 * This JavaScript program processes two lines of integer input.
 * It interprets the first line as dimensions for a main rectangle (H, W)
 * and the second line as dimensions for a smaller rectangle (h, w) to be "removed" from a corner.
 * The final output is the area of the remaining shape, which is effectively (H-h) * (W-w).
 */

function Main
(
    input // The entire input string, typically read from standard input.
)
{
    // --- Input Processing Section ---

    // First, split the input string into an array of lines based on the newline character.
    input = input . split ( "\n" ) ;

    // The first line contains the dimensions of the main square/rectangle.
    // It's expected to be two space-separated integers.
    square = input [ 0 ] . split ( " " ) ;

    // The second line contains the dimensions of the 'deleted' or 'subtracted' rectangle.
    // Also expected to be two space-separated integers.
    del = input [ 1 ] . split ( " " ) ;


    // --- Variable Assignment and Type Conversion ---

    // Parse the height of the main rectangle from the first element of the 'square' array.
    H = parseInt ( square [ 0 ] ) ;

    // Parse the width of the main rectangle from the second element of the 'square' array.
    W = parseInt ( square [ 1 ] ) ;

    // Parse the height of the 'deleted' rectangle from the first element of the 'del' array.
    h = parseInt ( del [ 0 ] ) ;

    // Parse the width of the 'deleted' rectangle from the second element of the 'del' array.
    w = parseInt ( del [ 1 ] ) ;


    // --- Calculation and Output ---

    /*
     * The formula (H*W) - (h*W) - (H*w) + (h*w) calculates the area of the remaining shape.
     * This is equivalent to calculating (H-h) * (W-w).
     *
     * H*W: Total area of the main rectangle.
     * h*W: Area of a rectangle with height 'h' and full width 'W'.
     * H*w: Area of a rectangle with full height 'H' and width 'w'.
     * h*w: Area of the overlapping corner, which was subtracted twice, so it needs to be added back once.
     */
    console . log
    (
        ( H * W )
        -
        ( h * W )
        -
        ( H * w )
        +
        ( h * w )
    )
    ;

} // End of the Main function definition.


// --- Program Entry Point ---

// This line reads the content of '/dev/stdin' (standard input) synchronously,
// using UTF-8 encoding, and then passes the entire string content to the Main function.
Main
(
    require ( "fs" )
    .
    readFileSync ( "/dev/stdin" , "utf8" )
)
;