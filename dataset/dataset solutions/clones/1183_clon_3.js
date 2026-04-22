// Initialize a buffer to accumulate all incoming data from standard input.
let rawDataBuffer = '';

// Obtain a reference to the standard input stream object.
const inputStream = process.stdin;

// Activate the input stream, allowing it to emit 'data' events.
inputStream.resume();

// Configure the input stream to decode incoming bytes as UTF-8 characters.
inputStream.setEncoding('utf-8');

// Register an event listener for when new chunks of data become available.
inputStream.on('data', (dataBlock) => {
    // Append the newly received data chunk to our primary buffer.
    rawDataBuffer += dataBlock;
});

// Register an event listener for when the input stream has finished sending data (e.g., EOF).
inputStream.on('end', () => {
    /**
     * Processes the collected input string to perform various distance calculations.
     * @param {string} fullInputString - The entire input collected from stdin.
     */
    const performDistanceCalculations = (fullInputString) => {
        // Perform initial validation: Check if any meaningful input was provided.
        if (!fullInputString.trim()) {
            console.error("Execution Error: No input data was detected. Please provide vector data.");
            // Terminate the process with an error code.
            process.exit(1);
        }

        // Split the accumulated input into an array of lines, removing leading/trailing whitespace.
        const processedLines = fullInputString.trim().split('\n');

        // Validate the minimum number of lines required for processing (n, vector P, vector Q).
        if (processedLines.length < 3) {
            console.error("Input Error: Insufficient lines detected. Expected at least 3 lines for element count and two vectors.");
            process.exit(1);
        }

        // Extract and parse the first line, which represents the count of elements in the vectors.
        const elementCountStr = processedLines[0];
        const elementCount = Number.parseInt(elementCountStr.trim(), 10);

        // Validate the parsed element count to ensure it's a positive integer.
        if (Number.isNaN(elementCount) || elementCount <= 0) {
            console.error(`Parsing Error: Invalid or non-positive element count detected: '${elementCountStr}'. Must be a positive integer.`);
            process.exit(1);
        }

        /**
         * Helper function to parse a string line into an array of floating-point numbers.
         * Includes validation for each parsed number.
         * @param {string} line - The string line to parse.
         * @returns {number[]} An array of numbers.
         */
        const parseVectorLine = (line) => {
            // Split the line by one or more whitespace characters and map to numbers.
            return line.trim().split(/\s+/).map(val => {
                const num = Number.parseFloat(val);
                // Validate if the parsed value is a valid number.
                if (Number.isNaN(num)) {
                    console.error(`Data Error: Non-numeric value encountered in vector data: '${val}'.`);
                    process.exit(1);
                }
                return num;
            });
        };

        // Parse the second and third lines into numerical vectors.
        const vectorP = parseVectorLine(processedLines[1]);
        const vectorQ = parseVectorLine(processedLines[2]);

        // Cross-validate that the parsed vector lengths match the declared element count.
        if (vectorP.length !== elementCount || vectorQ.length !== elementCount) {
            console.error(`Dimension Mismatch Error: Declared element count is ${elementCount}, but vector P has ${vectorP.length} elements and vector Q has ${vectorQ.length}.`);
            process.exit(1);
        }

        // Initialize accumulators for various distance metrics.
        let manhattanDistance = 0.0;     // Sum of absolute differences (L1 norm).
        let euclideanSquaredSum = 0.0;   // Sum of squared differences (component for L2 norm).
        let minkowskiOrder3Sum = 0.0;    // Sum of cubed differences (component for L3 norm).
        let chebyshevDistance = 0.0;     // Maximum absolute difference (L-infinity norm).

        /**
         * Custom helper function to calculate the absolute difference between two numbers.
         * @param {number} val1 - The first number.
         * @param {number} val2 - The second number.
         * @returns {number} The absolute difference.
         */
        const calculateAbsoluteDifference = (val1, val2) => {
            const difference = val1 - val2;
            // A common way to implement absolute value without Math.abs.
            return (difference < 0) ? -difference : difference;
        };

        // Iterate through each element pair of the vectors to compute distance components.
        for (let idx = 0; idx < elementCount; ++idx) {
            const pVal = vectorP[idx]; // Current element from the first vector.
            const qVal = vectorQ[idx]; // Current element from the second vector.

            // Calculate the absolute difference for the current pair of elements.
            const currentAbsDiff = calculateAbsoluteDifference(pVal, qVal);

            // Accumulate for Manhattan (L1) distance.
            manhattanDistance += currentAbsDiff;

            // Calculate the square of the absolute difference.
            const squaredDiff = currentAbsDiff * currentAbsDiff;
            // Accumulate for Euclidean (L2) distance's squared sum.
            euclideanSquaredSum += squaredDiff;

            // Calculate the cube of the absolute difference.
            const cubedDiff = squaredDiff * currentAbsDiff;
            // Accumulate for Minkowski L3 distance's cubed sum.
            minkowskiOrder3Sum += cubedDiff;

            // Update Chebyshev (L-infinity) distance if the current absolute difference is greater.
            // This is an alternative to using Math.max.
            if (currentAbsDiff > chebyshevDistance) {
                chebyshevDistance = currentAbsDiff;
            }
        }

        // Final calculation for Euclidean (L2) distance by taking the square root.
        const euclideanDistance = Math.sqrt(euclideanSquaredSum);
        // Final calculation for Minkowski L3 distance by taking the cube root.
        const minkowskiL3Distance = Math.cbrt(minkowskiOrder3Sum);

        // Consolidate the calculated distances into a structured object for clarity.
        const distanceResults = {
            manhattan: manhattanDistance,
            euclidean: euclideanDistance,
            minkowskiL3: minkowskiL3Distance,
            chebyshev: chebyshevDistance
        };

        // Output the results, formatted to 6 decimal places for consistency.
        console.log(`L1 (Manhattan) Distance: ${distanceResults.manhattan.toFixed(6)}`);
        console.log(`L2 (Euclidean) Distance: ${distanceResults.euclidean.toFixed(6)}`);
        console.log(`L3 (Minkowski) Distance: ${distanceResults.minkowskiL3.toFixed(6)}`);
        console.log(`L-Infinity (Chebyshev) Distance: ${distanceResults.chebyshev.toFixed(6)}`);
    };

    // Invoke the main processing function once all input has been collected.
    performDistanceCalculations(rawDataBuffer);
});