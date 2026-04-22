process.stdin.resume();
process.stdin.setEncoding('utf-8');

// Buffer for storing all incoming standard input data
let accumulatedInputBuffer = '';
// Pointer to the current line being read from the buffer
let currentReadPointer = 0;

// Event listener for incoming data chunks from standard input
process.stdin.on('data', incomingChunk => {
    // Append the new chunk to the accumulated buffer
    accumulatedInputBuffer += incomingChunk;
});

// Event listener for the end of standard input stream
process.stdin.on('end', () => {
    // Split the entire buffered input into an array of lines
    // using newline characters as delimiters.
    // .trim() handles potential leading/trailing whitespace, and \r? handles Windows newlines.
    accumulatedInputBuffer = accumulatedInputBuffer.trim().split(/\r?\n/);
    
    // Initiate the primary execution logic after input is fully processed.
    performCoreCalculation();    
});

/**
 * Retrieves the next line from the buffered input array.
 * Increments the internal line pointer after each successful read.
 * 
 * @returns {string} The next line of input as a string. Returns an empty string
 *                   and logs an error if an attempt is made to read beyond the buffer.
 */
function retrieveNextInputLine() {
    // Guard clause: Check if we're trying to read beyond available lines.
    if (currentReadPointer >= accumulatedInputBuffer.length) {
        console.error("Runtime Error: Attempted to read past the end of the input buffer. Check input format.");
        // Depending on requirements, could throw an error or return a default value.
        return ''; 
    }
    // Return the current line and then advance the pointer.
    return accumulatedInputBuffer[currentReadPointer++];
}

// Define the large prime number used for all modulo arithmetic operations.
// This is a common prime: 10^9 + 7.
const MODULO_VALUE = 1000000000 + 7;

/**
 * Applies the modulo operation to a given value, ensuring the result is always non-negative.
 * This is crucial for handling intermediate negative results from subtractions in modular arithmetic.
 * 
 * @param {number} value - The number to apply the modulo operation to.
 * @returns {number} The non-negative result of `value % MODULO_VALUE`.
 */
const getPositiveModulo = (value) => {
    // The formula (value % M + M) % M correctly handles both positive and negative `value`.
    return (value % MODULO_VALUE + MODULO_VALUE) % MODULO_VALUE;
};

/**
 * This is the primary function responsible for executing the core mathematical calculation.
 * It computes (10^N - 9^N + 8^N) % MODULO_VALUE, where N is dynamically read from standard input.
 * All intermediate calculations are performed modulo MODULO_VALUE to prevent overflow.
 */
function performCoreCalculation() {
    // Step 1: Read the input value N.
    // This value determines the exponent for the power calculations.
    const rawInputNString = retrieveNextInputLine();
    const iterationCount = Number(rawInputNString);

    // Step 2: Input Validation.
    // Ensure N is a valid non-negative integer.
    if (isNaN(iterationCount) || !Number.isInteger(iterationCount) || iterationCount < 0) {
        console.error(`Validation Error: Input '${rawInputNString}' is not a valid non-negative integer. Exiting.`);
        return; // Terminate execution if input is invalid.
    }

    // Step 3: Initialize variables for modular exponentiation.
    // These variables will store 10^N, 9^N, and 8^N, all modulo MODULO_VALUE.
    // Initializing to 1 corresponds to X^0.
    let baseTenPower = 1;
    let baseNinePower = 1;
    let baseEightPower = 1;

    // Step 4: Perform modular exponentiation in a loop.
    // Each iteration calculates (base * current_power) % MODULO_VALUE.
    for (let currentLoopIndex = 0; currentLoopIndex < iterationCount; ++currentLoopIndex) {
        // Update 10^N: (10^k * 10) % MODULO_VALUE
        baseTenPower = getPositiveModulo(baseTenPower * 10);
        
        // Update 9^N: (9^k * 9) % MODULO_VALUE
        baseNinePower = getPositiveModulo(baseNinePower * 9);
        
        // Update 8^N: (8^k * 8) % MODULO_VALUE
        baseEightPower = getPositiveModulo(baseEightPower * 8);
    }

    // Step 5: Calculate the final expression (10^N - 9^N + 8^N) % MODULO_VALUE.
    // Perform operations sequentially, applying `getPositiveModulo` at each step
    // to keep numbers within bounds and handle potential negative intermediate results.

    // Calculate (10^N - 9^N) % MODULO_VALUE
    let intermediateDifference = getPositiveModulo(baseTenPower - baseNinePower);

    // Add 8^N to the difference: ( (10^N - 9^N) + 8^N ) % MODULO_VALUE
    let finalComputedResult = getPositiveModulo(intermediateDifference + baseEightPower);
    
    // Step 6: Output the final result.
    console.log(finalComputedResult);
}