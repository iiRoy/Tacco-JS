// --- Global Context Variables (mimicking the original's implicit closure for data sharing) ---
// This array will hold the numeric sequence for the current test case.
// Renamed from 'ary'.
let dataSequence = [];

// This variable stores the maximum number of allowed partitions (segments).
// Renamed from 'm'.
let globalMaxDivisions = 0;

// --- Helper function to evaluate if a given maximum sum per segment is achievable ---
// Renamed from 'seach' and its parameter 'x'.
// This function checks if 'dataSequence' can be divided into 'globalMaxDivisions'
// or fewer segments, such that no single segment's sum exceeds 'potentialMaxSum'.
function evaluatePartitionLimit(potentialMaxSum) {
    let currentSegmentAccumulator = 0; // Renamed from 'sum'
    let requiredSegmentCount = 0;      // Renamed from 'cnt'

    // Iterate through each numeric item in our sequence to form segments.
    // Renamed 'i' to 'currentItemIndex' and 'ary[i]' to 'currentDataItem'.
    for (let currentItemIndex = 0; currentItemIndex < dataSequence.length; currentItemIndex++) {
        const currentDataItem = dataSequence[currentItemIndex];

        // Guard clause: If any single data item itself is larger than the potential maximum sum,
        // then this 'potentialMaxSum' is definitely not feasible, as that item cannot fit.
        if (potentialMaxSum < currentDataItem) {
            return false; // Not possible to form segments with this limit.
        }

        // Decision logic for how to form segments based on 'potentialMaxSum'.
        if (currentSegmentAccumulator + currentDataItem === potentialMaxSum) {
            // Case 1: The current item exactly fills up the current segment.
            // Reset the accumulator for a new segment.
            currentSegmentAccumulator = 0;
            // Increment the segment count, but with a specific condition:
            // The original logic does not count the very last segment if it exactly fills up.
            // This maintains the exact behavior of the original 'cnt' variable.
            if (currentItemIndex !== dataSequence.length - 1) {
                requiredSegmentCount++;
            }
        } else if (currentSegmentAccumulator + currentDataItem > potentialMaxSum) {
            // Case 2: The current item would make the current segment exceed the limit.
            // This means we must start a new segment with the current item.
            requiredSegmentCount++; // A new partition is explicitly started.
            currentSegmentAccumulator = currentDataItem;
        } else { // currentSegmentAccumulator + currentDataItem < potentialMaxSum
            // Case 3: The current item fits within the current segment's limit.
            // Continue accumulating values in the current segment.
            currentSegmentAccumulator += currentDataItem;
        }

        // Early exit check: If we've already reached or exceeded the maximum allowed number of divisions (segments)
        // given the 'potentialMaxSum', then this sum is too restrictive.
        // Renamed 'm' to 'globalMaxDivisions'.
        if (requiredSegmentCount >= globalMaxDivisions) {
            return false; // Too many segments required, this limit is too small.
        }
    }

    // If the loop completes without returning 'false', it means the 'potentialMaxSum' is feasible.
    // The final segment (if any accumulated value remains) is implicitly handled by the
    // 'requiredSegmentCount >= globalMaxDivisions' check never being triggered prematurely.
    return true;
}

// --- Main execution block for processing input and performing the binary search ---
// Added a constant for the input file path for clarity (Type III addition).
const INPUT_FILE_PATH = '/dev/stdin';

// Read raw input data from the specified file synchronously.
// This matches the original's input method.
const rawInputData = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
// Renamed 'arr' to 'processedInputLines'.
let processedInputLines = rawInputData.trim().split("\n");

