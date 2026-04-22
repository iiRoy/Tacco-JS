// This program processes a sequence of 3D data points from standard input.
// It applies a predefined set of linear transformations to these points,
// then calculates the sum of the top 'M' scores for each transformation,
// and finally determines the maximum of these sums.

// Utilize the 'process' module to interact with standard input.
const inputSource = require('process').stdin;

// A mutable string buffer to accumulate all received data from stdin.
let rawInputBuffer = '';

// Register an event listener to append each incoming data chunk to the buffer.
// The 'toString()' conversion is crucial as 'chunkData' might be a Buffer object.
inputSource.on('data', chunkData => {
    rawInputBuffer += chunkData.toString();
});

// Once the end of the input stream is signaled, initiate the processing logic.
inputSource.on('end', () => {
    // Divide the entire raw input string into an array of individual lines.
    const inputDataLines = rawInputBuffer.split('\n');

    // Attempt to parse the first line of input, which should contain two
    // space-separated integer parameters: N (number of data points) and M (top count limit).
    // Each token is trimmed of whitespace and converted to a number.
    const firstLineTokens = inputDataLines[0].split(' ').map(token => Number(token.trim()));

    // Destructure the parsed numerical values into descriptive variables.
    const numDataPoints = firstLineTokens[0]; // Corresponds to 'n' in the original problem.
    const topCountLimit = firstLineTokens[1]; // Corresponds to 'm' in the original problem.

    // --- Robust Input Validation and Guard Clauses ---
    // Check for invalid or missing numerical input for the primary parameters.
    if (isNaN(numDataPoints) || isNaN(topCountLimit) || numDataPoints < 0 || topCountLimit < 0) {
        console.error("Input Error: 'N' or 'M' parameters are invalid (not numbers, or negative).");
        // If M is 0, the result is 0 by definition, even if N is invalid.
        // If N is 0, there are no points to process, so the sum is 0.
        if (topCountLimit === 0 || numDataPoints === 0) {
             console.log(0);
        }
        return; // Terminate execution due to critical input error.
    }

    // Special handling for a zero 'topCountLimit': no elements to sum, so the result is 0.
    if (topCountLimit === 0) {
        console.log(0);
        return;
    }

    // Define a collection of 3D coefficient vectors. These vectors represent
    // different linear transformations to be applied to each input data point (x, y, z).
    // This collection includes all 8 possible combinations of (1, -1) for three dimensions.
    const coefficientSets = [
        [1, 1, 1],   // All positive coefficients
        [1, 1, -1],  // Positive X, Y; Negative Z
        [1, -1, 1],  // Positive X, Z; Negative Y
        [1, -1, -1], // Positive X; Negative Y, Z
        [-1, 1, 1],  // Positive Y, Z; Negative X
        [-1, 1, -1], // Positive Y; Negative X, Z
        [-1, -1, 1], // Positive Z; Negative X, Y
        [-1, -1, -1], // All negative coefficients
    ];

    // Initialize an array of arrays. Each inner array will store the calculated
    // scores for one specific coefficient set across all data points.
    const aggregateDimensionScores = Array.from({ length: coefficientSets.length }, () => []);

    // Begin iterating through each data point provided in the input, starting from the second line.
    for (let dataIdx = 0; dataIdx < numDataPoints; dataIdx++) {
        // Retrieve the current line corresponding to a data point.
        const currentDataLine = inputDataLines[dataIdx + 1];

        // --- Data Line Validation ---
        // Ensure the data line exists and is not empty.
        if (!currentDataLine || currentDataLine.trim() === '') {
            console.error(`Warning: Data line ${dataIdx + 2} is missing or empty. Skipping this entry.`);
            continue; // Move to the next data point.
        }

        // Parse the coordinates from the current data line.
        const currentCoords = currentDataLine.split(' ').map(token => Number(token.trim()));

        // --- Coordinate Validation ---
        // Verify that exactly three valid numerical coordinates were parsed.
        if (currentCoords.length !== 3 || currentCoords.some(isNaN)) {
             console.error(`Error: Invalid coordinate data on line ${dataIdx + 2}. Expected 3 numbers, got: "${currentDataLine}". Skipping this entry.`);
             continue; // Move to the next data point.
        }

        // Destructure the coordinates for clarity.
        const [coordA, coordB, coordC] = currentCoords;

        // Apply each defined coefficient set to the current data point.
        for (let vectorIdx = 0; vectorIdx < coefficientSets.length; vectorIdx++) {
            const currentVector = coefficientSets[vectorIdx];
            const [coeffA, coeffB, coeffC] = currentVector;

            // Calculate the composite score (linear combination) for the current point
            // using the coefficients from the current transformation vector.
            const calculatedScore = (coordA * coeffA) + (coordB * coeffB) + (coordC * coeffC);

            // Store the calculated score in the appropriate collection based on the vector index.
            aggregateDimensionScores[vectorIdx].push(calculatedScore);
        }
    }

    // After processing all data points, compute the sum of the top 'M' scores
    // for each individual set of aggregated dimension scores.
    const topAggregateScores = aggregateDimensionScores.map(currentValueSet => {
        // Sort the current set of scores in descending order (highest first).
        // Note: `sort` modifies the array in place.
        currentValueSet.sort((val1, val2) => val2 - val1);

        // Extract only the 'topCountLimit' highest scores from the sorted set.
        const selectedTopScores = currentValueSet.slice(0, topCountLimit);

        // Sum these selected top scores. An initial value of 0 is provided for robustness.
        const sumOfTopScores = selectedTopScores.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        return sumOfTopScores;
    });

    // Finally, sort the array of sums (derived from each coefficient set) in descending order
    // to identify the overall maximum sum.
    topAggregateScores.sort((sum1, sum2) => sum2 - sum1);

    // The first element of the sorted array is the highest sum found.
    const overallMaximumSum = topAggregateScores[0];

    // Output the final computed maximum sum to the console.
    console.log(overallMaximumSum);
});