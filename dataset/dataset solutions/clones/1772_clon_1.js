/*
 * This JavaScript file contains a function designed to solve
 * a classic combinatorial problem often referred to as the
 * "crane and turtle" puzzle.
 *
 * The core objective is to determine whether it's mathematically possible
 * to achieve a specified total number of animals (X) and a specific total
 * number of legs (Y), given that one type of animal (a crane) possesses
 * 2 legs, and the other (a turtle) possesses 4 legs.
 *
 * This implementation employs a straightforward iterative approach
 * to explore all viable combinations.
 *
 * Author:   Automated Code Generator
 * Version:  1.0.0
 * Date:     October 27, 2023
 */

//  The 'main' function serves as the primary entry point for processing the input data.
//  It takes an array of strings, where each string represents a line of input.
function   main   (   inputs   )   {

    //  The initial line of input is expected to contain two space-separated integers.
    //  These integers represent:
    //  -   'X': The total count of animals (cranes plus turtles).
    //  -   'Y': The cumulative total number of legs across all animals.
    //  We parse these string values into their integer equivalents.
    const   [   X   ,   Y   ]   =   inputs [ 0 ] . split   (   " "   ) . map   (   v   =>   parseInt   (   v   )   )   ;

    //  We now embark on an exhaustive iteration, systematically checking
    //  every conceivable number of turtles (represented by the variable 'kame').
    //  The count of turtles can logically span from zero (meaning all animals are cranes)
    //  up to the total number of animals, X (meaning all animals are turtles).
    for   (   let   kame   =   0 ;   kame   <=   X ;   kame++   )   {

        //  For each hypothetical number of turtles ('kame'), we deduce the
        //  corresponding number of cranes (represented by 'tsuru').
        //  Since 'X' is the total number of animals, the number of cranes
        //  is simply the total animals minus the number of turtles.
        const   tsuru   =   X   -   kame ;

        //  With the current count of turtles and cranes established, we proceed
        //  to verify if this specific combination yields the required total
        //  number of legs ('Y').
        //  Each turtle contributes 4 legs, and each crane contributes 2 legs.
        if   (   ( kame   *   4 )   +   ( tsuru   *   2 )   ===   Y   )   {

            //  If the calculated total leg count precisely matches 'Y',
            //  it signifies that a valid arrangement has been discovered.
            //  We output "Yes" to standard output to indicate success.
            console . log   (   "Yes"   ) ;
            //  As soon as a valid combination is found, there is no further
            //  need to continue searching, so we terminate the function.
            return ;
        }
    }

    //  Should the loop complete its entire traversal without encountering
    //  any combination of turtles and cranes that satisfies the given
    //  total number of legs ('Y'), it implies that no such arrangement exists.
    //  In this scenario, we output "No" to standard output.
    console . log   (   "No"   ) ;
}


//  ----------------------------------------------------------------------------
//  Program Initialization and Input Handling Block
//  ----------------------------------------------------------------------------

//  This segment is responsible for orchestrating the program's execution flow.
//  It begins by acquiring input from the standard input stream.
main   (   require   (   'fs'   ) . readFileSync   (   '/dev/stdin'   ,   'utf8'   ) . trim   (   ) . split   (   '\n'   )   )   ;

/*
 *  The 'require('fs')' call loads Node.js's file system module.
 *  'readFileSync('/dev/stdin', 'utf8')' synchronously reads the entire
 *  content of the standard input as a UTF-8 encoded string.
 *  '.trim()' removes any leading or trailing whitespace, including
 *  potential newline characters at the very end of the input.
 *  '.split('\n')' then divides the processed string into an array of
 *  sub-strings, where each element corresponds to a distinct line from the input.
 *  Finally, this array of input lines is passed to the 'main' function for processing.
 */

//  End of JavaScript source file.