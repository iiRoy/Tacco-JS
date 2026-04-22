/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input from standard input, processes it, and then prints
 * the result to standard output.
 *
 * The core logic involves manipulating arrays and sets to find unique
 * permutations or combinations based on the input parameters.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */


function      Main(   arg   ) {


    // Declare and initialize variable N from the first part of the input string.
    // The input 'arg' is first split by newline, then by space, and the first element is taken.
    // The '-0' is used to convert the string to a number.
    var   N    =    arg.split("\n")[0].split(" ")[0]   -   0   ;


    // Declare and initialize variable K, similarly extracted from the input.
    var   K    =    arg.split("\n")[0].split(" ")[1]   -   0   ;


    // Declare and initialize variable P. This array contains numbers from the second line of input.
    // The map function 'v => v-0' converts each string element to a number.
    var   P    =    arg.split("\n")[1].split(" ") . map(   v   =>   v   -   0   )   ;



    // Initialize an empty array 'ans' which will store string representations
    // of modified arrays during the iteration.
    var   ans    =    [ ]   ;


    // Loop through the array P, creating sub-arrays of length K and processing them.
    // The loop runs 'N - K + 1' times.
    for       (   var   i   =   0   ;   i   <   N   -   K   +   1   ;   i++   )
    {

        // Extract a sub-array of P starting from index 'i' with length 'K'.
        var   tmp    =    P . slice(   i   ,   i   +   K   )   ;


        // Sort the extracted sub-array 'tmp' using the custom 'compareNumbers' function.
        tmp . sort(   compareNumbers   )   ;


        // Construct a new array by concatenating three parts:
        // 1. The part of P before the current sub-array (P.slice(0, i))
        // 2. The sorted sub-array (tmp)
        // 3. The part of P after the current sub-array (P.slice(i + K))
        // The resulting array is then converted to a string and stored in 'ans'.
        ans[   i   ]    =    P . slice(   0   ,   i   ) . concat(   tmp   ) . concat(   P . slice(   i   +   K   )   ) . toString( )   ;


    } // End of the main processing loop.



    // Create a Set 'aa' from the 'ans' array.
    // A Set stores only unique values, effectively removing duplicate string representations.
    var   aa    =    new   Set(   ans   )   ;


    // Print the size of the Set 'aa' to the console, which represents the number of unique
    // modified array configurations found.
    console . log(   aa . size   )   ;


} // End of the Main function definition.



// Call the Main function, passing the content of the standard input as an argument.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire file content
// from /dev/stdin as a UTF-8 encoded string.
Main(   require(   "fs"   ) . readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;



// This is a helper function used for numerical sorting.
// It compares two numbers 'a' and 'b' and returns their difference.
// This is the standard way to sort numbers in ascending order in JavaScript.
function   compareNumbers(   a   ,   b   )
{
    return   a   -   b   ;
}