// This file contains a JavaScript implementation to solve a combinatorial problem
// involving partitioning a set of numbers to form a triangle, using dynamic programming.

// Mock input for demonstration purposes. In a real environment, this would come from stdin.
// Example: N = 4, a = [2, 3, 4, 5]
const inputLines = [
    "4",
    "2 3 4 5"
];

// Global variables to store problem parameters and results.
let elementCount; // Represents 'N' in the original problem, the total number of items.
let totalValue;   // Represents 'sum' in the original problem, the sum of all item values.
let dataset;      // Represents 'a' in the original problem, the array of item values.

// A large prime number used for modulo operations to prevent integer overflow
// and to keep results within a specific range, common in combinatorics.
const PRIME_MODULUS = 998244353n; // Using BigInt for modulo operations

// A cache (memoization table) to store results of subproblems.
// Keys are string representations of the state (current index, sum of segment 1, sum of segment 2).
// Values are the computed number of valid partitions for that state, as BigInts.
const resultCache = new Map();


/*
 * This recursive function counts the number of ways to divide the 'dataset'
 * elements into three groups (segments) such that their sums can form a valid triangle.
 * It employs a top-down dynamic programming approach with memoization.
 *
 * @param {number} currentElementIndex - The index of the element currently being considered.
 * @param {number} segmentOneSum - The current sum of elements assigned to the first segment.
 * @param {number} segmentTwoSum - The current sum of elements assigned to the second segment.
 * @returns {BigInt} The count of valid triangle partitions from this state, modulo PRIME_MODULUS.
 */
const findValidTrianglePartitions = (currentElementIndex, segmentOneSum, segmentTwoSum) => {
    // The base condition: all elements from the dataset have been processed.
    if (currentElementIndex === elementCount) {
        // Calculate the sum of the third segment by subtracting the sums of the first two
        // from the total sum of all elements.
        const segmentThreeSum = totalValue - segmentOneSum - segmentTwoSum;

        // Check for degenerate triangles or invalid side lengths.
        // If any segment has a sum of zero, it cannot form a triangle.
        if (segmentOneSum === 0 || segmentTwoSum === 0 || segmentThreeSum === 0) {
            return 0n; // No valid triangle can be formed.
        }

        // Apply the Triangle Inequality Theorem:
        // The sum of the lengths of any two sides must be strictly greater than the third side.
        if (segmentOneSum + segmentTwoSum > segmentThreeSum &&
            segmentTwoSum + segmentThreeSum > segmentOneSum &&
            segmentThreeSum + segmentOneSum > segmentTwoSum) {
            return 1n; // A valid triangle can be formed from these side lengths.
        } else {
            return 0n; // The side lengths do not satisfy the triangle inequality.
        }
    }

    // Construct a unique string key for the current state (tuple of parameters)
    // to lookup or store results in the memoization cache.
    const currentStateKey = `${currentElementIndex},${segmentOneSum},${segmentTwoSum}`;

    // If the result for this specific state has already been computed and cached,
    // return it immediately to avoid redundant calculations.
    if (resultCache.has(currentStateKey)) {
        return resultCache.get(currentStateKey);
    }

    // Explore the three possible choices for the current element (dataset[currentElementIndex]):
    // 1. Assign it to the first segment.
    // 2. Assign it to the second segment.
    // 3. Assign it to the third segment (implicitly, by not assigning it to the first two).

    // Choice 1: Add the current element's value to 'segmentOneSum'.
    let currentResult = findValidTrianglePartitions(
        currentElementIndex + 1,
        segmentOneSum + dataset[currentElementIndex],
        segmentTwoSum
    ) % PRIME_MODULUS;

    // Choice 2: Add the current element's value to 'segmentTwoSum'.
    currentResult = (currentResult + findValidTrianglePartitions(
        currentElementIndex + 1,
        segmentOneSum,
        segmentTwoSum + dataset[currentElementIndex]
    )) % PRIME_MODULUS;

    // Choice 3: The current element's value is implicitly added to 'segmentThreeSum'.
    // This is modeled by not changing 'segmentOneSum' or 'segmentTwoSum'.
    currentResult = (currentResult + findValidTrianglePartitions(
        currentElementIndex + 1,
        segmentOneSum,
        segmentTwoSum
    )) % PRIME_MODULUS;

    // Store the calculated result for the current state in the cache
    // before returning it, so it can be reused if this state is encountered again.
    resultCache.set(currentStateKey, currentResult);

    return currentResult;
};


/*
 * This function handles the overall flow of the program:
 * reading input, preparing the data, and initiating the primary computation.
 *
 * @returns {BigInt} The final count of valid triangle partitions, modulo PRIME_MODULUS.
 */
const orchestrateSolution = () => {
    // Read the total number of elements from the mock input.
    elementCount = parseInt(inputLines.shift());

    // Read the space-separated element values, convert them to numbers, and store them.
    dataset = inputLines.shift().split(' ').map(Number);

    // Calculate the grand total of all element values.
    totalValue = 0;
    for (let loopIndex = 0; loopIndex < elementCount; ++loopIndex) {
        totalValue += dataset[loopIndex];
    }

    // Sort the dataset in ascending order. This is often done in DP problems
    // to ensure a consistent state or to optimize certain conditions,
    // and it mirrors the original C++ implementation.
    dataset.sort((valA, valB) => valA - valB);

    // Begin the recursive calculation starting from the first element (index 0),
    // with both segment sums initially set to zero.
    // The result will be a BigInt.
    return findValidTrianglePartitions(0, 0, 0);
};


// The main execution block of the script.
// This is where the program starts.
// It calls the orchestrator function and prints its result.
// It also simulates optimized I/O by not using standard Node.js readline directly,
// as the input is pre-defined for this example.
const mainExecution = () => {
    // No specific I/O optimization for JavaScript in a browser or simple Node.js script
    // like `ios::sync_with_stdio(false); cin.tie(0);` in C++.
    // The `inputLines` array serves as a stand-in for fast input.

    const finalAnswer = orchestrateSolution();

    // Output the final computed result to the console.
    console.log(finalAnswer.toString()); // Convert BigInt to string for console output.
};

// Execute the main function to start the program.
mainExecution();