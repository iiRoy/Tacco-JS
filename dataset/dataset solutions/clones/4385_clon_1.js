/*
 * This JavaScript module processes input data to perform specific operations on a sequence of numbers.
 * It identifies elements that are not in their expected positions and attempts to correct them
 * by swapping them with adjacent elements, then reports the total count of such swaps.
 *
 * This implementation adheres to a strict coding standard for robust execution.
 */

//  Ensures that the JavaScript code is executed in "strict mode".
//  This helps in writing cleaner code and catching common errors.
'use strict'




/**
 * The primary function that orchestrates the data processing logic.
 * It takes the raw input string, parses it, manipulates the numbers,
 * and then outputs a final count.
 *
 * @param   {string}   input   The raw input string, typically from standard input.
 */
function   Main   (   input   )
{
    //  Parses the input string to extract the array of numbers.
    //  The input is expected to be multi-line; the second line contains space-separated numbers.
    const   nums   =   input . split ( '\n' ) [ 1 ] . split ( ' ' ) . map ( n   =>   Number ( n ) ) ;

    //  Initializes a counter to keep track of the number of swaps performed.
    let   count   =   0 ;


    //  Iterates through the array of numbers from the beginning to the end.
    for   (   let   i   =   0 ;   i   <   nums . length ;   i ++   )
    {
        //  Checks if the current number `nums[i]` is not equal to its expected value `i + 1`.
        //  If they are not equal, it means the number is misplaced and a swap might be needed.
        if   (   nums [ i ]   ===   i   +   1   )
        {
            //  Temporarily stores the value of the next element in the array.
            let   tmp   =   nums [ i   +   1 ] ;

            //  Conditional logic to decide which swap operation to perform.
            //  This branch executes if `tmp` (i.e., `nums[i + 1]`) is a truthy value.
            if   (   tmp   )
            {
                //  Performs a swap between the current element (`nums[i]`) and the next element (`nums[i + 1]`).
                nums [ i   +   1 ]   =   nums [ i ] ;
                nums [ i ]   =   tmp ;
                //  Increments the swap counter as a swap has been successfully performed.
                count   +=   1 ;
            }
            //  This branch executes if `tmp` (i.e., `nums[i + 1]`) is a falsy value (e.g., undefined, null, 0, false).
            //  This typically happens when `i + 1` is out of bounds or the next element is 0.
            else
            {
                //  Performs a swap between the current element (`nums[i]`) and the previous element (`nums[i - 1]`).
                tmp   =   nums [ i ] ;
                nums [ i ]   =   nums [ i   -   1 ] ;
                nums [ i   -   1 ]   =   tmp ;
                //  Increments the swap counter.
                count   +=   1 ;
            }
        }
    }

    //  Outputs the final total count of swaps to the console.
    console . log ( count ) ;
}


//  The entry point of the script.
//  It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string
//  and then passes it to the `Main` function for processing.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;

//  End of the JavaScript program.