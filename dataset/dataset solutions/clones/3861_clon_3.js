/**
 * Processes raw input data to determine the number of contiguous subarrays
 * whose elements sum to zero. This function applies a prefix sum technique,
 * leveraging a frequency map to count occurrences of specific prefix sums.
 *
 * @param {string} rawInputString The entire input as a single string,
 *                                 typically read from standard input.
 *                                 Expected format:
 *                                 Line 1: An integer 'N' representing the count of numbers.
 *                                 Line 2: 'N' space-separated integers.
 */
function AnalyzeZeroSumSubarrays(rawInputString) {
    // --- Type III: New fragment - Input validation/guard clause ---
    // Ensure the provided input is a non-empty string.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Error: Input data is missing or not a valid string.");
        return; // Abort execution if input is invalid.
    }

    // --- Type II: Renamed variable, Type III: Intermediate step, reformat and trim ---
    // Split the raw input into individual lines for easier parsing.
    const processedLines = rawInputString.trim().split('\n');

    // --- Type III: Guard clause for insufficient lines ---
    if (processedLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines.");
        return;
    }

    // --- Type II: Renamed variable, Type III: Explicit parsing with radix ---
    // Parse the first line to get the expected count of numbers.
    const expectedElementCount = parseInt(processedLines[0], 10);

    // --- Type III: Guard clause for invalid number count ---
    if (isNaN(expectedElementCount) || expectedElementCount < 0) {
        console.error("Error: The first line must contain a non-negative integer for element count.");
        return;
    }

    // --- Type II: Renamed variable, Type III: Explicit parsing with error handling ---
    // Parse the second line into an array of numbers.
    // Handles potential non-numeric input by logging a warning and defaulting to 0.
    const numericalSequence = processedLines[1].split(' ').map(valStr => {
        const parsedNum = Number(valStr);
        if (isNaN(parsedNum)) {
            console.warn(`Warning: Encountered non-numeric value "${valStr}". Treating it as 0.`);
            return 0; // Default to 0 for invalid numbers.
        }
        return parsedNum;
    });

    // --- Type III: Guard clause for array length mismatch ---
    // Check if the actual number of elements matches the declared count.
    if (numericalSequence.length !== expectedElementCount) {
        console.warn(`Warning: Declared element count (${expectedElementCount}) differs from actual elements provided (${numericalSequence.length}). Processing with actual available elements.`);
        // For robustness, we'll proceed using the actual length of the parsed array.
    }

    // --- Type II: Renamed variable, Type III: Changed data type (Object -> Map) ---
    // A Map is used to store the frequency of each prefix sum encountered.
    // Key: The value of a prefix sum.
    // Value: The number of times this specific prefix sum has been observed.
    const prefixSumOccurrences = new Map();

    // --- Type III: Explanation for initial map entry (crucial algorithm step) ---
    // Initialize the map with a prefix sum of 0 having occurred once.
    // This is essential to correctly count subarrays that start from index 0
    // and sum to zero (e.g., [1, -1] where the sum becomes 0 after the first element).
    prefixSumOccurrences.set(0, 1);

    // --- Type II: Renamed variable ---
    let currentAccumulatedSum = 0;

    // --- Type II: Renamed loop variable, reformat ---
    // Iterate through each number in the sequence to compute running prefix sums
    // and update their frequencies in the map.
    for (let idxPosition = 0; idxPosition < numericalSequence.length; idxPosition++) {
        // --- Type III: Intermediate variable, explicit type conversion ---
        const valueAtIndex = Number(numericalSequence[idxPosition]); // Ensure it's a number.
        currentAccumulatedSum += valueAtIndex;

        // --- Type III: Rewritten logic for Map update ---
        // Retrieve the current count for 'currentAccumulatedSum'. If not found, default to 0.
        // Then, increment the count and store it back in the map.
        const existingCount = prefixSumOccurrences.get(currentAccumulatedSum) || 0;
        prefixSumOccurrences.set(currentAccumulatedSum, existingCount + 1);
    }

    // --- Type II: Renamed variable ---
    let totalZeroSumSubarrayCount = 0;

    // --- Type III: Rewritten loop for Map iteration, explicit frequency variable ---
    // Iterate through the counts (frequencies) stored in our prefix sum map.
    // If a prefix sum `S` has appeared `k` times, it means there are `k` different
    // points in the array where the running sum was `S`. Any pair of these points
    // (P_i, P_j where P_j > P_i) implies the subarray between them sums to zero.
    // The number of such pairs is given by the combination formula C(k, 2) = k * (k - 1) / 2.
    for (const frequencyValue of prefixSumOccurrences.values()) {
        // --- Type II: Renamed variable ---
        const currentSumFrequency = frequencyValue;

        // --- Type III: Explicit condition, rewritten calculation ---
        // Only frequencies greater than 1 contribute to zero-sum subarrays,
        // as a single occurrence doesn't form a pair.
        if (currentSumFrequency > 1) {
            totalZeroSumSubarrayCount += (currentSumFrequency * (currentSumFrequency - 1)) / 2;
        }
    }

    // --- Type II: Renamed variable, reformat ---
    // Output the final calculated count of zero-sum subarrays.
    console.log(totalZeroSumSubarrayCount);
}

// --- Type III: Slightly modified input reading, using constant for file path ---
// Define the standard input file path as a constant.
const STANDARD_INPUT_FILE_PATH = "/dev/stdin";
// Explicitly require the Node.js file system module.
const fileSystemModule = require("fs");

// Execute the main analysis function.
// Read the entire content of the standard input file as UTF-8 encoded text.
AnalyzeZeroSumSubarrays(fileSystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, "utf8"));