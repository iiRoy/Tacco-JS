// This is the primary function responsible for processing the given input.
function    Main    (    input    )    {

    // Declare two variables, 'left' and 'right', by splitting the input string
    // based on a space delimiter.
    var   [   left   ,   right   ]   =   input.split   (   " "   )   ;


    // Initialize an empty array named 'maxNum'. This array will store
    // the results of various arithmetic operations.
    var   maxNum   =   [   ]   ;

    /*
     *   Perform the addition operation on the numerical conversions
     *   of 'left' and 'right' and push the result into 'maxNum'.
     */
    maxNum.push   (   Number   (   left   )   +   Number   (   right   )   )   ;


    // Subsequently, calculate the difference between the numerical values
    // and also add this result to the 'maxNum' array.
    maxNum.push   (   Number   (   left   )   -   Number   (   right   )   )   ;


    // Finally, compute the product of 'left' and 'right' (after conversion
    // to numbers) and append this last result to the 'maxNum' array.
    maxNum.push   (   Number   (   left   )   *   Number   (   right   )   )   ;

}   // Closing brace for the Main function.


/*
 *   ---  STANDARD INPUT HANDLING  ---
 *   The following lines are crucial for interacting with the execution environment.
 *   DO NOT ALTER THIS SECTION. It is responsible for reading the entire
 *   standard input stream and passing it to the 'Main' function for processing.
 */
Main   (
    require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )
)   ;