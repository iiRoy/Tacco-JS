/*
 * This file processes input data to calculate a specific sum.
 * It reads from /dev/stdin, parses sequences, and applies a complex reduction.
 */

const   input = require('fs').readFileSync(
    '/dev/stdin', // Standard input file path
    'utf8'        // Encoding for reading the file
)

// Split the input into lines to separate the count from the sequence data.
const [ n, ...seqSetStr ] = input.split('\n')

// Parse each line of sequence data into an array of strings.
const seqSet = seqSetStr.map(  setStr  =>  setStr.split(' ')  )

/*
 * Extract the 'a' values from the parsed sequence sets.
 * The unary plus operator converts the string to a number.
 */
const aSeq = seqSet.map( set => +set[0] )

// Similarly, extract the 'b' values.
const bSeq = seqSet.map( set => +set[1] )

/*
 * Calculate the final sum using a right-to-left reduction.
 * The logic involves accumulating a sum and adjusting it based on 'b' values
 * to ensure divisibility.
 */
const sum = aSeq.reduceRight(
    ( sum, a, i ) => {
        // Get the corresponding 'b' value for the current index.
        const b = bSeq[i]

        // Calculate the current accumulated 'a' value.
        const currentA = a + sum

        // Determine the remainder when currentA is divided by b.
        const diff = currentA % b

        // If there's a remainder, adjust currentA to be divisible by b,
        // then subtract the original 'a' to get the new sum.
        // Otherwise, keep the existing sum.
        return diff > 0 ? currentA + (b - diff) - a : sum
    },
    0 // Initial value for the sum.
)

// Output the final calculated sum to the console.
console.log( sum )

// End of script.