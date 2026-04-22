/*
 * This function processes an array of lines,
 * extracting numbers from the second line,
 * and then performs a specific calculation
 * involving nested loops and modulo arithmetic.
 */
const processData = (   lines   )    =>    {
    // Parse the numbers from the second line of input.
    // The '+' prefix converts string elements to numbers.
    const nums = lines[1] . split (   ' '   ) . map (   x   =>   +x   )

    // Define a large prime number for modulo operations
    const limit = Math . pow (   10   ,   9   )   +   7

    // Initialize the main sum accumulator
    let sum = 0


    // Outer loop: iterates through each number in the 'nums' array
    for ( let i = 0 ; i < nums . length ; i ++ ) {
        // Initialize a local sum for the inner loop calculations
        let localSum = 0

        // Inner loop: calculates sum of subsequent elements, modulo 'limit'
        for ( let j = i + 1 ; j < nums . length ; j ++ ) {
            // Accumulate localSum, ensuring it stays within the modulo limit
            localSum = (   localSum   +   nums[j]   )   %   limit
        }

        // Update the main sum: multiply current number by localSum,
        // then add to main sum, all modulo 'limit'
        sum = (   sum   +   (   (   nums[i]   *   localSum   )   %   limit   )   )   %   limit
    }

    // Output the final calculated sum to the console
    console . log (   sum   )
}


// Initialize an empty string to accumulate input data
let i = ''

// Attach a 'data' event listener to standard input
// This appends incoming chunks of data to the 'i' string
process . stdin . on (   'data'   ,   c   =>   i   +=   c   )

// Attach an 'end' event listener to standard input
// This executes when all input data has been received
process . stdin . on (   'end'   ,   (   )   =>   {
    // Dynamically require the 'os' module to get the platform-specific End-Of-Line character
    const {   EOL   } = require (   'os'   )

    // Split the accumulated input string into an array of lines using EOL
    // This effectively prepares the input for the 'processData' function
    const lines = i . split (   EOL   )

    // Call the main data processing function with the prepared lines
    processData (   lines   )
}   )