const fileSystemAccessor = require('fs'); // Renamed module import for file system operations.
const standardInputPath = '/dev/stdin'; // Explicitly named constant for the standard input file path.
const characterEncoding = 'utf8'; // Named constant for the character encoding.

// Define the target numerical value for comparison.
const comparisonTargetValue = 753; // Renamed and made into a constant for clarity.

// Read the entire content from standard input using the specified encoding.
const rawInputContent = fileSystemAccessor.readFileSync(standardInputPath, characterEncoding); // Renamed variable.

// Ensure the input is treated as a string for subsequent operations.
const processingStringData = String(rawInputContent); // Explicit type conversion for robustness.

// A collection to store all computed absolute differences.
const calculatedDifferences = []; // Type III: Introduced an explicit array to hold intermediate results.

// Determine the maximum starting index for extracting 3-character substrings.
// We need at least 3 characters from the current index onwards.
const maximumExtractionIndex = processingStringData.length - 2; // Renamed loop boundary.

// Type III: Add a preliminary check for insufficient input length.
// If the string is too short, no 3-character segments can be formed.
if (maximumExtractionIndex < 1) {
    // In such a scenario, we can define a default or error output.
    // For this problem, let's output 0, implying no meaningful difference could be calculated.
    process.stdout.write('0');
    process.exit(0); // Terminate execution gracefully.
}

// Iterate through the input string to extract and process all possible 3-character numeric sequences.
// Type III: Replaced the `Array().map()` construct with a traditional `for` loop for iteration.
for (let currentPositionIndex = 0; currentPositionIndex < maximumExtractionIndex; currentPositionIndex++) {
    // Extract a 3-character segment starting from the current index.
    const currentSegmentString = processingStringData.substring(currentPositionIndex, currentPositionIndex + 3); // Renamed and used `substring`.

    // Convert the extracted string segment into an integer.
    // Type II: Replaced bitwise OR `|0` with `parseInt(..., 10)` for explicit base conversion.
    const segmentNumericValue = parseInt(currentSegmentString, 10);

    // Type III: Add a guard clause to handle cases where the segment is not a valid number.
    if (isNaN(segmentNumericValue)) {
        // If conversion results in NaN, skip this segment and proceed to the next one.
        // This prevents errors in `Math.abs` later and ensures only valid numbers are processed.
        continue;
    }

    // Calculate the absolute difference between the segment's numeric value and the target.
    const differenceFromTarget = Math.abs(comparisonTargetValue - segmentNumericValue); // Renamed for clarity.

    // Add this calculated difference to our collection.
    calculatedDifferences.push(differenceFromTarget);
}

// Type III: Handle the scenario where no valid numeric segments were found and processed.
if (calculatedDifferences.length === 0) {
    // If the collection is empty, it means no valid comparisons were made.
    // We can output a default value, e.g., the absolute difference of the target from 0.
    process.stdout.write(String(Math.abs(comparisonTargetValue - 0)));
    process.exit(0);
}

// Type III: Replaced `Math.min.apply` or spread operator with an explicit loop to find the minimum.
let minimumObtainedDifference = Infinity; // Initialize with a very large number.

// Iterate through the collected differences to find the smallest one.
for (let k = 0; k < calculatedDifferences.length; k++) {
    const currentDifferenceInLoop = calculatedDifferences[k];
    if (currentDifferenceInLoop < minimumObtainedDifference) {
        minimumObtainedDifference = currentDifferenceInLoop; // Update if a smaller value is found.
    }
}

// Output the final minimum absolute difference found.
// Type III: Explicitly use `process.stdout.write` for output.
process.stdout.write(String(minimumObtainedDifference));