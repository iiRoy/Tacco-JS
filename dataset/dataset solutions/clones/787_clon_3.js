const collectedInputLines = [];
let inputProcessor = null;

// Sets up the input processing mechanism using Node.js readline module.
function setupInputProcessing() {
    // Basic guard clause for environment
    if (typeof process === 'undefined' || !process.stdin) {
        console.error("System error: Standard input stream not available. Application cannot proceed.");
        process.exit(1);
    }

    inputProcessor = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout // Keeping output stream as part of the interface, though not used for output.
    });

    // Event listener for each line of input received
    inputProcessor.on('line', (currentLineData) => {
        // Validation: Only store non-empty or non-whitespace lines
        if (currentLineData.trim().length > 0) {
            collectedInputLines.push(currentLineData);
        }
    });

    // Event listener for the end of the input stream
    process.stdin.on('end', () => {
        // Ensure the readline interface is properly closed
        if (inputProcessor) {
            inputProcessor.close();
        }
        // Initiate the core geometric analysis with the gathered input
        initiateGeometricAnalysis(collectedInputLines);
    });
}

// A small numerical tolerance used for floating-point comparisons to account for precision issues.
const FLOATING_POINT_TOLERANCE = 1e-10;

/**
 * Determines the intersection point of two line segments.
 * Returns null if segments are parallel, collinear, or do not intersect within their defined bounds (0 to 1 for parameters).
 * Also returns null if the intersection point falls outside a specified coordinate range [-100, 100].
 * @param {Array<Object>} segmentOne - The first line segment, defined by two point objects {x: number, y: number}.
 * @param {Array<Object>} segmentTwo - The second line segment, defined similarly.
 * @returns {Object|null} An object {x: number, y: number} representing the intersection point, or null if no valid intersection.
 */
const getIntersectionCoordinates = (segmentOne, segmentTwo) => {
    // Deconstruct segment points for clearer variable names
    const p1 = segmentOne[0]; // First point of segment one
    const p2 = segmentOne[1]; // Second point of segment one
    const p3 = segmentTwo[0]; // First point of segment two
    const p4 = segmentTwo[1]; // Second point of segment two

    // Guard clause: Basic validation for point existence and structure
    if (!p1 || !p2 || !p3 || !p4 || typeof p1.x !== 'number' || typeof p1.y !== 'number') {
        // Log a warning for malformed input, but continue execution.
        console.warn("Input error: One or more segment points are invalid or malformed.");
        return null;
    }

    // Calculate vector components for each line segment
    const s1_x_comp = p2.x - p1.x; // Vector component for segment one (x-direction)
    const s1_y_comp = p2.y - p1.y; // Vector component for segment one (y-direction)
    const s2_x_comp = p4.x - p3.x; // Vector component for segment two (x-direction)
    const s2_y_comp = p4.y - p3.y; // Vector component for segment two (y-direction)

    // Calculate the determinant of the system, which is essentially the cross product of the direction vectors.
    // This value determines if the lines are parallel or intersecting.
    const crossProductDeterminant = (-s2_x_comp * s1_y_comp) + (s1_x_comp * s2_y_comp);

    // If the determinant is close to zero, the lines are parallel or collinear.
    // In such cases, there is no unique intersection point.
    if (Math.abs(crossProductDeterminant) < FLOATING_POINT_TOLERANCE) {
        return null;
    }

    // Calculate parameters 's' and 't' for the intersection point.
    // 't' refers to the parameter along segmentOne, 's' refers to the parameter along segmentTwo.
    const t_param = (s2_x_comp * (p1.y - p3.y) - s2_y_comp * (p1.x - p3.x)) / crossProductDeterminant;
    const s_param = (s1_x_comp * (p1.y - p3.y) - s1_y_comp * (p1.x - p3.x)) / crossProductDeterminant;

    // Check if the intersection point lies within both line segments.
    // For a point to be on a segment, its parameter value must be between 0 and 1 (inclusive).
    const isIntersectionWithinSegments = (t_param >= 0 && t_param <= 1 && s_param >= 0 && s_param <= 1);

    if (isIntersectionWithinSegments) {
        // Calculate the actual intersection coordinates using the parameter 't'
        const intersection_x_coord = p1.x + (t_param * s1_x_comp);
        const intersection_y_coord = p1.y + (t_param * s1_y_comp);

        // Define coordinate bounds for filtering intersection points
        const MIN_ALLOWED_COORD = -100.0;
        const MAX_ALLOWED_COORD = 100.0;

        // Check if the intersection point is within the allowed coordinate range
        const isWithinCoordBounds = (
            intersection_x_coord >= MIN_ALLOWED_COORD && intersection_x_coord <= MAX_ALLOWED_COORD &&
            intersection_y_coord >= MIN_ALLOWED_COORD && intersection_y_coord <= MAX_ALLOWED_COORD
        );

        if (isWithinCoordBounds) {
            return { x: intersection_x_coord, y: intersection_y_coord };
        }
    }

    // No valid intersection found within segments or within coordinate bounds
    return null;
};

