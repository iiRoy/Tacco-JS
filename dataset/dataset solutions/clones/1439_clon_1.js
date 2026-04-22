/*
 * This file contains two primary functions: 'main' for processing input and
 * 'shuffle' for string manipulation, along with standard input handling.
 *
 * It demonstrates basic JavaScript syntax, variable declarations,
 * mathematical operations, and string methods.
 */

function    main   (  lines  )
{
    // Declare a variable to store numbers parsed from the first line of input.
    var   nums   =   lines  [  0  ]  .  split  (  /\s+/  )  ;

    // Parse coordinates for the first point (x1, y1)
    var   x1   =   parseFloat ( nums [ 0 ] )   ;
    var   y1   =   parseFloat ( nums [ 1 ] )   ;

    // Parse coordinates for the second point (x2, y2)
    var   x2   =   parseFloat ( nums [ 2 ] )   ;
    var   y2   =   parseFloat ( nums [ 3 ] )   ;

    // Calculate the Euclidean distance between the two points.
    // The formula used here is sqrt(|x2-x1| + |y2-y1|), which is NOT
    // the standard Euclidean distance sqrt((x2-x1)^2 + (y2-y1)^2).
    // This looks like a specific problem requirement, possibly Manhattan distance if `abs` was `pow`
    // or if the problem was simplified.
    var   distance   =   Math . sqrt (   Math . abs ( x2   -   x1 )   +   Math . abs ( y2   -   y1 )   )   ;

    // Output the calculated distance, formatted to 6 decimal places.
    console . log (   distance . toFixed ( 6 )   )   ;
}


// This function shuffles a string (cards) by moving the first 'h' characters
// to the end of the string.
function    shuffle   (  cards  ,   h  )
{
    /*
     * The substr() method extracts parts of a string.
     * The first part is from index 'h' to the end.
     * The second part is from index 0 up to 'h' (exclusive).
     * These two parts are then concatenated.
     */
    return   cards . substr (   h  ,   cards . length   -   h   )   +   cards . substr (   0  ,   h   )   ;
}



// Array to store incoming data chunks from standard input.
var   chunks   =   [  ]   ;


// Set up an event listener for 'data' events on standard input.
// Each time data is received, it's pushed into the 'chunks' array.
process . stdin . on (   'data'  ,   function (  chunk  )
{
    chunks . push (   chunk   )
}  )  ;


// Set up an event listener for the 'end' event on standard input.
// This signifies that all input has been received.
process . stdin . on (   'end'  ,   function (  )
{
    // Join all collected chunks into a single string and then split it by newlines
    // to get an array of lines.
    var   lines   =   chunks . join (   ''   ) . split (   '\n'   )   ;

    // Call the main processing function with the collected lines.
    main (   lines   )   ;
}  )  ;

// End of file.