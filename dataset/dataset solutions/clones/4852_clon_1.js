/*
 * This is a Type I clone of an existing JavaScript program.
 * It performs a simple calculation based on two input numbers.
 * The original logic and structure are preserved exactly.
 */

// Define the primary function that processes the input string.
function   Main  (  input  )   {

    // Declare a variable 'arr' to store the parsed numbers.
    // The input string is split by spaces, and each part is converted to a numerical type.
    var   arr   =   input .   split (   " "   ) .   map (   Number   )   ;

    // Extract the individual numbers from the array into distinct variables 'a' and 'b'.
    var   a   =   arr [   0   ]   ,   b   =   arr [   1   ]   ;

    // Perform the calculation: (a * b) / (a + b)
    // And then print the computed result to the standard output console.
    console .   log (   a   *   b   /   (   a   +   b   )   )   ;

} // End of the 'Main' function definition.


// This part of the script is responsible for reading the input data
// and then invoking the 'Main' function with that data.
// It uses Node.js specific functionalities to read from standard input.
Main (
        require (   "fs"   )
            .   readFileSync (
                "/dev/stdin"   ,
                "utf8"
            )
) ; // Call the Main function with the content read from /dev/stdin.