// Main loop to process multiple test cases from the input.
while (true) {
    // Extract the configuration line (max_partitions, num_elements) for the current test case.
    // Renamed 'mn' to 'currentConfigLine'.
    let currentConfigLine = processedInputLines.shift();

    // Termination condition: "0 0" indicates the end of input.
    // Added a check for 'undefined' in case of malformed or empty input (Type III addition).
    if (!currentConfigLine || currentConfigLine === "0 0") {
        break; // Exit the main processing loop.
    }

    // Parse the configuration values from the current line.
    // Renamed 'mn' parts and used 'parseInt' explicitly for clarity (Type III update).
    const parsedConfigValues = currentConfigLine.split(" ").map(valStr => parseInt(valStr.trim(), 10));

    // Assign parsed values to global configuration variables and local counters.
    globalMaxDivisions = parsedConfigValues[0]; // Renamed from 'm'.
    let numberOfElements = parsedConfigValues[1]; // Renamed from 'n'.

    // Basic validation for configuration values (Type III addition).
    // Ensures 'm' is positive and 'n' is non-negative.
    if (isNaN(globalMaxDivisions) || isNaN(numberOfElements) || globalMaxDivisions <= 0 || numberOfElements < 0) {
        // In a real application, one might log an error here.
        // For this clone, we simply skip to the next test case.
        continue;
    }

    // Initialize the data sequence array for the current test case.
    dataSequence = []; // Reset 'dataSequence' for each new test case.

    // Populate the 'dataSequence' array from subsequent input lines.
    // Rewritten the 'while(n--)' loop to a standard 'for' loop (Type III update).
    for (let i = 0; i < numberOfElements; i++) {
        // Use Number() for explicit type conversion, similar to original 'arr.shift()-0'.
        // This assumes valid numeric input for each element.
        dataSequence.push(Number(processedInputLines.shift()));
    }

    // --- Binary Search to find the minimum feasible maximum segment sum ---
    // Renamed 'L', 'R', 'middle' to more descriptive variable names.
    let lowerBoundCandidate = 0;
    let upperBoundCandidate = 0;

    // Calculate initial range for the binary search dynamically (Type III update).
    // The smallest possible maximum segment sum is the largest single element in the sequence.
    // The largest possible maximum segment sum is the sum of all elements (i.e., one segment).
    if (dataSequence.length > 0) {
        lowerBoundCandidate = Math.max(...dataSequence);
        upperBoundCandidate = dataSequence.reduce((acc, val) => acc + val, 0);
    } else {
        // Handle the edge case of an empty data sequence (Type III addition).
        // If there are no elements, the optimal max segment sum is 0.
        console.log(0);
        continue; // Proceed to the next test case.
    }

    // This variable will store the lowest feasible maximum sum found by the binary search.
    // It's initialized with the largest possible value, which will be refined downwards.
    let optimalMaxSegmentSum = upperBoundCandidate;

    // Standard binary search loop: continues as long as the search space is valid.
    // Rewritten from 'while(true)' with an internal break to a more explicit condition.
    while (lowerBoundCandidate <= upperBoundCandidate) {
        // Calculate the midpoint. Using Math.trunc for integer division, same effect as Math.floor for positive numbers.
        const currentTestMidpoint = Math.trunc((lowerBoundCandidate + upperBoundCandidate) / 2);

        // Call our helper function to check if this 'currentTestMidpoint' is a feasible limit.
        const canPartitionWithThisLimit = evaluatePartitionLimit(currentTestMidpoint);

        if (canPartitionWithThisLimit) {
            // If it's feasible, this midpoint is a potential answer.
            // We store it and try to find an even smaller limit in the left half.
            optimalMaxSegmentSum = currentTestMidpoint;
            upperBoundCandidate = currentTestMidpoint - 1;
        } else {
            // If it's not feasible, the 'currentTestMidpoint' is too small.
            // We need a larger limit, so we search in the right half.
            lowerBoundCandidate = currentTestMidpoint + 1;
        }
    }

    // Output the final optimal maximum segment sum for the current test case.
    // The binary search pattern used (finding the first 'true' value for 'evaluatePartitionLimit')
    // results in 'optimalMaxSegmentSum' holding the smallest value for which the function returned true.
    // This directly matches the result of the original code's 'R+1' output.
    console.log(optimalMaxSegmentSum);
}