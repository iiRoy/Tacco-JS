'use strict' /* This directive enables strict mode for the entire script. */ ;

// The primary function of our application, processing input arguments.
const main = arg => {
    /*
     * Process the raw input string:
     * 1. Remove leading/trailing whitespace using trim().
     * 2. Split the string into an array of lines based on newline characters.
     */
    var input = arg . trim ( ) . split ( "\n" ) ;

    // Find the index of the "0 0" sentinel, which marks the end of test cases.
    const lastIndex = input . indexOf ( "0 0" ) ;

    // Extract the actual test cases from the input array.
    const nums = input . slice ( 0 , lastIndex ) ;

    // Initialize an array to store results for each test case.
    // The size matches the number of test cases, and all elements are initially 0.
    const result = [ ... Array ( nums . length ) ] . map ( obj => ( 0 ) ) ;


    /*
     * Recursive helper function to find combinations.
     *
     * @param {number[]} num - Current combination of numbers.
     * @param {number} max - The maximum number allowed in a combination (n from the input).
     * @param {number} target - The target sum (x from the input).
     * @param {number} i - The index of the current test case in the 'nums' array.
     */
    const callback = ( num , max , target , i ) => {

        // Base case: If the current combination already has 3 or more numbers,
        // we should not proceed further into this branch if it's already too long.
        // This condition seems to be an early exit for certain scenarios.
        if ( num . length >= 3 ) {
            return ;
        }

        // Iterate through possible next numbers to add to the combination.
        // Start from the number immediately following the last number in the current combination.
        for ( var j = num [ num . length - 1 ] + 1 ; j <= max ; j ++ ) {

            // Create a new combination by copying the current one and adding 'j'.
            const newNum = [ ... num ] ;
            newNum . push ( j ) ;

            // Calculate the sum of the numbers in the new combination.
            const sum = newNum . reduce ( ( a , b ) => a + b ) ;

            // Optimization: If the combination length exceeds 100, it's likely too long or an error,
            // so break out of the loop for this branch.
            if ( 100 < newNum . length ) {
                break ;
            }

            // Check if the current combination sums up to the target.
            if ( sum === target ) {
                // If it sums to the target, ensure it has at least 3 numbers.
                if ( newNum . length < 3 ) {
                    break ; // If it doesn't have 3 numbers, this combination is invalid, so stop.
                }

                // If valid, increment the count for this test case.
                // console.log("nums:"+JSON.stringify(newNum)); // Original debug line, commented out.
                result [ i ] ++ ;
            }

            // If the current sum is less than the target, continue exploring combinations recursively.
            if ( sum < target ) {
                callback ( newNum , max , target , i ) ;
            }
            // If the current sum is already greater than or equal to the target,
            // there's no need to add larger numbers, so break this inner loop.
            else {
                break ;
            }
        }
    } ; // End of callback function definition.


    // Iterate through each test case provided in the 'nums' array.
    nums . forEach ( ( row , num ) => {

        // Parse each row (e.g., "7 20") into an array of integers [n, x].
        const next = row . split ( " " ) . map ( str => parseInt ( str , 10 ) ) ;

        // Extract 'n' (maximum number allowed in combination).
        const n = next [ 0 ] ;

        // Extract 'x' (target sum).
        const x = next [ 1 ] ;

        // Start the recursive search for combinations for this test case.
        // Begin by trying each number from 1 to 'n' as the first element of a combination.
        for ( var i = 1 ; i <= n ; i ++ ) {
            callback ( [ i ] , n , x , num ) ;
        }
    } ) ; // End of forEach loop for test cases.


    // Print the final results, with each result on a new line.
    console . log ( result . join ( "\n" ) ) ;
} ; // End of main function.


// Invoke the main function with input from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;