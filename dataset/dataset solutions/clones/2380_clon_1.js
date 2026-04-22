/*
 * This is a JavaScript program designed to solve a specific algorithmic problem.
 * It reads input from standard input, processes it, and prints the result to standard output.
 * The core logic involves array manipulation and modular arithmetic to calculate a specific value.
 */
console.log( (  args  =>  { // Main anonymous function (an IIFE part) starts here.
    // Input parsing section:
    // 1. args.trim() removes any leading or trailing whitespace from the raw input string.
    // 2. .split('\n') divides the string into an array of lines based on newline characters.
    // 3. .map(r=>r.split(' ').map(v=>v|0)) processes each line:
    //    a. It splits the line by spaces to get individual string values.
    //    b. It then maps each string value 'v' to an integer using the bitwise OR operator with 0 (v|0),
    //       which is a common concise way to convert to integer in JavaScript.
    // 4. Finally, array destructuring `const [[N],A]` extracts the first element of the first line (N)
    //    and the rest of the elements from subsequent lines (A).
    const   [   [N]   ,   A   ]   =   args
        .trim()
        .split('\n')
        .map(  r  =>  r.split(' ').map(  v  =>  v  |  0  )  )
    ; /* End of input parsing and variable destructuring. */

    // Array 'a' initialization:
    // `Array(N+1).fill(0)` creates an array of size N+1 and populates it with zeros.
    // This array 'a' likely tracks counts or available quantities for different elements.
    // MOD constant:
    // `1e9+7` is a commonly used prime modulus in competitive programming to prevent integer overflow
    // in calculations that involve large numbers, especially in combinatorics.
    const   a   =   Array(N+1).fill(0)
    ,   MOD   =   1e9   +   7;

    // Initial condition for array 'a'.
    // `a[0] = 3;` sets the value at index 0 of array 'a' to 3.
    // This is a specific starting condition for the problem.
    a[0]   =   3;

    // Initialize the counter variable 'c'.
    // 'c' will accumulate the result of calculations within the loop using modular arithmetic.
    let   c   =   1
    ; // Semicolon after let statement.

    // Main processing loop:
    // This loop iterates 'N' times, processing each element in the input array 'A'.
    for   (   let   i   =   0
    ;   i   <   N
    ;   i++   )
    {
        // Step 1: Update 'c' using modular multiplication.
        // `c = c * a[A[i]] % MOD;` multiplies the current 'c' by the value in array 'a'
        // at the index specified by `A[i]`, then takes the result modulo MOD.
        // This operation is crucial for the problem's logic, often related to counting permutations or combinations.
        c   =   c   *   a[A[i]]   %   MOD
        ; // Intermediate calculation.

        // Step 2: Decrement the count for the current element `A[i]`.
        // `a[A[i]]--;` reduces the value at `a[A[i]]` by one.
        // This simulates using up or consuming an item.
        a[A[i]]--
        ; // Post-decrement operator.

        // Step 3: Increment the count for the next element `A[i]+1`.
        // `a[A[i]+1]++;` increases the value at `a[A[i]+1]` by one.
        // This might represent generating a new item or moving an item to a different state.
        a[A[i]+1]++
        ; /* Post-increment operator. */
    } // End of for loop.

    // Return the final calculated value 'c' as a string.
    // The backticks (``) indicate a template literal, which allows for string interpolation.
    return   `${c}`
    ; /* String interpolation for the result. */

// Immediately invoked function expression (IIFE) call:
// The anonymous function defined above is immediately executed with the input read from `/dev/stdin`.
}  )  (
    // Input reading part:
    // `require('fs')` imports the Node.js file system module.
    // `.readFileSync('/dev/stdin', 'utf8')` reads the entire content of standard input synchronously
    // and decodes it as a UTF-8 string.
    require('fs').readFileSync(
        '/dev/stdin'
        , // Separator for arguments.
        'utf8'
    )
)   )
; /* Final semicolon for console.log statement. */