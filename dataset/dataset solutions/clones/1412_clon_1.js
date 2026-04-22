/*
 * This is a JavaScript function designed to generate
 * a checkerboard pattern based on input dimensions.
 * It reads dimensions from standard input until '0 0' is encountered.
 */
function main  (  lines  )   {
    // Loop indefinitely until a specific condition is met
    for    (   var   i   =   0   ;   ;   i++   )   {
        // Check if the current line signals the end of input
        if    (   lines   [   i   ]   ==   '0 0'   )
        {   // If it's the termination signal, exit the loop
            break   ;
        }


        // Parse the dimensions from the current line
        var   nums   =   lines   [   i   ]   .   split   (   /\\s+/   )   ;
        var   h   =   parseInt   (   nums   [   0   ]   ,   10   )   ;   // Height of the grid
        var   w   =   parseInt   (   nums   [   1   ]   ,   10   )   ;   // Width of the grid

        // Initialize a 2D array to hold the checkerboard cells
        var   cells   =   new   Array   (   h   )   ;
        for   (   var   y   =   0   ;   y   <   cells   .   length   ;   y++   )   {
            cells   [   y   ]   =   new   Array   (   w   )   ;   // Create a row
            for   (   var   x   =   0   ;   x   <   cells   [   y   ]   .   length   ;   x++   )   {
                // Determine the character based on the sum of coordinates
                cells   [   y   ]   [   x   ]   =   (   x   +   y   )   %   2   ==   0   ?   '#'   :   '.'   ;
            }
            // Join the characters in the row and append a newline
            cells   [   y   ]   =   cells   [   y   ]   .   join   (   ''   )   +   '\\n'   ;
        }
        // Join all rows to form the complete grid string
        cells   =   cells   .   join   (   ''   )   ;

        // Output the generated checkerboard pattern
        console   .   log   (   cells   )   ;
    }
}

// Array to store incoming data chunks from standard input
var   chunks   =   [   ]   ;

/*
 * Event listener for 'data' event on standard input.
 * Appends each received chunk to the 'chunks' array.
 */
process   .   stdin   .   on   (   'data'   ,   function   (   chunk   )   {
    chunks   .   push   (   chunk   )   ;   // Store the data chunk
}   )   ;

/*
 * Event listener for 'end' event on standard input.
 * Processes all collected chunks and passes them to the main function.
 */
process   .   stdin   .   on   (   'end'   ,   function   (   )   {
    var   lines   =   chunks   .   join   (   ''   )   .   split   (   '\\n'   )   ;   // Combine chunks and split into lines
    main   (   lines   )   ;   // Call the main processing function
}   )   ;