/*
 * This JavaScript program defines a function 'main'
 * that processes a given numeric input.
 * It first converts the number into an array of its digits.
 * Then, it calculates the sum of these digits.
 * Finally, it determines if the original input number
 * is perfectly divisible by the sum of its digits.
 * The program outputs 'Yes' if it is divisible, and 'No' otherwise.
 *
 * This file demonstrates a basic arithmetic check.
 */
function   main (   input   )
{

    // Convert the input number to a string, then split it into an array of character digits.
    var   inputA   =   input .   toString (   ) .   split (   ''   )   ;
    var   sum      =   0   ;   // Initialize a variable to accumulate the sum of digits.
    var   answer   =   'No'   ;   // Initialize the answer string; default is 'No'.

    // Loop through each character in the 'inputA' array.
    for   (   var   i   =   0   ;   i   <   inputA .   length   ;   i   ++   )
    {
        // Convert the current character (digit) to an integer and add it to the 'sum'.
        sum   +=   parseInt   (   inputA [   i   ]   )   ;
    }

    // Check if the original 'input' number is perfectly divisible by the calculated 'sum'.
    if   (   input   %   sum   ==   0   )
    {
        // If it is divisible, update the 'answer' to 'Yes'.
        answer   =   'Yes'   ;
    }

    // Print the final determined answer to the console.
    console .   log (   answer   )   ;
} // End of the 'main' function definition.


// This line reads input from standard input,
// converts it to a UTF-8 string,
// and then passes it as an argument to the 'main' function for processing.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;