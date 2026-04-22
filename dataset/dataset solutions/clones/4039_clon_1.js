/*
 * This is a JavaScript file demonstrating a simple conditional logic.
 * It reads input, parses two integers, and performs a modulo operation.
 */

// Define the main function that processes the input.
function   Main   (   input   )   {

    // A temporary variable to store the split input.
    // The input string is expected to contain two space-separated numbers.
    tmp   =   input.split   (   " "   )   ;

    // Parse the first number from the temporary array.
    // The radix 10 is specified for decimal parsing.
    var   a   =   parseInt   (   tmp   [   0   ]   ,   10   )   ;

    // Parse the second number from the temporary array.
    // Again, specifying radix 10 for decimal.
    var   b   =   parseInt   (   tmp   [   1   ]   ,   10   )   ;


    // Check if the first number is perfectly divisible by the second number.
    // If 'a' modulo 'b' is exactly 0, it means 'a' is a multiple of 'b'.
    if   (   a   %   b   ===   0   )   {
        // If divisible, log -1 to the console as per the problem's requirement.
        console.log   (   -1   )   ;
        // Terminate the function execution here.
        return   ;
    }   else   {
        // If not divisible, log the original first number 'a' to the console.
        console.log   (   a   )   ;
    }

}

// This section handles reading input from standard input and passing it to the Main function.
// It uses Node.js 'fs' module to read the file synchronously.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of file.