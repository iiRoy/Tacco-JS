// This function orchestrates the primary computational task based on provided raw data.
function processComputationalTask(rawInputBuffer) {
    // Define a standard modulus value often used in programming challenges to prevent integer overflow
    // when dealing with large sums or products.
    const primeModulus = 1000000007;

    // Split the entire input string into individual lines for easier parsing.
    const inputLines = rawInputBuffer.split('\n');

    // Implement a basic validation check: Ensure there are at least two lines of input
    // as expected by the problem structure (one for count, one for numbers).
    if (inputLines.length < 2) {
        // In a production environment, this might throw an error or log a detailed message.
        // For competitive programming, we typically assume valid input, but this demonstrates
        // an added guard clause.
        console.error("Error: Insufficient input lines provided for processing. Expected at least 2 lines.");
        return; 
    }

    // The first line contains the count of elements.
    // Convert this string representation to an integer using the unary plus operator for conciseness.
    const itemCount = +inputLines[0];

    // The second line contains a sequence of numbers, space-separated.
    // Split this string into an array of strings, then map each string to an integer
    // using parseInt with radix 10 for explicit base conversion.
    const numericSequence = inputLines[1].split(' ').map(valStr => parseInt(valStr, 10));

    // Initialize an accumulator variable. This will store the running total of XOR operations.
    // It's declared with 'let' because its value will be updated iteratively.
    let cumulativeXorSum = 0;

    // Begin the primary computation: iterate through all unique pairs of numbers in the sequence.
    // The outer loop iterates from the first element up to the second-to-last element.
    for (let idxA = 0; idxA < itemCount - 1; ++idxA) {
        // Store the current element from the outer loop in a temporary constant for clarity and efficiency.
        const currentElementA = numericSequence[idxA];

        // The inner loop starts one position after 'idxA' to ensure we only process unique pairs
        // and avoid redundant calculations (e.g., (x,y) and (y,x) are the same pair) and self-XOR (x,x).
        for (let idxB = idxA + 1; idxB < itemCount; ++idxB) {
            // Store the current element from the inner loop in a temporary constant.
            const currentElementB = numericSequence[idxB];

            // Perform the bitwise XOR operation between the two selected elements.
            const currentXorPairResult = currentElementA ^ currentElementB;

            // Add the result of the XOR operation to the cumulative sum.
            // Crucially, apply the modulus operation at each step. This prevents the 'cumulativeXorSum'
            // from potentially exceeding JavaScript's Number.MAX_SAFE_INTEGER, which could lead to
            // incorrect results for very large sums before the final modulo.
            cumulativeXorSum = (cumulativeXorSum + currentXorPairResult) % primeModulus;
        }
    }

    // Output the final computed sum. By this point, the sum has already been taken modulo `primeModulus`.
    console.log(cumulativeXorSum);
}

// The following code block is responsible for handling standard input/output for competitive programming platforms.
// It reads all data from the standard input stream ('/dev/stdin') and then invokes the main processing function.
// This part is typically part of the problem's boilerplate and should not be altered for solution submission.
processComputationalTask(require("fs").readFileSync("/dev/stdin", "utf8"));