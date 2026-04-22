/*
 * This JavaScript program processes numerical input from standard input.
 * It determines a specific property of the numbers provided
 * and outputs either 'Yes' or 'No' based on that property.
 *
 * The input is expected to be in two lines:
 * - The first line contains a single integer N, representing the count of numbers.
 * - The second line contains N space-separated integers.
 */
console
    .log( // Output the result to the console.

        ( // This is an Immediately Invoked Function Expression (IIFE).
            args => { // The input string is passed as 'args'.

                // Destructure the parsed input.
                // The first line gives us N, the second line gives us the array 'a'.
                const [
                          [ N ] // N is extracted as the first element of the first line.
                        , a     // 'a' is the array of numbers from the second line.
                      ] = args  // The raw input string.
                    .trim()     // Remove any leading or trailing whitespace from the input string.
                    .split`\n`  // Split the string into an array of lines based on newline characters.
                    .map(       // Map over each line to parse its content.
                        r => r  // 'r' represents the current line string.
                            .split` ` // Split the line by spaces into an array of number strings.
                            .map(     // Map over each number string to convert it to an integer.
                                v => v | 0 // Convert string 'v' to an integer using bitwise OR with 0.
                            )
                    )
                ; // End of the const declaration for N and a.


                // Initialize counters for specific properties of the numbers.
                let odd = 0 // Counter for odd numbers.
                    , p4  = 0 // Counter for numbers perfectly divisible by 4.
                    ;


                // Iterate through the array 'a' from the first element up to N.
                for (
                    let i = 0 // Initialize loop counter 'i' to 0.
                    ;
                    i < N     // Continue loop as long as 'i' is less than N.
                    ;
                    i++       // Increment 'i' after each iteration.
                ) {
                    // Check if the current number a[i] is odd.
                    // a[i] & 1 evaluates to 1 if a[i] is odd, 0 if even.
                    odd += a[i] & 1
                    ;

                    // Check if the current number a[i] is a multiple of 4.
                    // a[i] % 4 is 0 if it's a multiple of 4.
                    // !(0) is true (which evaluates to 1 in arithmetic contexts).
                    // !(non-zero) is false (which evaluates to 0).
                    p4 += !(a[i] % 4)
                    ;
                }


                // Evaluate the final condition and return 'Yes' or 'No'.
                // The condition is: (odd - (odd + p4 === N)) <= p4
                return (
                           odd // The total count of odd numbers.
                           -   // Subtraction operator.
                           (   // Parenthesized expression for the second operand.
                               odd // Count of odd numbers.
                               +   // Addition operator.
                               p4  // Count of multiples of 4.
                               === // Strict equality check.
                               N   // Total number of elements.
                           )   // The result of (odd + p4 === N) is 1 (true) or 0 (false).
                           <=  // Less than or equal to operator.
                           p4  // Count of multiples of 4.
                       )
                    ? // Ternary operator: if the condition is true.
                    'Yes' // Return 'Yes'.
                    : // Ternary operator: if the condition is false.
                    'No'  // Return 'No'.
                ; // End of return statement.

            } // End of the IIFE function definition.
        )( // Immediately invoke the function with the following argument:

            // Read the input from standard input synchronously.
            require('fs') // Access the Node.js 'fs' (file system) module.
                .readFileSync( // Call the readFileSync method.
                    '/dev/stdin' // Specify the path to standard input.
                    , 'utf8'     // Specify the encoding for reading the file.
                )
        ) // End of the IIFE invocation.
    )
; // End of console.log statement.