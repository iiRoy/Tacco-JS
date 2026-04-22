/*
 * This document contains a Type I clone of an original JavaScript program.
 * The purpose of this clone is to demonstrate that the code is logically and
 * functionally identical to its source, despite significant alterations
 * in its visual presentation.
 *
 * In accordance with the Type I definition, all core elements such as
 * identifiers, variable names, function names, operators, and expressions
 * remain absolutely unchanged.
 *
 * The only modifications introduced are:
 * - Varied whitespace: This includes changes in indentation levels,
 *   the number of spaces between tokens, and the strategic addition
 *   of blank lines to break up code blocks.
 * - Extensive comments: Both single-line (//) and multi-line (/* ... */)
 *   comments have been added, removed, or modified to alter the visual
 *   layout without affecting the code's execution.
 *
 * This resulting code is designed to appear visually distinct from the original,
 * yet execute with precisely the same behavior and produce identical output
 * for any given input.
 */

//  ---  Function Definition for the Primary Logic  ---
function   main (   lines   )
{

    //  Begin an infinite loop to process input lines.
    //  The loop will explicitly terminate when a specific condition is met.
    for   (   var   i   =   0   ;   ;   i++   )
    {

        //  Check if the current line signifies the end of input data.
        //  The termination string is '0 0'.
        if   (   lines [   i   ]   ==   '0 0'   )
        {
            //  If the termination string is encountered, exit the loop immediately.
            break   ;
        }


        //  Parse the current line to extract numerical dimensions.
        //  The line is expected to contain two numbers separated by whitespace.
        var   nums   =   lines [   i   ]   .   split   (   /\\s+/   )   ;


        //  Convert the first number to an integer for height.
        var   h   =   parseInt   (   nums [   0   ]   ,   10   )   ;

        //  Convert the second number to an integer for width.
        //  Note: In the original logic, 'w' is parsed but the grid
        //  construction uses 'h' for both dimensions, creating an h x h grid.
        var   w   =   parseInt   (   nums [   1   ]   ,   10   )   ;



        //  Initialize the primary array that will hold the rows of our grid.
        //  The size of this array is determined by the height 'h'.
        var   cells   =   new   Array   (   h   )   ;


        //  Iterate through each row to populate the grid.
        for   (   var   y   =   0   ;   y   <   cells   .   length   ;   y++   )
        {

            //  For each row, initialize a new array to hold its columns.
            //  Crucially, this uses 'h' again for the inner array size,
            //  replicating the original behavior of creating an h x h square grid.
            cells [   y   ]   =   new   Array   (   h   )   ;


            //  Iterate through each column within the current row.
            for   (   var   x   =   0   ;   x   <   cells [   y   ]   .   length   ;   x++   )
            {
                //  Determine the character for the current cell based on a checkerboard pattern.
                //  If the sum of x and y coordinates is even, use '#'; otherwise, use '.'.
                cells [   y   ] [   x   ]   =   (   x   +   y   )   %   2   ==   0   ?   '#'   :   '.'   ;
            }


            //  After populating a row, join its characters into a single string.
            //  Append a newline character to the end of the row string.
            cells [   y   ]   =   cells [   y   ]   .   join   (   ''   )   +   '\n'   ;
        }


        //  After all rows are processed, join the array of row strings into one complete grid string.
        cells   =   cells   .   join   (   ''   )   ;


        //  Output the fully constructed grid to the console.
        console   .   log   (   cells   )   ;
    }
}


//  ---  Standard Input Handling Logic  ---

//  Initialize an empty array to accumulate data chunks received from standard input.
var   chunks   =   [   ]   ;


//  Attach an event listener to the 'data' event of standard input.
//  This function is called whenever a new piece of data is available.
process   .   stdin   .   on   (   'data'   ,   function   (   chunk   )
{
    //  Push the received data chunk into our 'chunks' array.
    chunks   .   push   (   chunk   )   ;
}   )   ;


//  Attach an event listener to the 'end' event of standard input.
//  This function is called once all input data has been received.
process   .   stdin   .   on   (   'end'   ,   function   (   )
{
    //  Join all accumulated data chunks into a single string.
    //  Then, split this string by newline characters to get an array of individual lines.
    var   lines   =   chunks   .   join   (   ''   )   .   split   (   '\n'   )   ;

    //  Finally, invoke the main processing function with the collected input lines.
    main   (   lines   )   ;
}   )   ;