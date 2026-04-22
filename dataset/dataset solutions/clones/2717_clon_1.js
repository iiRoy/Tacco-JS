/*
 * This JavaScript program processes a numerical input.
 * It's designed to read a single number from standard input,
 * perform a specific calculation, and then print
 * a formatted output string to standard output.
 */

//  --- Module Imports and Setup ---

//  Initialize the readline interface for standard I/O operations.
//  This allows us to read input line by line from the console.
var     reader  = require   (   'readline'  )   .   createInterface (   {
    input   :   process . stdin     ,   //  Specify the input stream as standard input.
    output  :   process . stdout        //  Specify the output stream as standard output.
}   )   ;


//  An array to store all incoming lines from the standard input.
//  In this particular problem, we expect only one line.
var     lines   =   [   ]   ;


//  --- Input Line Event Handler ---

//  Attach an event listener to the 'line' event of the reader.
//  This function executes every time a new line of input is received.
reader  .   on  (   'line'  ,   function    (   line    )
{
    //  Add the received line to our 'lines' array.
    lines   .   push    (   line    )   ;
}   )   ;


//  --- Main Program Execution Logic ---

//  Attach an event listener to the 'close' event of the reader.
//  This function executes once all input has been received and the input stream is closed.
reader  .   on  (   'close' ,   function    (   )
{
    //  Convert the first (and only) line of input into a numerical value.
    var     s   =   Number  (   lines   [   0   ]   )   ;

    //  Initialize a variable 'x' which will be used as a divisor and counter.
    var     x   =   1   ;

    //  Begin a loop to find a suitable value for 'x'.
    //  The loop continues as long as 's' is perfectly divisible by 'x'
    //  AND the result of 's / x' is greater than or equal to 1,000,000,000.
    while   (   (   s   %   x   ==  0   )   &&  (   s   /   x   >=  1000000000  )   )
    {
        //  Increment 'x' by 1 to test the next potential divisor.
        x   ++  ;
    }

    //  Print the final result to the console in a specific format.
    //  The format is "0 0 <value_of_x> 0 0 <value_of_s_divided_by_x>".
    console .   log (   "0 0 "  +   x   +   " 0 0 " +   (   s   /   x   )   )   ;
}   )   ;

//  --- End of Program ---