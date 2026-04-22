/**
 * Processes raw input data to find a specific sequence of unique elements.
 * This function simulates a process with variable jumps and then extracts
 * a filtered subsequence based on element uniqueness criteria.
 * @param {string} rawInputString The entire input as a single string.
 */
function ProcessInputData(rawInputString) {
    // Helper function to safely parse an integer value from a string.
    // If parsing fails, it returns a specified default value.
    const parseNumericValue = (strValue, defaultValue = 0) => {
        const parsedInteger = parseInt(strValue, 10);
        return isNaN(parsedInteger) ? defaultValue : parsedInteger;
    };

    // Split the entire input string into an array of individual lines.
    const inputLines = rawInputString.split("\n");

    // --- Input Validation ---
    // Ensure that the input contains at least two lines as expected for this problem.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        return; // Terminate execution if input is malformed.
    }

    // Parse the first line which contains two space-separated numeric parameters.
    const firstLineSegments = inputLines[0].split(" ");
    if (firstLineSegments.length < 2) {
        console.error("Error: First line must contain at least two space-separated numeric values (N and K).");
        return;
    }

    // Extract the primary parameters: the count of elements and the total number of cycles.
    const countElements = parseNumericValue(firstLineSegments[0]); // Corresponds to original 'N'
    const totalCycles = parseNumericValue(firstLineSegments[1]);   // Corresponds to original 'K'

    // Further validation for the parsed parameters to ensure they are positive.
    if (countElements <= 0 || totalCycles <= 0) {
        console.error("Error: 'countElements' and 'totalCycles' must be positive integers.");
        return;
    }

    // Parse the second line, which contains the sequence of data items as strings.
    const dataItemsArray = inputLines[1].split(" "); // Corresponds to original 'As'

    // Initialize an array to store the calculated jump distances for each element.
    // This array will dictate how many steps to advance in our simulation.
    let nextOccurrenceDistances = new Array(countElements); // Corresponds to original 'ys'

    // Create an extended version of the data sequence by concatenating it with itself.
    // This simplifies the logic for finding the 'next' occurrence of an element
    // within a circular context, as we don't need explicit modulo arithmetic for the search.
    const extendedDataSequence = dataItemsArray.concat(dataItemsArray); // Corresponds to original 'AA'

    // --- Phase 1: Calculate Jump Distances for Each Element ---
    // For every element in the original 'dataItemsArray', determine how far ahead its next
    // identical occurrence is located within the 'extendedDataSequence'.
    for (let currentElementIndex = 0; currentElementIndex < countElements; currentElementIndex++) {
        const targetValueForSearch = dataItemsArray[currentElementIndex];

        // Create a temporary slice of the 'extendedDataSequence' starting from the element
        // immediately following the current element.
        const searchScopeSegment = extendedDataSequence.slice(currentElementIndex + 1);
        
        // Find the 0-based index of the 'targetValueForSearch' within this 'searchScopeSegment'.
        // Add 1 to this index to get a 1-based distance representing the actual number of steps.
        const calculatedDistance = searchScopeSegment.indexOf(targetValueForSearch) + 1;
        
        // Store this calculated distance in our 'nextOccurrenceDistances' array.
        nextOccurrenceDistances[currentElementIndex] = calculatedDistance;
    }

    // --- Phase 2: Simulate Progress to Determine the Effective Starting Point ---
    // We simulate a process that makes variable jumps, determined by 'nextOccurrenceDistances'.
    // 'cumulativeProgress' tracks the total steps taken.
    // 'lastStablePosition' stores the 'cumulativeProgress' value just before it exceeds the total limit.
    let cumulativeProgress = 0;   // Corresponds to original 'a'
    let lastStablePosition = 0; // Corresponds to original 'b'

    // The simulation continues until the 'cumulativeProgress' reaches or exceeds the total target.
    // The target is 'countElements * totalCycles', representing the total logical steps.
    while (cumulativeProgress < countElements * totalCycles) {
        // Before updating 'cumulativeProgress', store its current value in 'lastStablePosition'.
        // This ensures 'lastStablePosition' holds the last valid position within the bounds.
        lastStablePosition = cumulativeProgress;

        // Determine which jump distance to use by cycling through 'nextOccurrenceDistances'.
        const currentJumpIndex = cumulativeProgress % countElements;
        
        // The actual jump magnitude includes the pre-calculated distance plus 1 (to account for the current element).
        const currentJumpMagnitude = nextOccurrenceDistances[currentJumpIndex] + 1;
        
        // Update the total 'cumulativeProgress'.
        cumulativeProgress += currentJumpMagnitude;
    }

    // --- Phase 3: Extract the Relevant Segment for Final Processing ---
    // The effective starting index for our final output sequence is derived from 'lastStablePosition',
    // wrapped around the 'countElements' to stay within the bounds of the original array.
    const effectiveStartingIndex = lastStablePosition % countElements; // Corresponds to original 'id'

    // Create the segment of data items that will be processed for the final output.
    // This is a slice of the original 'dataItemsArray' starting from 'effectiveStartingIndex'.
    const finalProcessingSegment = dataItemsArray.slice(effectiveStartingIndex); // Corresponds to original 'p'

    // Initialize an array to store the elements selected for the final output.
    const uniqueElementsOutput = []; // Corresponds to original 'result'

    // --- Phase 4: Deduplicate and Filter the Final Segment ---
    // This loop iterates through the 'finalProcessingSegment' to build 'uniqueElementsOutput'.
    // The rule is: an element is added if it is the *last* occurrence of its value in the
    // *remaining* part of the segment. If it's not the last, the loop skips past its next occurrence.
    let segmentTraversalPointer = 0; // Corresponds to original 'i'
    while (segmentTraversalPointer < finalProcessingSegment.length) {
        const currentSegmentValue = finalProcessingSegment[segmentTraversalPointer];
        
        // Create a sub-slice of the segment starting from the element *after* the current one.
        const subsequentSegmentSlice = finalProcessingSegment.slice(segmentTraversalPointer + 1);
        
        // Search for the 'currentSegmentValue' within this 'subsequentSegmentSlice'.
        const nextOccurrenceRelativeIndex = subsequentSegmentSlice.indexOf(currentSegmentValue);

        if (nextOccurrenceRelativeIndex === -1) {
            // If 'nextOccurrenceRelativeIndex' is -1, it means 'currentSegmentValue' does not
            // appear again in the 'subsequentSegmentSlice'. Therefore, it is the last occurrence.
            uniqueElementsOutput.push(currentSegmentValue);
            segmentTraversalPointer++; // Move to the very next element in the segment.
        } else {
            // If 'currentSegmentValue' *does* appear again, we need to skip ahead.
            // The jump amount is calculated as:
            // 'nextOccurrenceRelativeIndex' (index within 'subsequentSegmentSlice')
            // + 1 (to account for the 'segmentTraversalPointer's current position relative to the slice start)
            // + 1 (to skip *past* the found next occurrence itself).
            // This effectively moves the pointer to the element immediately after the next duplicate.
            segmentTraversalPointer += nextOccurrenceRelativeIndex + 2;
        }
    }

    // Output the final collection of unique elements, joined by spaces.
    console.log(uniqueElementsOutput.join(" "));
}

// The main entry point for the script: reads input from standard input (stdin)
// and then passes it to our processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));