/**
 * Calculates the number of planar regions formed by a collection of line segments.
 * This method is based on Euler's formula for planar graphs (V - E + F = 1),
 * where F (faces/regions) can be derived from the number of lines and unique intersection points.
 * Each new line adds one region, and each new unique intersection point it creates with previous lines adds another region.
 * @param {Array<Array<Object>>} lineSegmentsCollection - An array where each element is a line segment (an array of two point objects).
 * @returns {number} The total count of planar regions created by the segments.
 */
const tallyPlanarRegions = (lineSegmentsCollection) => {
    let currentRegionCount = 1; // Start with 1 region (the entire plane before any lines are drawn).
    const allDiscoveredUniqueIntersections = []; // Stores all unique intersection points found across all segments.
    const historicallyProcessedSegments = []; // Stores segments that have already been processed for intersections.

    // Iterate through each new line segment in the input collection
    for (let currentSegmentIndex = 0; currentSegmentIndex < lineSegmentsCollection.length; currentSegmentIndex++) {
        const activeSegment = lineSegmentsCollection[currentSegmentIndex];

        // Each new line segment inherently adds at least one new region.
        currentRegionCount++;

        const newIntersectionsForActiveSegment = []; // Temporary list for unique intersections involving the activeSegment.

        // Compare the active segment with all previously processed segments to find intersections
        for (let previousSegmentIndex = 0; previousSegmentIndex < historicallyProcessedSegments.length; previousSegmentIndex++) {
            const priorSegment = historicallyProcessedSegments[previousSegmentIndex];

            const potentialIntersectionPoint = getIntersectionCoordinates(activeSegment, priorSegment);

            if (potentialIntersectionPoint === null) {
                continue; // No valid intersection between these two segments.
            }

            // Check if this specific intersection point (between activeSegment and priorSegment)
            // is already present in our global list of unique intersections.
            let isPointAlreadyRegistered = false;
            for (const existingPoint of allDiscoveredUniqueIntersections) {
                // Use floating point tolerance for comparison of coordinates
                if (Math.abs(potentialIntersectionPoint.x - existingPoint.x) < FLOATING_POINT_TOLERANCE &&
                    Math.abs(potentialIntersectionPoint.y - existingPoint.y) < FLOATING_POINT_TOLERANCE) {
                    isPointAlreadyRegistered = true;
                    break;
                }
            }

            // If it's a truly new unique intersection point, add it to our global list
            if (!isPointAlreadyRegistered) {
                allDiscoveredUniqueIntersections.push(potentialIntersectionPoint);
                newIntersectionsForActiveSegment.push(potentialIntersectionPoint); // Also track for the current segment
            }
        }

        // After processing, add the active segment to the historical list for future comparisons.
        historicallyProcessedSegments.push(activeSegment);

        // Each *new unique* intersection point created by the active segment with prior segments
        // further subdivides existing regions, thus adding another region.
        currentRegionCount += newIntersectionsForActiveSegment.length;
    }

    return currentRegionCount;
};

