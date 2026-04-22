/*
 *  This is a program written in JavaScript.
 *  Its primary purpose is to calculate and determine the minimum cost
 *  given a set of input parameters.
 */
"use strict" /*  This directive enables strict mode, ensuring cleaner code.  */


//  Definition of the main function that processes the input.
function    Main(    input    )
{
    //  First, we process the raw input string.
    input = input
        .trim()     //  Removes any leading or trailing whitespace characters.
        .split(' ') //  Splits the string by spaces into an array of substrings.
        .map(Number); /* Converts each element of the array from a string
                         * representation to an actual numerical value.      */

    //  Declare variables to hold the parsed input values.
    //  A, B, C are costs; X, Y are quantities.
    let A = input[0];       //  The cost associated with item A.
    let B = input[1];       //  The cost associated with item B.

    let C = input[2];       //  The cost associated with a combined item (C).

    let X = input[3];       //  The required quantity of item X.
    let Y = input[4];       //  The required quantity of item Y.


    //  Initialize 'ret' with the cost of purchasing items A and B individually.
    let ret = A * X + B * Y;

    //  An optimization check:
    //  If the sum of individual costs (A + B) is less than
    //  twice the cost of the combined item (2 * C),
    //  then buying combined items is never cheaper than buying individually.
    if ( ( A + B ) < ( 2 * C ) )
    {
        console.log( ret );     //  Output the direct purchase cost.
        return;                 //  Exit the function early.
    }


    /*
     *  Begin calculations involving the combined item 'C'.
     *  We need to consider scenarios where 'C' items are bought.
     *  Each 'C' item effectively covers half of an A and half of a B.
     *  So, we iterate through even numbers of 'C' items.
     */
    const Xmax = X * 2; //  Maximum number of 'C' items that could replace 'X'.
    const Ymax = Y * 2; //  Maximum number of 'C' items that could replace 'Y'.


    //  Loop to consider buying 'i' number of 'C' items,
    //  where 'i' covers up to the quantity of X.
    for ( let i = 1 ; i <= Xmax ; i++ )
    {
        //  The 'C' items are typically bought in pairs to fully replace A and B,
        //  or at least to simplify the logic. So, 'i' must be an even number.
        if ( i % 2 !== 0 ) {
            continue;   //  Skip this iteration if 'i' is odd.
        }

        //  Calculate the remaining quantities of A (represented by x)
        //  and B (represented by y) that still need to be bought individually.
        //  If X - i/2 becomes negative, it means X is fully covered by C items,
        //  so the remaining quantity is 0.
        let x = ( X - i / 2 ) > 0 ? ( X - i / 2 ) : 0;
        let y = ( Y - i / 2 ) > 0 ? ( Y - i / 2 ) : 0;

        //  Calculate the total cost for the current combination:
        //  cost of 'i' C-items + cost of remaining X items + cost of remaining Y items.
        let m = C * i + x * A + y * B;

        //  Update the overall minimum cost if the current combination 'm' is cheaper.
        if ( ret > m )
        {
            ret = m;
        }
    }


    //  Second loop, similar to the first, but primarily focused on covering 'Y'.
    //  This ensures that scenarios where Y is fully covered by C items,
    //  and X is partially covered, are also considered for minimal cost.
    for ( let i = 1 ; i <= Ymax ; i++ )
    {
        //  Again, ensuring 'i' is an even count for 'C' items.
        if ( i % 2 !== 0 )
        {
            continue;
        }

        //  Compute the remaining quantities of X and Y after 'i/2' C-items.
        let x = ( X - i / 2 ) > 0 ? ( X - i / 2 ) : 0;
        let y = ( Y - i / 2 ) > 0 ? ( Y - i / 2 ) : 0;

        //  Calculate the total cost for this specific configuration.
        let m = C * i + x * A + y * B;

        //  If this calculated cost 'm' is lower than the current minimum 'ret', update 'ret'.
        if ( ret > m ) {
            ret = m;
        }
    }

    //  Finally, print the lowest cost found across all considered scenarios.
    console.log( ret );
}


//  --- Program Execution Start ---
//  Reads the entire content of the standard input stream ('/dev/stdin')
//  as a UTF-8 encoded string, then passes it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;