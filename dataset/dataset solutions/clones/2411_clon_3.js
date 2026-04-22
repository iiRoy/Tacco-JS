// This function processes a raw string input to find the minimum absolute difference
// between the sums of two partitions of a sequence of numbers.
function ProcessInputData(sourceString) {
    // Break down the entire input string into an array of lines, based on newline characters.
    const textSegments = sourceString.split("\n");

    // The first line contains the count of elements. Parse it as an integer.
    // Using parseInt with radix 10 ensures explicit base conversion.
    const totalItems = parseInt(textSegments[0], 10);

    // Guard clause: If there are fewer than 2 elements, no meaningful split can be made
    // as per the problem's loop structure (which iterates `totalItems - 1` times for splits).
    // The original code's `Math.min(...[])` on an empty array results in `Infinity`.
    // We explicitly return `Infinity` to maintain this functional behavior for edge cases.
    if (totalItems < 2) {
        return Infinity;
    }

    // The second line contains space-separated numbers. Parse them into a numeric array.
    // This uses a more explicit loop for parsing as a Type III structural change.
    const dataElements = [];
    const rawNumberStrings = textSegments[1].split(" ");
    for (let currentRawString of rawNumberStrings) {
        // Ensure that empty strings (which can result from multiple spaces) are skipped.
        if (currentRawString.trim() !== '') {
            dataElements.push(Number(currentRawString));
        }
    }

    // Initialize an array to store prefix sums (running totals).
    // The first element is always 0, representing the sum before any elements.
    const runningTotals = [0];
    let currentAccumulation = 0; // Helper variable for sum calculation.

    // Calculate prefix sums using a traditional for-of loop.
    // This replaces the original `reduce` method for a Type III rewrite.
    for (let itemValue of dataElements) {
        currentAccumulation += itemValue;
        runningTotals.push(currentAccumulation);
    }

    // The total sum of all elements is the last element in the `runningTotals` array.
    // Storing it in a dedicated variable `grandTotalSum` is a Type III intermediate step.
    const grandTotalSum = runningTotals[totalItems];

    // This array will hold the absolute differences for each possible partition.
    const partitionDeltas = [];

    // Iterate through all possible split points.
    // The variable `splitPoint` represents the number of elements in the left partition.
    // `splitPoint` ranges from 0 (empty left partition) to `totalItems - 1` (left partition contains all but the last element).
    // The loop iterates `totalItems - 1` times, meaning `splitPoint` goes from `0` to `totalItems - 2`.
    // This matches the original loop's behavior where `i` goes from `0` to `n-2`.
    for (let splitPoint = 0; splitPoint < totalItems - 1; splitPoint++) {
        // Calculate the sum of the left partition.
        // `runningTotals[splitPoint]` gives the sum of the first `splitPoint` elements.
        const currentLeftPartitionSum = runningTotals[splitPoint + 1];

        // Calculate the sum of the right partition.
        // This is `total sum - left partition sum`.
        const currentRightPartitionSum = grandTotalSum - currentLeftPartitionSum;

        // Calculate the absolute difference between the two partition sums.
        // This explicitly uses intermediate variables for clarity (Type III addition).
        const currentDelta = Math.abs(currentLeftPartitionSum - currentRightPartitionSum);

        // Store this difference.
        partitionDeltas.push(currentDelta);
    }

    // Find the minimum absolute difference among all calculated possibilities.
    // This uses a traditional loop for finding the minimum, replacing `Math.min(...array)`
    // for a Type III structural change.
    let minimumDeltaFound = Infinity; // Initialize with a very large value.
    for (const deltaValue of partitionDeltas) {
        if (deltaValue < minimumDeltaFound) {
            minimumDeltaFound = deltaValue;
        }
    }

    // Output the final computed minimum difference to the console.
    console.log(minimumDeltaFound);
}

// Define helper variables for file system operations to enhance readability and for Type III changes.
const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin";
const inputEncoding = "utf8";

// Read the entire content of the standard input file synchronously using the helper variables.
// Then, invoke the main processing function with the obtained string data.
ProcessInputData(fileSystemHandler.readFileSync(standardInputPath, inputEncoding));