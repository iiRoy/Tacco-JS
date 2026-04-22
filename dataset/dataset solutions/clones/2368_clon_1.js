/*
 * This is a Type I clone generated from an original JavaScript snippet.
 * The purpose is to demonstrate extensive changes in whitespace and comments
 * while maintaining exact structural and logical equivalence.
 *
 * Original function: main
 * Input: An array of strings, typically from standard input.
 * Output: A string or number printed to the console.
 */
function   main   (   input   )
{
    // Declare a variable 'n' to store the first input value as a number.
    // The '-0' is a common trick to ensure type conversion to a number,
    // though Number() or parseInt() could also be used.
    var   n   =   input[0]   -   0   ;

    // Initialize the answer variable 'ans' with a default unhappy face string.
    // This value will be updated later if a specific condition is met within the loop.
    var   ans   =   ":("   ;


    // Begin a for loop. The loop counter 'i' starts from 1.
    // It continues as long as 'i' is less than 'n'.
    // 'i' is incremented by 1 in each iteration.
    for   (   var   i   =   1   ;   i   <   n   ;   i++   )
    {
        // Inside the loop, evaluate a conditional statement.
        // It checks if the truncated value of 'i' multiplied by 1.08
        // is exactly equal to the value of 'n'.
        // Math.trunc() removes any fractional part of a number, effectively
        // rounding it down towards zero.
        if   (   Math.trunc   (   i   *   1.08   )   ==   n   )
        {
            // If the condition in the 'if' statement is true,
            // update the 'ans' variable with the current value of 'i'.
            // This means 'i' is the desired answer.
            ans   =   i   ;
        }   // End of the 'if' block for the current iteration.
    }   // End of the 'for' loop. All iterations have been completed.

    // After the loop finishes, print the final value stored in 'ans' to the console.
    // This will either be the default ":(" or the first 'i' that satisfied the condition.
    console.log   (   ans   )   ;
}


// This section handles the execution of the main function.
// It uses Node.js's 'fs' module to read data from standard input.
// The data is read synchronously, decoded as UTF-8, and then
// split into an array of strings based on newline characters.
// This array is then passed as the 'input' argument to the 'main' function.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   split   (   "\n"   )   )   ;

/*
 * End of the Type I cloned JavaScript file.
 * No logical or structural changes were made; only whitespace and comments
 * were altered to create visual distinction.
 */