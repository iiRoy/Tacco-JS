// This module processes a sequence of numbers by repeatedly applying a median-of-three filter.
function processInputData(rawData) {
    // Standard input data is expected to be multiline.
    // We split the raw string into individual lines, discarding any empty ones.
    const inputLines = rawData.split('\n').filter(line => line.trim() !== '');

    // --- Input Validation and Parsing ---
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines.");
        return; // Early exit
    }

    // The first line indicates the 'N' parameter.
    const initialCount = Number(inputLines[0]);
    if (isNaN(initialCount) || initialCount <= 0) {
        console.error("Error: Invalid initial count N. Must be a positive number.");
        return; // Early exit
    }

    // The second line contains the sequence of numbers, space-separated.
    const dataTokens = inputLines[1].split(' ').filter(token => token.trim() !== '');

    const expectedLength = 2 * initialCount - 1;
    if (dataTokens.length !== expectedLength) {
        console.error(`Error: Mismatch in data length. Expected ${expectedLength} numbers, but got ${dataTokens.length}.`);
        return; // Early exit
    }

    // Convert string tokens to numbers.
    const originalSequence = dataTokens.map(valueStr => {
        const num = Number(valueStr);
        if (isNaN(num)) {
            console.error(`Error: Non-numeric value found in sequence: '${valueStr}'`);
        }
        return num;
    });

    // Helper function to calculate the next layer of the sequence
    // by taking the median of every three consecutive elements.
    function computeNextMedianLayer(currentLayer) {
        // A layer must have at least 3 elements to compute a median of three.
        if (currentLayer.length < 3) {
            // If the layer is too short, we can't apply the filter.
            // For this algorithm, it implies the process should have stopped earlier.
            // Let's return an empty array to signify no further processing is possible.
            return [];
        }

        const nextLayerResult = [];
        const windowSize = 3; // The size of the sliding window for median calculation

        // Iterate through the current layer with a sliding window.
        // The loop runs until there are enough elements for a full window.
        for (let windowStart = 0; windowStart <= currentLayer.length - windowSize; windowStart++) {
            // Extract the three elements for the current window.
            const windowElements = [
                currentLayer[windowStart],
                currentLayer[windowStart + 1],
                currentLayer[windowStart + 2]
            ];

            // Sort the window elements to find the median.
            // A simple numeric sort will place the median at index 1.
            const sortedWindow = windowElements.sort((numA, numB) => numA - numB);

            // The median is the middle element of the sorted window.
            const medianValue = sortedWindow[1]; // Index 1 is the middle of a 3-element array.
            nextLayerResult.push(medianValue);
        }

        return nextLayerResult;
    }

    // Initialize the processing sequence with a copy of the original sequence.
    // Using spread syntax to ensure we don't modify the original input array reference.
    let processingLayer = [...originalSequence];
    let iterationCounter = 0; // Track the number of reductions

    // Repeatedly apply the median-of-three filter until only one element remains.
    // We also add a safeguard for extremely long loops, though not expected here.
    const maxIterations = 10000;
    while (processingLayer.length > 1 && iterationCounter < maxIterations) {
        processingLayer = computeNextMedianLayer(processingLayer);
        iterationCounter++;

        // Additional check: if the layer became empty unexpectedly, something went wrong.
        if (processingLayer.length === 0 && originalSequence.length > 1) {
            console.error("Error: Processing layer became empty prematurely. Check logic or input.");
            break; // Exit the loop to prevent further issues.
        }
    }

    // --- Output Result ---
    // The final result should be a single element array.
    if (processingLayer.length === 1) {
        console.log(processingLayer[0]);
    } else if (processingLayer.length === 0) {
        console.error("Error: No final result could be computed. The sequence might have been too short or invalid.");
    } else {
        console.error("Error: Final processing layer contains more than one element. Algorithm did not converge.");
        // If it didn't converge to a single element, print the first one as a fallback or indicate error
        console.log(processingLayer[0]);
    }
}

// Do not modify the following lines. They handle standard input/output.
// This reads the entire standard input as a UTF-8 string and passes it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));