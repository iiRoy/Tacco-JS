/*
 * This is a JavaScript program designed to process numerical input.
 * It reads two numbers from standard input, performs a specific calculation,
 * and then outputs the result.
 */

// Define the main function that orchestrates the entire process.
function   main   (   input   )

{ // The function body begins here.

    // First, split the incoming 'input' string by spaces.
    // This assumes the input contains two space-separated numbers.
    const   nums   =   input . split   (   " "   )


    // Parse the first element of the 'nums' array into an integer.
    // The base 10 is explicitly specified for robustness.
    const   a   =   parseInt   (   nums   [   0   ]   ,   10   )

    // Similarly, parse the second element of the 'nums' array into an integer.
    const   p   =   parseInt   (   nums   [   1   ]   ,   10   )


    // Perform the core calculation: (a * 3 + p) divided by 2,
    // then take the floor (round down to the nearest whole number).
    const   result   =   Math . floor   (   (   a   *   3   +   p   )   /   2   )
    // The calculated result is now stored in the 'result' variable.


    // Output the final calculated 'result' to the console.
    console . log   (   result   )

} // The 'main' function body concludes here.


// This part of the code handles program execution.
// It reads all data from standard input (typically '/dev/stdin' in Unix-like systems)
// using Node.js's 'fs' module, converts it to a UTF-8 string,
// and then passes this string to the 'main' function.
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )
// The program starts by calling 'main' with the input data.