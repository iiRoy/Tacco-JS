const PARTITION_MODULUS = 998244353n; // Modulus for calculations, using BigInt
let itemCountTracker; // Renamed N to itemCountTracker
let grandTotalSum = 0n; // Renamed sum to grandTotalSum, using BigInt
let elementCollection = []; // Renamed a to elementCollection

// Cache for dynamic programming results
// Key: string representation of (current_index, current_sum_group_A, current_sum_group_B)
// Value: BigInt, the number of ways
const dpCache = new Map();

// Generates a unique string key for the DP state
function generateStateKey(processIndex, sumA, sumB) {
    return `${processIndex}_${sumA}_${sumB}`;
}

// Recursive function to calculate valid triangle partitions
function computeTriangleWays(processIndex, currentSumA, currentSumB) {
    // Check if this state has already been computed
    const currentStateKey = generateStateKey(processIndex, currentSumA, currentSumB);
    if (dpCache.has(currentStateKey)) {
        return dpCache.get(currentStateKey);
    }

    // Base case: All elements have been assigned to a group
    if (processIndex === itemCountTracker) {
        const currentSumC = grandTotalSum - currentSumA - currentSumB;

        // Ensure all three groups are non-empty (sum > 0)
        if (currentSumA === 0n || currentSumB === 0n || currentSumC === 0n) {
            return 0n; // Invalid partition: degenerate (empty) group
        }

        // Check the triangle inequality: sum of any two sides must be greater than the third
        const isTriangleValid =
            (currentSumA + currentSumB > currentSumC) &&
            (currentSumB + currentSumC > currentSumA) &&
            (currentSumC + currentSumA > currentSumB);

        if (isTriangleValid) {
            return 1n; // Valid triangle partition found
        } else {
            return 0n; // Not a valid triangle
        }
    }

    // Recursive step: Try assigning the current element to one of the three groups
    let accumulatedWays = 0n;
    const currentElementVal = BigInt(elementCollection[processIndex]);

    // Option 1: Assign current element to Group A
    accumulatedWays = (accumulatedWays + computeTriangleWays(
        processIndex + 1,
        currentSumA + currentElementVal,
        currentSumB
    )) % PARTITION_MODULUS;

    // Option 2: Assign current element to Group B
    accumulatedWays = (accumulatedWays + computeTriangleWays(
        processIndex + 1,
        currentSumA,
        currentSumB + currentElementVal
    )) % PARTITION_MODULUS;

    // Option 3: Assign current element to Group C (implicitly, by not adding to A or B)
    accumulatedWays = (accumulatedWays + computeTriangleWays(
        processIndex + 1,
        currentSumA,
        currentSumB
    )) % PARTITION_MODULUS;

    // Store the computed result in the cache before returning
    dpCache.set(currentStateKey, accumulatedWays);
    return accumulatedWays;
}

// Main function to orchestrate the problem solving
function runPartitionSolver() {
    // --- Input Simulation / Handling ---
    // In a real competitive programming environment,
    // this would typically involve `process.stdin.readline()` or similar.
    // For this clone, we simulate input lines.
    let simulatedInputLines = [
        "4",       // Example: N = 4
        "2 3 4 5"  // Example elements
    ];
    let currentLineIdx = 0;
    const readNextLine = () => simulatedInputLines[currentLineIdx++];

    // Read the number of elements
    itemCountTracker = parseInt(readNextLine());

    // Read the elements and parse them
    const elementsString = readNextLine();
    elementCollection = elementsString.split(' ').map(Number);

    // --- Input Validation (Type III Addition) ---
    // Basic checks to ensure input integrity
    if (isNaN(itemCountTracker) || itemCountTracker <= 0 || elementCollection.length !== itemCountTracker) {
        console.error("Input error: The declared number of elements does not match the provided list.");
        return; // Exit if input is malformed
    }

    // Calculate the total sum of all elements
    grandTotalSum = elementCollection.reduce((acc, val) => acc + BigInt(val), 0n);

    // The original C++ code sorted the array `a`.
    // As a Type III modification, this sorting step is removed,
    // as the DP approach correctly explores all partitions regardless of input order.
    // elementCollection.sort((a, b) => a - b); // This line is removed for Type III clone

    // Start the recursive DP process from the first element (index 0)
    // with initial sums of 0 for Group A and Group B.
    const finalResult = computeTriangleWays(0, 0n, 0n);

    // Output the final count of valid triangle partitions
    console.log(finalResult.toString());
}

// Execute the solver function
runPartitionSolver();