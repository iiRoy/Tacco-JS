/*
 * This JavaScript file implements a specific algorithm that processes a given input string.
 * It consists of a primary function, `main`, which orchestrates the entire process,
 * and a helper function, `calc`, which performs a sub-calculation.
 *
 * The `main` function first converts the entire input string into an integer.
 * It then iterates through each character of the input, performing cumulative sums
 * and calling the `calc` function with specific parameters derived from the input.
 * Finally, it logs the accumulated total to the console.
 *
 * The `calc` function takes a part of the input, a length, and an initial default value.
 * It iterates through a range, adding the default value, and parsing different substrings
 * of the input based on the provided length and iteration index, accumulating these values.
 * It then returns its own calculated total.
 *
 * This code reads its initial input from standard input.
 */


// The main entry point function that processes the input string.
function   main  (  input  )
{
    // Initialize the grand total by parsing the entire input string as an integer.
    var   total   =   parseInt  (  input  )  ;

    // Begin a loop that iterates through each character position of the input string.
    for  (  var   i   =   0  ;   i   <   input  .  length  ;   i  ++  )
    {
        // Declare and initialize a default accumulator 'defa' for the current outer loop iteration.
        var   defa   =   0  ;

        // Inner loop: Calculate 'defa' by summing integer values of characters
        // from the beginning of the input up to the current 'i' position (exclusive).
        for  (  var   j   =   0  ;   j   <   i  ;   j  ++  )
        {
            // Extract a single character at position 'j', parse it as an integer, and add to 'defa'.
            defa   +=   parseInt  (  input  .  substr  (  j  ,  1  )  )  ;
        }

        // Call the helper function 'calc' with the input, current index 'i', and the calculated 'defa'.
        // Add the result returned by 'calc' to the main 'total'.
        total   +=   calc  (  input  ,   i  ,   defa  )  ;
    }

    // After all calculations are complete, print the final 'total' to the console.
    console  .  log  (  total  )  ;
}


// A helper function responsible for performing a sub-calculation based on parts of the input.
function   calc  (  input  ,   length  ,   defa  )
{
    // Initialize a local 'total' variable for this function's specific accumulation.
    var   total   =   0  ;

    // Loop through a specific range determined by the input's length and the 'length' parameter.
    // The loop starts from '1' and continues as long as 'i' is less than (input.length - length).
    for   (  var   i   =   1  ;   i   <   input  .  length   -   length  ;   i  ++  )
    {
        // Add the provided 'defa' value to the current local total.
        total   +=   defa  ;

        // Extract a substring starting from 'length' with a length of 'i', parse it as an integer, and add to total.
        total   +=   parseInt  (  input  .  substr  (  length  ,   i  )  )  ;

        // Extract a substring starting from 'i + length' until the end of the input,
        // parse it as an integer, and add to total.
        total   +=   parseInt  (  input  .  substr  (  i   +   length  )  )  ;
    }

    // Return the accumulated total from this 'calc' function.
    return   total  ;
}


// This is the execution entry point of the script.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string,
// and then passes this string as an argument to the 'main' function to begin processing.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;