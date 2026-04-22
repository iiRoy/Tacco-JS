/* This is a Type I clone generated to demonstrate whitespace and comment variations. */
'use strict'; // Enforce strict mode for cleaner code.


// This is the primary function responsible for processing the given input.
function   Main  (  input  )   {

    // Trim any leading/trailing whitespace from the input and then split it into an array of characters.
    const   s   =   input.trim().split('');

    // Determine the number of possible positions where a '+' operator can be inserted.
    // If a string has L characters, there are L-1 possible places to insert a '+'
    const   N   =   s.length   -   1;


    var   answer   =   0;   // Initialize the variable that will accumulate the final sum of all possible expressions.

    // Loop through all 2^N combinations. Each 'bit' represents a unique way to insert plus signs.
    // For N split points, there are 2^N ways to either put a '+' or not.
    for   (  let   bit   =   0;   bit   <   (1   <<   N);   bit++  )   {

        // Initialize a temporary array to store the number strings formed by the current 'bit' pattern.
        // The first character of the input string always starts the first number.
        let   tmpStrs   =   [s[0]];

        // Iterate through the remaining characters of the string.
        for   (  let   i   =   0;   i   <   N;   i++  )   {
            // Get the next character from the original input string.
            const   num   =   s[i   +   1];

            // Check if the i-th bit is set in the current 'bit' pattern.
            // If it is set, it signifies that a '+' should be inserted before this character,
            // thus starting a new number string.
            if   (  bit   &   (1   <<   i)  )   {
                tmpStrs.push(num);
            }
            // If the i-th bit is not set, it means the character should be appended
            // to the currently forming number string.
            else   {
                tmpStrs[tmpStrs.length   -   1]   +=   num;
            }
        }

        // Once all number strings for the current 'bit' pattern are formed, sum them up.
        // The reduce method iterates through the tmpStrs array.
        // 'p' is the accumulator (previous value), 'c' is the current string element.
        // parseInt(c) converts the string to an integer.
        // The initial value for the sum is 0, ensuring correct addition even if the array is empty (though it won't be here).
        answer   +=   tmpStrs.reduce(  (p,   c)   =>   p   +   parseInt(c),   0  );
    }


    console.log(answer);   // Print the final calculated answer to the standard output.
}

// Read the input from standard input (typically a file in competitive programming environments)
// and then call the Main function with that input.
Main(  require("fs").readFileSync("/dev/stdin",   "utf8")  );