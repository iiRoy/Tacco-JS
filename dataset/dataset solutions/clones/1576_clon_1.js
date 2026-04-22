/*
 * This JavaScript program reads a single line of numeric input from standard input.
 * It then calculates the sum of the individual digits of the number provided.
 * Finally, it determines if this sum of digits is perfectly divisible by 9,
 * printing "Yes" if it is, and "No" otherwise.
 *
 * This implementation adheres to the properties of divisibility by 9.
 */

// --- SECTION: Input Processing ---

// Declare a constant variable 'input' to store the processed data.
// It uses Node.js's 'fs' module to synchronously read from '/dev/stdin'.
// The 'utf8' encoding is specified for character interpretation.
// '.slice(0, -1)' is crucial for removing the trailing newline character,
// which is typically appended to input read from standard streams.
// '.split('\n')[0]' then ensures that only the very first line of input is considered,
// discarding any subsequent lines if they were present.
const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . slice ( 0 , -1 ) . split ( '\n' ) [0] ; // This slice operation effectively trims the last character, often a newline.

// --- SECTION: Digit Summation ---

// Initialize a mutable variable 'total' to accumulate the sum of digits.
// It is set to zero initially, as there are no digits processed yet.
let total = 0 ;

// Begin a standard 'for' loop to iterate through each character of the 'input' string.
// 'i' is the loop counter, starting at 0 (the first character's index).
// The loop continues as long as 'i' is less than the total length of the 'input' string.
// 'i++' increments the counter after each iteration.
for ( let i = 0 ;  i < input.length ;  i++ )
{
    // Inside the loop, each character 'input[i]' is converted into a numerical value.
    // The 'Number()' constructor is used for explicit type conversion from string to number.
    // This numerical digit is then added to the 'total' accumulator.
    total += Number ( input[i] ) ;
} // End of the loop that calculates the sum of digits.

// --- SECTION: Output Generation ---

// The final step involves printing the result to the console.
// A ternary operator is employed to check the divisibility rule for 9.
// If 'total' modulo 9 equals 0 (meaning 'total' is perfectly divisible by 9),
// then the string "Yes" is printed. Otherwise, "No" is printed.
console . log ( total % 9 == 0 ? "Yes" : "No" ) ;

// --- End of program execution ---