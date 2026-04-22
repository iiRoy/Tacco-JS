const processInputData = (rawData) => {
    // --- Type III: Add guard clause for input validation ---
    // Ensure the raw input data is a valid non-empty string.
    if (typeof rawData !== 'string' || rawData.trim() === '') {
        console.error("Error: Provided input data is either missing or not a valid string.");
        return; // Exit if input is invalid
    }

    // --- Type II: Rename variable and add descriptive comments ---
    // Split the entire input string into an array of individual lines.
    const parsedLines = rawData.split('\n');

    // --- Type III: Introduce a helper function to encapsulate first line parsing logic ---
    const extractInitialParameters = (lineContent) => {
        // Validate the line content before attempting to parse.
        if (!lineContent || lineContent.trim() === '') {
            throw new Error("Initial parameter line is empty or invalid.");
        }
        const stringParts = lineContent.split(' ');
        // Ensure there are at least two parts to parse.
        if (stringParts.length < 2) {
            throw new Error("Initial parameter line does not contain enough values.");
        }

        // --- Type III: Use parseInt with radix for explicit type conversion and error checking ---
        const firstNumericValue = parseInt(stringParts[0], 10);
        const secondNumericValue = parseInt(stringParts[1], 10);

        // Validate that the parsed values are actual numbers.
        if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
            throw new Error("Failed to parse valid numbers from the initial parameter line.");
        }
        return { count: firstNumericValue, threshold: secondNumericValue };
    };

    let initialSetupValues;
    try {
        // Attempt to parse the first line using the helper function.
        initialSetupValues = extractInitialParameters(parsedLines[0]);
    } catch (error) {
        // --- Type III: Add error handling for parsing failures ---
        console.error(`Parsing error for initial parameters: ${error.message}`);
        return; // Exit if initial parameters cannot be parsed
    }

    // --- Type II: Rename variables for clarity ---
    // 'N' is renamed to 'totalElementsCount'
    const totalElementsCount = initialSetupValues.count;
    // 'X' is renamed to 'targetTravelThreshold'
    const targetTravelThreshold = initialSetupValues.threshold;

    // --- Type III: Add validation for parsed numeric parameters ---
    if (totalElementsCount < 0 || targetTravelThreshold < 0) {
        console.error("Error: Count of elements or target threshold cannot be negative.");
        return;
    }

    // --- Type III: Add validation for the existence of the second line ---
    if (parsedLines.length < 2 || parsedLines[1].trim() === '') {
        console.error("Error: Missing or empty line for segment length data.");
        return;
    }

    // --- Type II: Rename variable and update mapping logic ---
    // 'Ls' is renamed to 'segmentDistances'
    // Map function now includes validation for each segment.
    const segmentDistances = parsedLines[1].split(' ').map(segmentStr => {
        const parsedSegment = parseInt(segmentStr, 10);
        // --- Type III: Add validation for individual segment values ---
        if (isNaN(parsedSegment) || parsedSegment < 0) {
            console.warn(`Warning: Invalid segment value '${segmentStr}' encountered. Treating as 0.`);
            return 0; // Default to 0 for invalid segments, or could throw an error.
        }
        return parsedSegment;
    });

    // --- Type II: Rename variables and initialize ---
    // 'boundSum' is renamed to 'cumulativeBoundaryCount'
    let cumulativeBoundaryCount = 1; // Starts at 1 for the initial point (origin)
    // 'distance' is renamed to 'currentAccumulatedDistance'
    let currentAccumulatedDistance = 0;

    // --- Type III: Change control flow from 'for' to 'while' loop ---
    // 'i' is renamed to 'segmentIteratorIndex'
    let segmentIteratorIndex = 0;

    // Loop through segments as long as we haven't processed all elements
    // and the accumulated distance is still below the target threshold.
    while (segmentIteratorIndex < totalElementsCount) {
        // --- Type III: Move the 'break' condition check to the beginning of the loop body
        // This ensures that if the threshold is met by a previous segment,
        // we don't process the current one.
        if (currentAccumulatedDistance >= targetTravelThreshold) {
            break; // Stop if target distance is reached or exceeded
        }

        // --- Type III: Add an intermediate variable for the current segment's value ---
        const currentSegmentValue = segmentDistances[segmentIteratorIndex];

        // Accumulate the distance from the current segment.
        currentAccumulatedDistance += currentSegmentValue;
        // Increment the boundary count for each segment successfully considered.
        cumulativeBoundaryCount++;

        // Move to the next segment in the array.
        segmentIteratorIndex++;
    }

    // --- Type III: Add a final sanity check (optional, but adds robustness) ---
    // Ensure the boundary count is at least 1, representing the starting point.
    if (cumulativeBoundaryCount < 1) {
        cumulativeBoundaryCount = 1;
    }

    // --- Type II: Update output method and comments ---
    // Display the final calculated number of cumulative boundaries.
    console.log(cumulativeBoundaryCount);
};

// --- Type II: Rename the main function call and maintain file reading logic ---
// This block handles the execution of the processing logic,
// typically by reading input from standard input in an execution environment.
const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(standardInputData);