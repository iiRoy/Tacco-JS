/*
 * This is an extensively modified Type I clone
 * of the original JavaScript program.
 * It demonstrates significant changes in whitespace and comments
 * while preserving the exact logical structure and identifiers.
 */

// This function, named 'Main', serves as the primary entry point
// for processing the given input string.
function   Main   (   input   )   {

    // Declare a variable 'xs'.
    // This variable will store an array of integers parsed from the input.
    var   xs   =   input                                       // Start with the raw input string.
        .   trim   (   )                                       // Remove any leading or trailing whitespace.
        .   split   (   ' '   )                                  // Split the trimmed string by spaces into an array of strings.
        .   map   (   v   =>   parseInt   (   v   ,   10   )   )   ;    // Convert each string element 'v' into an integer (base 10).

    // --- Conditional Logic Block ---
    // This 'if-else' statement checks specific conditions
    // based on the values stored in the 'xs' array.
    if   (
            xs   [   0   ]   <=   xs   [   2   ]                  // Condition 1: Is the first element less than or equal to the third?
            &&                                               // Logical AND operator: Both conditions must be true.
            xs   [   0   ]   +   xs   [   1   ]   >=   xs   [   2   ]    // Condition 2: Is the sum of the first and second elements
                                                               // greater than or equal to the third element?
        )   {
        // If both conditions in the 'if' statement evaluate to true,
        // then output "YES" to the console.
        console   .   log   (   "YES"   )   ;
    }   else   {
        // Otherwise (if the 'if' condition is false),
        // output "NO" to the console.
        console   .   log   (   "NO"   )   ;
    }

}   // End of the Main function definition.


// This line executes the 'Main' function.
// It retrieves input from standard input, typically for competitive programming environments.
Main   (
    require   (   "fs"   )                                     // Access the Node.js 'fs' (file system) module.
        .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )    // Read the entire content of '/dev/stdin'
                                                               // and decode it as a UTF-8 string.
)   ;

// End of JavaScript program execution.
// This concludes the Type I clone demonstrating extensive whitespace and comment modifications.