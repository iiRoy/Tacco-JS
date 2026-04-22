"use strict"; // Enforce strict mode for better error handling across the script

const main = arg => { // Main function definition begins, accepting one argument
    arg = arg.trim() .split("\n") ; // Process input argument: trim whitespace, then split into lines

    const N = parseInt ( arg[0] .split(" ")[0] ) ; // Extract N from the first line of the processed input
    const X = arg[1] .split(" ") .map( n => parseInt( n ) ) ; // Parse array X from the second line, converting strings to integers
    const sortedX = [ ...X ] .sort( ( a, b ) => a - b ) ; // Create a sorted copy of array X in ascending order


    const medianOne = sortedX [ ( N / 2 ) - 1 ] ; // Calculate the first median value (lower median for even N)
    const medianTwo = sortedX [ N / 2 ] ; // Calculate the second median value (upper median for even N)


    let answer = [ ] ; // Initialize an empty array to store the resulting output


    for ( let i in X ) { // Iterate through the original array X using its indices
        if ( X[i] < medianTwo ) { // Check if the current element of X is less than the second median
            answer .push( medianTwo ) ; // If true, push the second median value to the answer array
        } else { // Otherwise (if X[i] is greater than or equal to medianTwo)
            answer .push( medianOne ) ; // Push the first median value to the answer array
        }
    }


    console .log( answer .join("\n") ) ; // Output the final answer array, with each element separated by a new line
}

main ( require('fs') .readFileSync( '/dev/stdin', 'utf8' ) ) ; // Call the main function with input read asynchronously from standard input