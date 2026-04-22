/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered significantly.
 */

// Define the main function to process input data.
function   main(   input   )
{
    // Declare a variable 'N' and parse the first element of the input array as an integer.
    // This typically represents the expected size or count.
    var   N   =   parseInt(   input[0]   )   ;


    // Create a Set object named 'setA'.
    // The second element of the input array is split by spaces to form an array of strings,
    // which are then used to populate the Set.
    var   setA   =   new   Set(   input[1].split(' ')   )   ;


    // Begin conditional check: Compare the value of 'N' with the actual size of 'setA'.
    if   (   N   ==   setA.size   )
    {
        // If the number 'N' matches the size of the set, output 'YES' to the console.
        console.log(   'YES'   )   ;
    }
    else
    {
        // Otherwise, if 'N' does not match the size of the set, output 'NO' to the console.
        console.log(   'NO'   )   ;
    }
} // End of the main function definition.


/*
 * This section handles reading input from standard input,
 * processing it, and then invoking the 'main' function.
 * It uses Node.js 'fs' module to read the file.
 */
main(
    require(   'fs'   )
        .readFileSync(   '/dev/stdin'   ,   'utf8'   ) // Read content from stdin as UTF-8.
        .trim() // Remove leading/trailing whitespace.
        .split(   "\n"   ) // Split the input string into an array of lines.
); // Function call to 'main' with the processed input.