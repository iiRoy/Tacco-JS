"use strict"; // This line enables strict mode for the entire script.

// Function to generate permutations with repetitions.
// It takes an array of options and the desired length of each permutation.
const permutateWithRepetitions = (
    permutationOptions,
    permutationLength
) => {
    // Base case: if the desired permutation length is 1,
    // each option itself is a permutation of length 1.
    if ( permutationLength === 1 ) {
        return permutationOptions.map(   permutationOption => [permutationOption]   );
    }

    // Initialize an empty array to store all generated permutations.
    const permutations = [ ];

    // Recursively call the function to get smaller permutations
    // (permutations of length one less than the current target length).
    const smallerPermutations = permutateWithRepetitions(
        permutationOptions,
        permutationLength - 1
    );

    // Iterate through each available option from the input 'permutationOptions'.
    permutationOptions.forEach( ( currentOption ) => {

        // For each 'currentOption', iterate through all 'smallerPermutations'.
        smallerPermutations.forEach( ( smallerPermutation ) => {

            // Prepend the 'currentOption' to each 'smallerPermutation'
            // and add the resulting new permutation to the 'permutations' array.
            permutations.push(   [currentOption].concat(smallerPermutation)   );
        } );
    } );

    // Return the complete list of permutations generated.
    return permutations;
}; // End of 'permutateWithRepetitions' function.


// The main function responsible for processing input and solving the problem.
const main = arg => {

    // Trim leading/trailing whitespace and split the input string by newlines.
    arg = arg.trim().split( "\n" );

    // Extract the four single-digit numbers from the first line of input.
    // Assuming the input is a string like "ABCD", where A, B, C, D are digits.
    const A = parseInt(   arg[0].split("")[0]   );
    const B = parseInt(   arg[0].split("")[1]   );
    const C = parseInt(   arg[0].split("")[2]   );
    const D = parseInt(   arg[0].split("")[3]   );

    // Define the set of possible arithmetic operands.
    const operands = [ "+", "-" ];

    // Generate all possible sequences of 3 operands using permutations with repetitions.
    const patterns = permutateWithRepetitions(   operands, 3   );

    // Loop through each generated pattern of operands.
    for ( let i in patterns ) {

        let temp = []; // A temporary array to construct the arithmetic expression string.

        // Build the expression string by interleaving numbers and operators.
        for ( let j = 0; j < patterns[i].length; j++ ) {

            // Place the first number 'A' before the first operator.
            if ( j === 0 ) {
                temp.push( A );
            }

            // Place the second number 'B' before the second operator.
            if ( j === 1 ) {
                temp.push( B );
            }

            // Place the third number 'C' before the third operator.
            if ( j === 2 ) {
                temp.push( C );
            }

            // Add the current operator from the pattern.
            temp.push(   patterns[i][j]   );
        }

        // Add the last number 'D' to complete the expression.
        temp.push( D );

        // Evaluate the constructed expression string.
        // If the result equals 7, print the expression and terminate.
        if ( eval( temp.join("") ) === 7 ) {
            console.log(   temp.join("") + "=7"   );
            return; // Exit the main function as a solution has been found.
        }
    }
}; // End of 'main' function.

// Read input from standard input (/dev/stdin), decode it as UTF-8,
// and pass it to the 'main' function to begin processing.
main(    require('fs').readFileSync('/dev/stdin', 'utf8')    );