/*
 * This file contains the solution for AtCoder problem agc027_a.
 * The problem can be found at: https://atcoder.jp/contests/agc027/tasks/agc027_a
 *
 * This is a Type I code clone, meaning only whitespace and comments
 * have been altered from the original source. All functional elements
 * including identifiers, operators, and expressions remain identical.
 */

"use strict" ; //  Enforce strict parsing and error handling rules for the entire script.


function   Main ( input )   {

    /*
     * Parse the first line of the input string.
     * It contains two space-separated numbers: N (number of children)
     * and x (total number of sweets available).
     */
    let   [ N ,   x ]   =   input . split ( "\n" ) [ 0 ] . split ( " " ) . map ( Number ) ;

    /*
     * Parse the second line of the input string.
     * This line contains N space-separated numbers, representing the
     * sweet desires of each child.
     * The array 'a' is then sorted in ascending order to facilitate
     * a greedy approach.
     */
    const   a   =   input . split ( "\n" ) [ 1 ] . split ( " " ) . map ( Number ) . sort ( ) ;


    let   count   =   0 ; /* This variable will keep track of the number of
                             children who have been successfully satisfied.
                             It is initialized to zero. */

    /*
     * Iterate through the sorted array 'a' (children's sweet desires).
     * The greedy strategy is to satisfy children who require fewer sweets first,
     * to maximize the total number of satisfied children.
     */
    for   (   let   i   =   0 ;   i   <   N ;   i ++   )   {

        //  Check if the currently available sweets ('x') are sufficient
        //  to satisfy the i-th child's desire (a[i]).
        if   (   a [ i ]   <=   x   )   {

            x   -=   a [ i ] ; //  If yes, deduct the sweets given to this child from the total.
            count ++ ;         //  Increment the count of satisfied children.

        }   else   {
            /*
             * If the current child's desire cannot be met, then because the
             * array 'a' is sorted, no subsequent child (who would require
             * an equal or greater amount of sweets) can be satisfied either.
             * Therefore, we can safely terminate the loop.
             */
            break ;
        }

    }


    /*
     * This conditional block addresses a specific edge case or problem requirement:
     * If, after iterating through all children (or breaking early), there are
     * still sweets remaining (x !== 0) AND at least one child was satisfied
     * (count !== 0), it implies that the sweets were not perfectly distributed
     * or fully consumed. In such a scenario, the problem might imply that the
     * last satisfied child should not be counted because sweets were left over.
     * This adjustment ensures adherence to the problem's exact definition.
     */
    if   (   x   !==   0   &&   count   !==   0   )   {
        count -- ; //  Decrement the count of satisfied children as per the problem's rules.
    }

    //  Output the final calculated number of satisfied children to standard output.
    console . log ( count ) ;


} /* End of the Main function definition */


/*
 * The following block of code is responsible for handling the standard
 * input/output mechanism in the AtCoder environment. It reads the entire
 * content of /dev/stdin as a UTF-8 string and passes it as an argument
 * to the 'Main' function.
 *
 * This specific part of the code should generally NOT be modified,
 * as it is part of the judge's execution environment setup.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;