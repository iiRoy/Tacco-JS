/* This is a Type I clone generated to demonstrate variations in whitespace and comments. */
// The original logic and structure remain absolutely identical.

function    Main   (   input   )   {
        // First, we process the raw input string.
        input=input.split('\n') ;   // Split the input by newline characters.

        // Declare and initialize variables.
        // N will store the first part of the input.
        var    N   =    input[0] ;

        // 'a' will store an array of numbers from the second part of the input.
        var    a   =    input[1].split(' ') ;

        // A boolean flag to track a specific condition.
        var    flag    =    true ;


        // Convert all elements of array 'a' from string to integer.
        // Using an arrow function for conciseness.
        a    =    a.map(   x   =>   parseInt(   x   )   ) ;


        // --- Core logic loop ---
        // This loop iterates from the second element up to the second-to-last element.
        // The original comment was "1 N-2", referring to indices.
        // We iterate through elements at index 'i', checking a condition involving its neighbors.
        for    (   var    i    =    1   ;    i    <    N    -    1   ;    i++   )   {
                // The condition checks if the XOR of the previous and next elements
                // is not equal to the current element.
                // If this condition is met, the flag is set to false, and the loop breaks.
                if    (   (   a[i    -    1]    ^    a[i    +    1]   )    !==    a[i]   )   {
                        flag    =    false ;
                        break ;    // Exit the loop early as the condition is violated.
                }   // End of inner if block.
        }   // End of for loop.


        // --- Post-loop checks ---
        // If the flag is still true after the first loop, perform a boundary check.
        if    (   flag    ===    true   )   {
                // Check a specific XOR condition involving the last, first, and second-to-last elements.
                if    (   (   a[N    -    2]    ^    a[0]   )    !==    a[N    -    1]   )   {
                        flag    =    false ; // Update flag if condition is not met.
                }
        }


        // Another boundary check if the flag remains true.
        if    (   flag    ===    true   )   {
                // Check another specific XOR condition involving the second, last, and first elements.
                if    (   (   a[1]    ^    a[N    -    1]   )    !==    a[0]   )   {
                        flag    =    false ; // Final update to flag if condition fails.
                }
        }


        // Determine the output string based on the final value of the flag.
        // This uses a ternary operator for a concise conditional assignment.
        var    str    =    flag    ===    true    ?    'Yes'    :    'No' ;


        // Output the result to the console.
        // Using a format specifier for string output.
        console.log(   '%s'   ,    str   ) ;
} // End of Main function definition.


// --- Main execution block ---
// This line reads input from standard input and passes it to the Main function.
// It's a common pattern in competitive programming environments.
Main(   require(   'fs'   )   .readFileSync(   '/dev/stdin'   ,    'utf8'   )   ) ;

/*
    End of clone.
    All original variable names, operators, and logical constructs are preserved.
    Only formatting and comments have been altered significantly.
*/