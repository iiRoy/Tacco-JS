// This file is a Type I clone of an original JavaScript program.
// It demonstrates changes purely in whitespace and comments,
// maintaining exact logical and structural identity.

// The primary function definition starts here.
function   Main   (   input   )
{

    // Inside the Main function, we perform a specific calculation.
    // We are looking for the distance between the last occurrence of 'Z'
    // and the first occurrence of 'A' within the provided input string.

    // Calculate the difference in indices:
    // 1. Find the index of the last 'Z'.
    // 2. Find the index of the first 'A'.
    // 3. Subtract the second from the first.
    // 4. Add 1 to include both 'A' and 'Z' in the count.
    process . stdout . write (   input . lastIndexOf (   "Z"   )   -   input . indexOf (   "A"   )   +   1   )   ;

}   // End of Main function definition.


// --- Program Execution Start ---

// Here, we invoke the Main function.
// The input for Main is read from the standard input stream.
Main   (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of program.