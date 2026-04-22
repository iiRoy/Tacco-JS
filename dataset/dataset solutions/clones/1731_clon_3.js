// A generator function to iteratively provide tokens from standard input.
function* inputTokenGenerator() {
    // Read all input from stdin, decode as UTF-8, trim whitespace, and split by newlines or spaces.
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf-8").trim().split(/\n|\s/);
    // Yield each token one by one.
    yield* rawInputData;
}

// Helper function to safely parse a string into an integer.
const parseNumericInput = (inputString) => {
    const parsedValue = parseInt(inputString, 10);
    // Basic validation: ensure it's a number and not NaN.
    if (isNaN(parsedValue)) {
        throw new Error(`Invalid numeric input encountered: "${inputString}"`);
    }
    return parsedValue;
};

// Function to acquire a specified number of values from an input stream.
// It can use a custom iterator or a default one initialized if not present.
function acquireMultipleValues(desiredCount, customIterator = null) {
    // Initialize the data stream, using a provided custom iterator or the default one.
    // The default iterator instance is stored on 'this' to maintain state across calls if 'this' is consistent.
    const dataStream = customIterator ?? (this.iteratorInstance ?? (this.iteratorInstance = inputTokenGenerator()));
    
    // Collect the specified number of values into an array.
    const resultBuffer = Array.from({ length: desiredCount }, () => {
        const nextItem = dataStream.next();
        // Guard clause: check if the input stream has been exhausted prematurely.
        if (nextItem.done) {
            throw new Error("Input stream exhausted prematurely before desired count was met.");
        }
        return nextItem.value;
    });
    
    return resultBuffer;
}

// Main execution block, encapsulated within an immediately invoked function expression (IIFE).
(() => {
    // Retrieve the primary numerical upper limit 'n' from the standard input.
    // We expect a single numeric input, so we read one value and then parse it using our helper.
    const [ upperLimit ] = acquireMultipleValues(1).map(parseNumericInput);

    // Initialize an accumulator variable for the final computed sum.
    let totalAccumulator = 0;

    // Begin the primary iteration loop from 1 up to and including the 'upperLimit'.
    for (let currentNumber = 1; currentNumber <= upperLimit; currentNumber += 1) {
        // Variable to store the number of divisors found for the 'currentNumber'.
        let currentDivisorCount = 0;
        
        // Calculate the square root of the current number. This helps optimize divisor finding,
        // as divisors come in pairs (d, N/d) where one is <= sqrt(N) and the other >= sqrt(N).
        const squareRootValue = Math.sqrt(currentNumber);
        
        // Iterate from 1 up to the integer part of the square root of 'currentNumber'.
        // This loop efficiently identifies all divisors.
        for (let factorCandidate = 1; factorCandidate <= squareRootValue; factorCandidate += 1) {
            // Check if 'factorCandidate' divides 'currentNumber' evenly.
            if (currentNumber % factorCandidate === 0) {
                // If it's a divisor, increment the count.
                currentDivisorCount += 1; 

                // If 'factorCandidate' is not the square root itself (i.e., 'currentNumber' is not a perfect square
                // or 'factorCandidate' is not the square root), then 'currentNumber / factorCandidate' is a
                // *different* divisor. We count this complementary divisor as well.
                if (factorCandidate * factorCandidate !== currentNumber) {
                    currentDivisorCount += 1; 
                }
            }
        }
        
        // Add the product of the 'currentNumber' and its total count of divisors to the overall sum.
        totalAccumulator += currentNumber * currentDivisorCount;
    }

    // Output the final calculated total sum to the console.
    console.log(totalAccumulator);
})();