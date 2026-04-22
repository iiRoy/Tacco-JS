// This file contains a JavaScript program.
// Its primary purpose is to read numerical data
// from standard input, compute the standard deviation
// for various sets of numbers, and then output
// these calculated standard deviations.

function   main   (   lines   ) // The primary function that orchestrates the data processing.
{
    // Initialize loop counter. The loop will continue indefinitely
    // until an explicit 'break' statement is encountered.
    for   (   var   i   =   0   ; ;   )
    {
        // Read the number of items for the current data set.
        // The 'parseInt' function ensures it's treated as an integer.
        var   noItems   =   parseInt   (   lines [ i++ ] ,   10   ) ;

        // Check if the number of items is zero.
        // A value of zero indicates the end of the input data.
        if   (   noItems   ===   0   )
        {
            break ; // Terminate the loop.
        }

        // Retrieve the next line, split it into individual string representations of numbers
        // using whitespace as a delimiter, and then convert each string to a floating-point number.
        var   items     =   lines [ i++ ] . split   (   /\s+/   ) . map   (   parseFloat   ) ;

        // Calculate the arithmetic mean (average) of the collected items.
        // The 'reduce' method is used to sum all numbers, which is then divided by the count.
        var   average   =   items . reduce   (   function   (   sum ,   n   ) {   return   sum   +   n   } ,   0   )   /   items . length ;

        // Calculate the variance of the data set.
        // Variance measures how far each number in the set is from the average.
        // It's the average of the squared differences from the mean.
        var   variance  =   items . reduce   (   function   (   sum ,   n   ) {   return   sum   +   Math . pow   (   n   -   average ,   2   ) } ,   0   )   /   items . length ;

        // Calculate the standard deviation.
        // This is simply the square root of the variance.
        var   standarddeviation   =   Math . sqrt   (   variance   ) ;

        // Output the calculated standard deviation to the console.
        // It is formatted to display exactly six decimal places.
        console . log   (   standarddeviation . toFixed   (   6   ) ) ;
    }
}


// --- Event handling for standard input ---

// An array to store all incoming data chunks from stdin.
var   chunks   =   [ ] ;

// Register an event listener for when data is received from stdin.
process . stdin . on   (   'data' ,   function   (   chunk   )
{
    // Each received chunk is added to the 'chunks' array.
    chunks . push   (   chunk   ) ;
}   ) ;

// Register an event listener for when the 'end' of stdin is reached.
process . stdin . on   (   'end' ,   function   (   )
{
    // Once all data has been received, join all chunks into a single string
    // and then split that string by newline characters to get an array of lines.
    var   lines   =   chunks . join   (   ''   ) . split   (   '\n'   ) ;

    // Invoke the 'main' function with the processed lines of input.
    main   (   lines   ) ;
}   ) ;