/**
 * Main entry point function for geometric analysis.
 * It processes raw input strings, parses them into structured line segment data,
 * and then calls the region calculation logic, finally printing the results.
 * @param {Array<string>} rawInputStrings - An array of strings, each representing a line from standard input.
 */
const initiateGeometricAnalysis = (rawInputStrings) => {
    let currentInputReadCursor = 0; // Acts as an index/cursor for reading through the rawInputStrings array.

    // Helper function to parse a single line of four space-separated coordinates into a segment object.
    const parseSingleSegmentData = (coordLineString) => {
        // Input validation: Check for null/undefined or non-string input
        if (!coordLineString || typeof coordLineString !== 'string') {
            console.error("Parsing error: Received invalid input for segment coordinates.");
            return null;
        }

        const coordinateParts = coordLineString.split(' ');
        // Expected format: "x1 y1 x2 y2", so exactly 4 parts
        if (coordinateParts.length !== 4) {
            console.error(`Parsing error: Malformed coordinate string "${coordLineString}", expected 4 values.`);
            return null;
        }

        // Convert string parts to numbers, explicitly handling potential NaN
        const x1 = Number(coordinateParts[0]);
        const y1 = Number(coordinateParts[1]);
        const x2 = Number(coordinateParts[2]);
        const y2 = Number(coordinateParts[3]);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            console.error(`Parsing error: Non-numeric coordinate found in string "${coordLineString}".`);
            return null;
        }

        // Return the segment as an array of two point objects
        return [
            { x: x1, y: y1 },
            { x: x2, y: y2 }
        ];
    };

    // Main loop to process multiple test cases from the input
    while (currentInputReadCursor < rawInputStrings.length) {
        // Read the number of line segments for the current test case
        const numberOfSegmentsString = rawInputStrings[currentInputReadCursor++];
        const numSegmentsForCurrentCase = Number(numberOfSegmentsString);

        // Validate the number of segments
        if (isNaN(numSegmentsForCurrentCase) || numSegmentsForCurrentCase < 0) {
            console.error(`Input format error: Expected a positive integer for number of segments, got "${numberOfSegmentsString}". Terminating.`);
            break; // Terminate if a critical parsing error occurs
        }

        // A value of 0 for numSegmentsForCurrentCase typically signals the end of input batches in competitive programming.
        if (numSegmentsForCurrentCase === 0) {
            break; // Exit the processing loop
        }

        const segmentsForThisBatch = []; // Array to hold parsed segments for the current test case.

        // Collect and parse all segments for the current test case
        for (let segmentIterator = 0; segmentIterator < numSegmentsForCurrentCase; segmentIterator++) {
            // Guard against unexpectedly running out of input lines
            if (currentInputReadCursor >= rawInputStrings.length) {
                console.error("Input error: Unexpected end of data while reading segment definitions.");
                break; // Break inner loop if input is incomplete
            }
            const segmentLineData = rawInputStrings[currentInputReadCursor++];
            const parsedSegmentData = parseSingleSegmentData(segmentLineData);

            if (parsedSegmentData) {
                segmentsForThisBatch.push(parsedSegmentData);
            } else {
                // If a segment failed to parse, log a warning but attempt to continue with valid segments.
                console.warn(`Skipping malformed segment data at line ${currentInputReadCursor - 1}.`);
            }
        }

        // Only proceed to calculate if there are valid segments to process for this batch.
        if (segmentsForThisBatch.length > 0) {
            const calculatedRegionsResult = tallyPlanarRegions(segmentsForThisBatch);
            console.log(calculatedRegionsResult);
        } else if (numSegmentsForCurrentCase > 0) {
            // If the problem specified N > 0 segments but none could be parsed, output 1 region (the base plane).
            console.log(1);
        }
    }
};

// Immediately execute the input setup to begin listening for input
setupInputProcessing();