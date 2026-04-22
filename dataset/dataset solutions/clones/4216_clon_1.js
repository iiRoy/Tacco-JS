// This file contains a simple JavaScript program to check a specific condition on an input string.
// It serves as an example of basic string manipulation and conditional logic.

/*
 * The 'Main' function is the primary entry point for processing the input.
 * It takes a single argument, 'input', which is expected to be a string.
 * The function then evaluates a complex condition involving string slicing.
 */
function   Main   (   input   )   {

    // Declare a block for the main conditional statement.
    // The condition checks two separate string slice comparisons, joined by a logical OR operator.
    if  (
          input . slice (  0  ,  1  )   ==   input . slice (  2  ,  0  )
        ||
          input . slice (  1  ,  0  )   ==   input . slice (  -1  )
    )   {
        // If the entire condition evaluates to 'true', print 'Yes' to the console.
        console . log (  'Yes'  )  ;
    }   else   {
        // Otherwise, if the condition is 'false', print 'No' to the console.
        console . log (  'No'  )  ;
    } // End of the 'if-else' block.

} // End of the 'Main' function definition.


// --- Program Execution Start ---

// This line calls the 'Main' function with the actual input.
// The input is read synchronously from standard input ('/dev/stdin') using Node.js's 'fs' module,
// and it's decoded as a UTF-8 string.
Main  (
      require (  "fs"  )
          . readFileSync (  "/dev/stdin"  ,  "utf8"  )
)  ;

// --- Program Execution End ---