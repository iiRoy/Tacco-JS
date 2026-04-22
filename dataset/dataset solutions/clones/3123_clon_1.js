/*
 * This JavaScript file contains two primary functions:
 * 'x' which performs a specific pattern-matching and counting operation,
 * and 'main' which handles input and output.
 */

/**
 * Processes a string 's' to count specific patterns.
 *
 * @param {string} s - The input string to be processed.
 * @returns {number} The total count of unique patterns found.
 */
function x ( s )
{
    // Initialize 'n' with the length of the input string.
    var   n    =    s.length   ;

    // 'ans' is declared but not used in the final return,
    // demonstrating a potential artifact or placeholder.
    var   ans    =    0    ;

    // Convert the input string 's' into an array of characters.
    s    =    s.split("")    ;

    // 'count' will store the number of valid patterns found.
    var   count    =    0    ;

    // Loop through numbers from 0 up to the maximum possible integer value.
    // This loop generates binary patterns.
    for  (  var   i    =    0  ;  i    <    Number.MAX_VALUE  ;  i++  )
    {
        // Convert the current number 'i' to its binary string representation,
        // then split it into an array of characters, reverse it, and map to numbers.
        // This creates a pattern array (e.g., [1, 0, 1] for binary 101).
        var   pattern    =    i.toString(2).split("").reverse().map(Number)    ;

        // Check if the generated pattern is too short.
        // If it's shorter than n + 1, skip to the next iteration.
        if  (  pattern.length    <    n    +    1  )
        {
            continue    ;
        }

        // Check if the generated pattern is too long.
        // If it's longer than n + 1, we've gone past the relevant patterns, so break the loop.
        if  (  pattern.length    >    n    +    1  )
        {
            break    ;
        }

        // Remove the last element from the pattern array.
        // This effectively discards the most significant bit that made it n+1 length.
        pattern.pop()    ;


        // Initialize an empty array to store characters from 's' that match the pattern.
        var   result    =    []    ;

        // Iterate through the processed pattern.
        for  (  var   j    =    0  ;  j    <    pattern.length  ;  j++  )
        {
            // If the pattern element is '1', add the corresponding character from 's' to 'result'.
            if  (  pattern[j]    ==    1  )
            {
                result.push(s[j])    ;
                // Original comment: // console.log(s[j])
                /* The above line was commented out in the original code,
                 * it would have logged individual characters being added. */
            }
        }


        // Original comment: // console.log(pattern)
        // Original comment: // console.log(result)
        /* These lines were commented out in the original code.
         * They would have provided debugging information about the current pattern and result. */

        // If no characters were collected in 'result', skip this pattern.
        if  (  result.length    ==    0  )
        {
            continue    ;
        }

        // Filter 'result' to find characters that appear more than once.
        // This identifies non-unique characters within the 'result' subset.
        var   c    =    result.filter(  function   (  x  ,  i  ,  self  )  {
            return   self.indexOf(x)    !==    self.lastIndexOf(x)  ;
        }  )  ;

        // If 'c' (the array of non-unique characters) has any elements,
        // it means the 'result' subset contains duplicate characters, so skip this pattern.
        if  (  c.length    >    0  )
        {
            continue    ;
        }

        // If the pattern passed all checks (correct length, unique characters in 'result'),
        // increment the 'count'.
        count++    ;

    }
    // Return the final accumulated count of valid patterns.
    return   count    ;
}

/**
 * The main function to execute the program.
 * It reads input, parses it, calls the 'x' function, and prints the result.
 *
 * @param {string} arg - The raw input string, typically from stdin.
 */
function main ( arg )
{
    // Split the input argument by newline characters.
    arg    =    arg.split("\n")    ;

    // The first line of input is assigned to N (though N is not used later).
    var   N    =    arg[0]    ;

    // The second line of input is assigned to S, which is the actual string for processing.
    var   S    =    arg[1]    ;

    // Call function 'x' with string S and print its returned value to the console.
    console.log(x(S))    ;
}

// This block executes the 'main' function by reading input from '/dev/stdin'.
// It uses Node.js's 'fs' module to synchronously read the file content as UTF-8.
main(require('fs').readFileSync('/dev/stdin', 'utf8'))    ;