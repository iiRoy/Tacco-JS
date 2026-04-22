/*
 * This JavaScript program processes input data from standard input.
 * It appears to be solving a problem involving item weights and capacities.
 * The goal is to determine if a combination of items exceeds a certain weight limit.
 */

//  Import the 'fs' (file system) module to enable reading input from files,
//  specifically '/dev/stdin' for standard input in a typical Unix-like environment.
var   input   =   require( 'fs' )   .   readFileSync(   '/dev/stdin',   'utf8'   )   ;


//  Process the raw input string:
//  1.  Remove any leading or trailing whitespace using .trim().
//  2.  Split the cleaned string into an array of lines, using the newline character as a delimiter.
var   Arr   =   (   input   .   trim()   )   .   split(   "\n"   )   ;



//  Begin the main processing loop. This loop continues indefinitely
//  until an explicit 'break' statement is encountered within its body.
while   (   true   )
{
    //  Extract the first element from the 'Arr' array.
    //  This element is expected to be a number representing 'N',
    //  the count of data sets to follow. The '- 0' ensures explicit
    //  type conversion to a number.
    var   N   =   Arr   .   shift()   -   0   ;

    //  Check if the value of N is 0. If it is, this signifies the
    //  end of the input data or a termination condition for the problem.
    if   (   N   ==   0   )
        break   ;   //  Exit the 'while' loop.


    //  Initialize a status flag for the current set of N items.
    //  "OK" indicates that, so far, no limits have been exceeded.
    var   flag   =   "OK"   ;

    //  Declare an empty array, 'mab', which will be used to store
    //  N sets of item data. Each set will contain weight (W),
    //  capacity A (A), and capacity B (B) for an item.
    var   mab   =   [ ]   ;

    //  Loop 'N' times to read and process each of the 'N' item data sets.
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )
    {
        //  Read the next line from 'Arr', which represents an item's data.
        //  Split this line by spaces, then use 'map(Number)' to convert
        //  each resulting string segment into a numerical value.
        var   arr   =   (   Arr   .   shift()   )   .   split(   " "   )   .   map(   Number   )   ;
        //  Add the processed array of numbers (representing one item's W, A, B)
        //  to the 'mab' collection.
        mab   .   push(   arr   )   ;
    }   //  End of the data input collection loop.


    //  Re-initialize the status flag to "OK". This is crucial as
    //  the previous flag initialization was before data input,
    //  and this one prepares for the main logic computation.
    var   flag   =   "OK"   ;


    //  Outer loop: Iterate through each item in the 'mab' array.
    //  'i' represents the index of the current "main" item being evaluated.
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )
    {
        //  Conditional early exit: If the 'flag' has already been set to "NG"
        //  (Not Good) in a previous iteration, there's no need to continue
        //  further processing for this set of N items.
        if   (   flag   ==   "NG"   )
            break   ;

        //  Extract the weight (W), capacity A (A), and capacity B (B)
        //  for the current item 'i' from the 'mab' array.
        var   W   =   mab[   i   ][   0   ]   ;   //  Weight of the current item.
        var   A   =   mab[   i   ][   1   ]   ;   //  Capacity A (e.g., length, height) of the current item.
        var   B   =   mab[   i   ][   2   ]   ;   //  Capacity B (e.g., width, depth) of the current item.


        //  Inner loop: Compare the current item 'i' with every other item 'j'
        //  in the 'mab' array to check for compatibility and accumulated weight.
        for   (   var   j   =   0   ;   j   <   N   ;   j++   )
        {
            //  Skip the comparison if the current item 'i' is the same as
            //  the 'other' item 'j'. An item cannot carry itself.
            if   (   i   ==   j   )
                continue   ;

            //  Extract the weight (w), capacity a (a), and capacity b (b)
            //  for the 'other' item 'j' from the 'mab' array.
            var   w   =   mab[   j   ][   0   ]   ;   //  Weight of the 'other' item.
            var   a   =   mab[   j   ][   1   ]   ;   //  Capacity a of the 'other' item.
            var   b   =   mab[   j   ][   2   ]   ;   //  Capacity b of the 'other' item.

            //  Check if item 'j' can be "carried" by item 'i'.
            //  This condition (B <= a && A <= b) implies that the dimensions
            //  of item 'i' (B, A) are less than or equal to the dimensions
            //  of item 'j' (a, b), allowing 'j' to fit 'i' somehow.
            //  If the condition is met, add the weight of item 'j' to
            //  the accumulated weight of item 'i'.
            if   (   B   <=   a   &&   A   <=   b   )
                W   +=   w   ;   //  Accumulate the weight.

            //  After potentially adding 'w' to 'W', check if the total
            //  accumulated weight 'W' for item 'i' exceeds the maximum
            //  allowed limit of 150.
            if   (   W   >   150   )
                flag   =   "NG"   ;   //  If overloaded, set the flag to "NG".
        }   //  End of the inner loop (j).
    }   //  End of the outer loop (i).

    //  After all comparisons for the current set of N items are complete,
    //  output the final status flag ("OK" or "NG") to the console.
    console   .   log(   flag   )   ;

}   //  End of the main 'while' loop.

//  End of program execution.