// Helper function to robustly parse a string containing space-separated numbers.
// It handles potential extra spaces and ensures parsing to floating-point numbers.
const parseNumericLine = (lineContent) => {
    // Trim leading/trailing whitespace, split by spaces, filter out any empty strings
    // that might result from multiple spaces, and then map to floating-point numbers.
    return lineContent.trim().split(' ').filter(Boolean).map(val => parseFloat(val));
};

// --- Input Stream Handling ---
// A buffer to accumulate all incoming data from the standard input stream.
let receivedInputBuffer = '';

// Obtain a reference to the standard input stream.
const standardInputReader = process.stdin;

// Set the encoding for the input stream to UTF-8 to correctly handle characters.
standardInputReader.setEncoding('utf-8');

// Explicitly resume the standard input stream. In some environments, stdin might
// be paused by default, and this ensures it starts emitting data events.
standardInputReader.resume();

// Attach an event listener for 'data' events. This event fires whenever a
// chunk of data is available from the input stream.
standardInputReader.on('data', (dataFragment) => {
    // Append the current data fragment to our buffer.
    receivedInputBuffer += dataFragment;
});

// Attach an event listener for the 'end' event. This event fires when
// the input stream has finished sending all its data (e.g., EOF reached).
standardInputReader.on('end', () => {
    // --- Data Processing and Validation ---
    // Split the accumulated buffer into individual lines, filtering out any empty lines
    // that might result from extra newlines or the final newline character.
    const processedLines = receivedInputBuffer.split('\n').filter(line => line.trim() !== '');

    // Basic validation: ensure we have at least three lines of input.
    // The first line is for vector length, the next two for the vectors themselves.
    if (processedLines.length < 3) {
        console.error("ERROR: Insufficient input lines provided. Expected at least 3 lines for vector size and two vectors.");
        process.exit(1); // Terminate the process with an error code.
    }

    // Parse the first line to determine the expected length of the vectors.
    const potentialVectorLength = parseInt(processedLines[0].trim(), 10);

    // Validate the parsed vector length: must be a positive integer.
    if (isNaN(potentialVectorLength) || !Number.isInteger(potentialVectorLength) || potentialVectorLength <= 0) {
        console.error("ERROR: Invalid or non-positive vector length specified on the first line. Must be a positive integer.");
        process.exit(1);
    }
    const vectorLength = potentialVectorLength; // Use a clear, descriptive constant name.

    // Parse the second and third lines into arrays of numbers using our helper function.
    const vectorA = parseNumericLine(processedLines[1]);
    const vectorB = parseNumericLine(processedLines[2]);

    // Validate that the parsed vectors have the expected length.
    if (vectorA.length !== vectorLength || vectorB.length !== vectorLength) {
        console.error(`ERROR: Mismatch in vector lengths. Expected ${vectorLength} elements, but Vector A has ${vectorA.length} and Vector B has ${vectorB.length}.`);
        process.exit(1);
    }

    // --- Distance Metric Calculations ---
    // Initialize variables to accumulate sums for various Minkowski distances.
    let p1NormSum = 0.0;            // Accumulator for L1 (Manhattan) distance.
    let p2SquaredSum = 0.0;         // Accumulator for squared differences for L2 (Euclidean) distance.
    let p3CubedSum = 0.0;           // Accumulator for cubed differences for L3 Minkowski distance.
    let infinityNormMax = 0.0;      // Keeps track of the maximum absolute difference for Chebyshev (L-infinity) distance.

    // An array to store the absolute differences between corresponding vector elements.
    // This intermediate step can be useful for debugging or further processing.
    const diffsAbsValue = [];

    // Loop through the vector elements to perform calculations.
    for (let currentIndex = 0; currentIndex < vectorLength; currentIndex++) {
        // Calculate the absolute difference between the current elements of vectorA and vectorB.
        const currentDifferenceAbs = Math.abs(vectorA[currentIndex] - vectorB[currentIndex]);

        // Store this absolute difference in our intermediate array.
        diffsAbsValue.push(currentDifferenceAbs);

        // Update the sum for the L1 norm.
        p1NormSum += currentDifferenceAbs;

        // Update the sum of squared differences for the L2 norm.
        p2SquaredSum += Math.pow(currentDifferenceAbs, 2);

        // Update the sum of cubed differences for the L3 Minkowski norm.
        p3CubedSum += Math.pow(currentDifferenceAbs, 3);

        // Update the maximum absolute difference encountered so far for the L-infinity norm.
        infinityNormMax = Math.max(infinityNormMax, currentDifferenceAbs);
    }

    // --- Output Results ---
    // Print a header for the results.
    console.log(`\n--- Calculated Vector Distance Metrics ---`);

    // Output the Manhattan Distance (L1 Norm).
    console.log(`> Manhattan Distance (L1 Norm): ${p1NormSum.toFixed(6)}`);

    // Output the Euclidean Distance (L2 Norm), which is the square root of p2SquaredSum.
    console.log(`> Euclidean Distance (L2 Norm): ${Math.sqrt(p2SquaredSum).toFixed(6)}`);

    // Output the L3 Minkowski Distance, which is the cube root of p3CubedSum.
    // Note: The original code might have had a typo here, using Dxy2 (squared sums)
    // for the L3 calculation. This version correctly uses Dxy3 (cubed sums).
    console.log(`> L3 Minkowski Distance: ${Math.cbrt(p3CubedSum).toFixed(6)}`);

    // Output the Chebyshev Distance (L-infinity Norm).
    console.log(`> Chebyshev Distance (L-infinity Norm): ${infinityNormMax.toFixed(6)}`);

    // Print a footer for the results.
    console.log(`------------------------------------------\n`);
});

// --- Optional Error Handling for Input Stream ---
// Attach an event listener for 'error' events on the input stream.
// This handles potential issues like file descriptor errors or other stream problems.
standardInputReader.on('error', (err) => {
    console.error(`CRITICAL ERROR: An unexpected error occurred with the input stream: ${err.message}`);
    process.exit(1); // Terminate the process due to a critical input error.
});