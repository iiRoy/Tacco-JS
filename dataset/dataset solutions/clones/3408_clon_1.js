/*
 * This JavaScript function processes a numerical input
 * and outputs a specific Christmas-related message
 * based on the input value.
 */
function     main   (   input   ) {
    // Declare a constant to store the parsed integer.
    // The input string is converted to an integer with base 10.
    const   D    =    parseInt  (  input  ,  10  )  ;


    // Check the value of D against specific Christmas dates.
    if   (  D    ===    25  )
    {
        // If D is 25, it's Christmas Day.
        console.log   (   'Christmas'   )   ;
    }
    else   if   (  D    ===    24  )
    {
        // If D is 24, it's Christmas Eve.
        console.log   (   'Christmas Eve'   )   ;
    }
    else   if   (  D    ===    23  )
    {
        /*
         * If D is 23, it's the day before Christmas Eve.
         * Often referred to as "Christmas Eve Eve".
         */
        console.log   (   'Christmas Eve Eve'   )   ;
    }
    else
    {
        // For any other value of D (e.g., 22 or less),
        // it's "Christmas Eve Eve Eve".
        console.log   (   'Christmas Eve Eve Eve'   )   ;
    }
}
// End of main function definition.

// --- Program Execution Start ---

// Read input from standard input.
// The 'fs' module is used for file system operations.
// '/dev/stdin' is a common path for standard input in Unix-like systems.
// The input is read as UTF-8 encoded text.
const fs = require('fs'); // Import the file system module.
const stdInPath = '/dev/stdin'; // Define the standard input path.

// Read the file synchronously and decode it.
const fileContent = fs.readFileSync(stdInPath, 'utf8');

// Call the main function with the read content.
main(fileContent);

// --- Program Execution End ---