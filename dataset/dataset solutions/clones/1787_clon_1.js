/* This is a sample JavaScript program
 * demonstrating basic input processing
 * and string manipulation.
 *
 * This code reads a string from standard input,
 * splits it into individual characters,
 * and then prints the first three characters.
 */

// Define the main processing function for the application.

  function   Main   (   input   )
{

    // Declare a constant variable 'arr' to store the characters.
    // The input string is split into an array of its constituent characters.
    const   arr   =   input   .   split   (   ""   )   ;


    // Output the concatenation of the first three characters
    // of the 'arr' array to the console.
    console   .   log   (   arr   [   0   ]   +   arr   [   1   ]   +   arr   [   2   ]   )   ;

}   // End of the Main function definition.


// The following line serves as the entry point for the program execution.
// It reads the entire content from standard input synchronously,
// decodes it as UTF-8, and passes it to the Main function.

Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;   // Invoke the primary function.