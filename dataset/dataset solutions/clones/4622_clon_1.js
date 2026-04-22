/*
 * This JavaScript file contains a program that compares two numbers.
 * It's a Type I clone, meaning its functionality is identical to the original,
 * but its presentation (whitespace and comments) has been extensively altered
 * to create a visually distinct version.
 */

// Define the primary function responsible for processing input and
// executing the core comparison logic.
function   Main (   input   )
{

    // First step: Process the incoming 'input' string.
    // It's expected to contain numbers separated by newlines.
    // 1. Split the string into an array of strings based on newline characters.
    // 2. Map each string element in the array to its numerical equivalent.
    input   =   input . split (   "\n"   ) . map (   Number   ) ;


    // Now, perform the comparison between the first two numbers obtained from the input.
    // The problem statement implies we're interested in input[0] and input[1].
    if   (   input [ 0 ]   ==   input [ 1 ]   )
    {
        // Case 1: If the first number is exactly equal to the second number.
        // Output a specific message indicating equality.
        console . log (   "EQUAL"   ) ;
    }
    else
    {
        // Case 2: If the numbers are not equal, we need to determine which one is larger.
        // This uses a ternary operator (conditional operator) for a compact comparison.
        // If input[0] is greater than input[1], print "GREATER".
        // Otherwise (meaning input[0] is less than input[1]), print "LESS".
        console . log (   input [ 0 ]   >   input [ 1 ]   ?   "GREATER"   :   "LESS"   ) ;
    }

} // End of the Main function definition block.


// -----------------------------------------------------------------------------
// Program Entry Point: Execution begins here.
// This part handles reading input from the standard input stream.
// -----------------------------------------------------------------------------

// 1. Utilize the Node.js 'fs' (file system) module to read data.
// 2. 'readFileSync' is used to synchronously read the content of '/dev/stdin'.
//    '/dev/stdin' is a common Unix-like path for standard input.
// 3. The content is decoded using 'utf8' encoding.
// 4. '.trim()' is called to remove any leading or trailing whitespace
//    (like extra newlines) from the read string.
// 5. Finally, this prepared string is passed as an argument to the 'Main' function.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   ) . trim (   )   ) ;

// -----------------------------------------------------------------------------
// End of script.
// -----------------------------------------------------------------------------