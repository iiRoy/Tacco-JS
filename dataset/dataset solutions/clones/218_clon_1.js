/*
 * This JavaScript program processes numerical data from standard input.
 * It reads triplets of numbers (a, b, c) and performs a specific calculation
 * for each triplet, printing the result to the console.
 *
 * The input is expected to be a sequence of numbers separated by whitespace.
 * The program will continue processing triplets until there are no more
 * numbers to assign to 'a'.
 */
for
(
    // Initialize 'i': Read the entire standard input, decode it as UTF-8,
    // and then split the content by any whitespace character into an array of strings.
    i = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( /\s/ ) ,

    // Initialize 'j': This variable serves as an index to traverse the 'i' array.
    // It starts at the beginning of the array.
    j = 0
    ;

    // Loop Condition:
    // In each iteration, three consecutive elements are extracted from the 'i' array
    // using the post-increment operator 'j++'.
    // These elements are assigned to variables 'a', 'b', and 'c' respectively.
    // The loop continues as long as 'a' (the first element of the triplet)
    // evaluates to a truthy value (i.e., not undefined, null, or empty string if it were a string).
    a = i [ j ++ ] , // Assign the current element to 'a' and then increment 'j'.
    b = i [ j ++ ] , // Assign the next element to 'b' and then increment 'j'.
    c = i [ j ++ ]   // Assign the subsequent element to 'c' and then increment 'j'.
    ;
)
{
    // Body of the outer loop: This block executes for each valid triplet (a, b, c).

    // Inner loop: This loop performs the core calculation based on 'a', 'b', and 'c'.
    for
    (
        // Initialize 'r': This variable will accumulate the result of the calculation
        // for the current triplet. It is reset to 0 for each new triplet.
        r = 0
        ;

        // Inner Loop Condition:
        // The loop continues as long as 'c' is greater than 0.
        // The post-decrement operator 'c--' means 'c' is decremented after
        // its value has been checked for the condition.
        c --
        ;
    )
    {
        // Core Calculation within the inner loop:
        // 1. `a = a % b * 10`:
        //    - `a % b` calculates the remainder of 'a' divided by 'b'.
        //    - This remainder is then multiplied by 10.
        //    - The result of this operation is immediately assigned back to 'a'.
        //      This modified 'a' is used in the next step and in subsequent inner loop iterations.
        // 2. `( ... ) / b`: The new value of 'a' (remainder * 10) is then divided by 'b'.
        // 3. `~~(...)`: This is a double bitwise NOT operator.
        //    - It effectively truncates the decimal part of the number,
        //      converting it to an integer (similar to `Math.floor()` for positive numbers).
        // 4. `r += ...`: The resulting integer value is added to the accumulator 'r'.
        r += ~~ ( ( a = a % b * 10 ) / b ) ;
    }

    // After the inner loop completes (i.e., 'c' has reached 0),
    // the final calculated value of 'r' for the current triplet is printed to the console.
    console . log ( r ) ;
}

// End of the JavaScript program.
// The program terminates when the outer loop condition (a = i[j++]) fails
// because there are no more numbers left in the input array 'i'.