/*
 * This JavaScript file contains the implementation of the Main function.
 * It processes an array of numbers, calculates a specific sum based on
 * rounding rules, and outputs the final result to the console.
 *
 * The logic involves finding a specific minimum value and applying different
 * summation rules based on that minimum.
 */


// Define the primary function that encapsulates the program's core logic.
function Main(   input   )
{


    // Split the entire input string by newline characters to get an array of string representations of numbers.
    var     input_arr    =    input.split(  "\n"  )   ;


    // Convert each string element in 'input_arr' to an integer and store them in 'd'.
    var   d   =   input_arr.map(  x   =>   parseInt(x)  )   ;


    /*
     * The following line is commented out but could be used for debugging purposes.
     * It would display the parsed array 'd' to the console.
     // console.log(d)
     */


    // Initialize 'last' to keep track of the index of the number whose last digit is the minimum non-zero last digit.
    var    last    =    0   ;

    // Initialize 'min' with the last digit of the first number. This will be updated later.
    var    min     =    d[0]   %   10   ;


    // Loop through the first five elements of the 'd' array.
    for  (   var   i   =   0   ;   i   <   5   ;   i++   )
    {

        // Calculate the last digit of the current number.
        var    tmp    =    d[i]   %   10   ;

        // If the last digit is zero, skip this number as it doesn't affect the 'min' calculation for non-zero last digits.
        if (   tmp   ===   0   )
        {
            continue   ;
        }

        // If the current non-zero last digit is smaller than the current minimum, update 'min' and 'last'.
        if (   tmp   <   min   )
        {
            min    =    tmp   ;
            last   =    i    ; // Store the index of this new minimum.
        }

    } // End of the first processing loop.


    /*
     * These lines are commented out but could be used for debugging.
     * They would show the determined 'last' index and 'min' value.
     // console.log("last:" + last);
     // console.log("min:" + min);
     */


    // Initialize 'ans' (answer) to zero before calculating the final sum.
    var   ans   =   0   ;


    // Iterate through the first five elements again to calculate the final sum.
    for  (   var   i   =   0   ;   i   <   5   ;   i++   )
    {
        // If the current index 'i' matches the 'last' index (where the minimum non-zero last digit was found),
        // add the number as is to the answer.
        if   (   i   ===   last   )
        {
            ans    +=    d[i]   ;
        }
        // Otherwise, round the number up to the nearest multiple of 10 and add it to the answer.
        else
        {
            ans    +=    Math.ceil(   d[i]   /   10   )   *   10   ;
        }
    } // End of the second summation loop.

    // Output the final calculated answer to the standard console.
    console.log(   ans   )   ;

} // End of the Main function definition.


// Execute the Main function by reading input from standard input (/dev/stdin)
// using Node.js's 'fs' module and passing it as a UTF-8 string.
Main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;