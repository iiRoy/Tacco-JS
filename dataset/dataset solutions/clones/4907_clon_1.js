/*
 * This JavaScript module defines a main function to process numerical input.
 * It reads data from standard input, performs a series of transformations,
 * and then calculates a final sum based on specific conditions related to
 * duplicate values among the largest numbers in the input.
 * This structure is typical for competitive programming challenges.
 */

// Define the primary function that orchestrates the entire logic.
function    Main   (   input   )
{
    // Attempt to remove leading/trailing whitespace from the input string.
    // Note: String.prototype.trim() returns a new string and does not modify
    // the original 'input' variable in place. Since the result is not assigned
    // back to 'input', this specific call has no effect on the 'input'
    // variable used in subsequent operations. This behavior is intentionally
    // preserved as per Type I cloning rules.
    input  .  trim  ( ) ;


    // First, split the input string by spaces to get an array of string numbers.
    // Then, use the map function with the Number constructor to convert each
    // string element into its numerical representation.
    // The 'input' variable is reassigned here to hold this new array of numbers.
    input    =    input .   split  (  " "  )   .   map  (  Number  )  ;

    // Initialize a variable named 'sum' with an initial value of 3.
    // This variable will be decremented based on certain conditions later.
    var   sum    =    3  ;

    // Sort the array of numbers in descending order.
    // The comparison function (b - a) ensures that larger numbers come before smaller ones.
    // The 'input' variable is again reassigned to hold this newly sorted array.
    input    =    input .   sort  (  (  a  ,  b  )   =>   b   -   a  )  ;

    // Begin a loop that iterates exactly two times.
    // The loop variable 'i' will take values 0 and 1.
    for  (   var   i  =  0  ;   i  <  2  ;   i ++   )
    {
        // Inside the loop, check if the current element (input[i]) is strictly
        // equal to the next element (input[i+1]).
        // This condition is used to detect consecutive duplicate numbers
        // among the largest values in the sorted array.
        if  (   input  [  i  ]   ==   input  [  i  +  1  ]   )
        {
            // If a duplicate is found (i.e., input[i] equals input[i+1]),
            // decrement the 'sum' variable by 1.
            sum --  ;
        }
    }


    // After the loop completes and all checks are performed,
    // output the final calculated value of 'sum' to the console.
    console  .  log  (  sum  )  ;

}

// This section handles the execution of the 'Main' function.
// It reads the entire content of the standard input stream ('/dev/stdin')
// as a UTF-8 encoded string using Node.js's built-in 'fs' module,
// and then passes this string as the 'input' argument to the 'Main' function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;