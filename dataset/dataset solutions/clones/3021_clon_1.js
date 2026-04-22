const MOD = 998244353; // A constant representing the modulo value, used for arithmetic operations to keep results within a specific range.

let N;    // This variable will store the total number of elements that are to be processed.
let sum;  // This variable will accumulate the total sum of all elements in the array 'a'.
let a = []; // This array, 'a', will hold the input integer values, analogous to `std::vector<int>` in C++.

let memo = new Map(); // A Map object used for memoization, caching results of the recursive function.
                      // Its keys will be string representations of states (tuples), and values will be computed results.

/**
 * The core recursive function that calculates the number of ways to partition elements
 * from array 'a' into three groups (R, G, B) such that they can form a valid triangle.
 *
 * @param {number} idx - The current index in the array 'a' that is being considered.
 *                       It ranges from 0 to N-1.
 * @param {number} R   - The accumulated sum of elements assigned to the 'R' group so far.
 * @param {number} G   - The accumulated sum of elements assigned to the 'G' group so far.
 * @returns {number} The count of valid triangle combinations found from this state, modulo MOD.
 */
function Rec(idx, R, G) {
    // Base Case: When all elements in the array 'a' have been processed.
    if (idx === N) {

        // Calculate the sum for the third group, 'B', by subtracting R and G sums from the total sum.
        let B = sum - R - G;

        // Check for an invalid triangle condition: if any side has a sum of zero.
        // A triangle cannot be formed if any of its sides has a length of zero.
        if (R === 0 || G === 0 || B === 0) {
            return 0; // Return 0 as no valid triangle can be formed under this condition.
        }

        // Apply the Triangle Inequality Theorem: The sum of the lengths of any two sides
        // of a triangle must be strictly greater than the length of the third side.
        if (R + G > B && G + B > R && B + R > G) {
            return 1; // If all conditions are met, a valid triangle can be formed, so return 1.
        }

        else {
            return 0; // Otherwise, the current combination of R, G, B does not form a valid triangle.
        }
    }

    // Construct a unique key for the current state (idx, R, G) to use for memoization.
    // A string concatenation is used to create a unique and comparable key for the Map.
    let s = `${idx},${R},${G}`;

    // Check if the result for this specific state has already been computed and stored in the memoization cache.
    if (memo.has(s)) {
        return memo.get(s); // If found, return the pre-calculated result immediately to avoid redundant computations.
    }

    // Recursive calls to explore all three possible assignments for the current element `a[idx]`:

    // Option 1: Assign the current element `a[idx]` to the 'R' group.
    let res = Rec(idx + 1, R + a[idx], G) % MOD;

    // Option 2: Assign the current element `a[idx]` to the 'G' group.
    // Add the result of this path to the current total, ensuring it stays within the modulo range.
    res = (res + Rec(idx + 1, R, G + a[idx])) % MOD;

    // Option 3: Do not assign the current element `a[idx]` to either 'R' or 'G'.
    // In this case, `a[idx]` implicitly contributes to 'B' or is simply not used for triangle sides.
    // Again, add this result to the total and apply modulo.
    res = (res + Rec(idx + 1, R, G)) % MOD;

    // Store the newly computed result for the current state `s` in the memoization cache.
    memo.set(s, res);

    return res; // Return the total count of valid combinations originating from this state.
}

/**
 * The main function responsible for solving the problem. It handles input reading,
 * initialization of data structures, sorting the input array, and initiating
 * the recursive calculation process. This is analogous to the C++ `Solve` function.
 *
 * @returns {number} The final calculated number of ways to form a triangle, according to the problem's rules.
 */
function Solve() {
    // Read the integer value for N. This assumes a `readInt()` helper function for input.
    N = readInt();

    // Re-initialize the array 'a' to a new array of size N for the current set of inputs.
    // This is equivalent to `a.resize(N)` in C++.
    a = new Array(N);

    sum = 0; // Reset the total sum of elements to zero for the new input set.

    // Loop through N iterations to read each element into array 'a' and simultaneously compute their total sum.
    for (let i = 0; i < N; ++i) {
        a[i] = readInt(); // Read the i-th element from input.
        sum += a[i];      // Add the read element to the running total sum.
    }

    // Sort the array 'a' in ascending numerical order.
    // JavaScript's default `sort()` method is lexicographical, so a comparator function `(x, y) => x - y`
    // is essential for correct numerical sorting. This step is important as the problem might implicitly
    // rely on sorted input for certain optimizations or correctness.
    a.sort((x, y) => x - y);

    // Initiate the recursive calculation by calling the `Rec` function.
    // It starts with the first element (index 0) and initial sums for R and G set to zero.
    return Rec(0, 0, 0);
}

/**
 * The entry point of the program, mimicking the behavior of a C++ `main` function.
 * It orchestrates the overall execution flow, from setting up I/O (implicitly)
 * to calling the main solving logic and printing the result.
 */
function main() {
    // In C++, `cin.tie(0); ios::sync_with_stdio(false);` is used for I/O optimization.
    // In JavaScript environments (like Node.js or browsers), I/O handling is
    // typically managed differently, and these specific calls do not have direct equivalents.
    // We assume the `readInt()` and `print()` helpers are optimized appropriately.

    // Execute the main solving function (`Solve`) and print its return value.
    // This assumes a `print()` helper function is available for output.
    print(Solve());
}

// --- Placeholder Input/Output Helper Functions for Execution ---
// These functions are provided to make the code runnable in a typical JavaScript
// environment (e.g., Node.js) where standard input/output streams are not
// directly exposed as `cin` and `cout`. They are not part of the algorithm's
// Type I clone itself, but simulate the environment for the cloned logic.

/**
 * Helper function to read an integer from a simulated input stream.
 * In a real competitive programming setup, this would read from `process.stdin`.
 * @returns {number} The next integer value from the input.
 */
function readInt() {
    // Implement actual input reading logic here, e.g.:
    // return parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[_currentInputLine++], 10);
    // For a simple example, a hardcoded array or `prompt()` could be used.
    // This is a placeholder; actual implementation depends on execution environment.
    throw new Error("readInt() not implemented for this environment. Please provide an input reading function.");
}

/**
 * Helper function to print a value to a simulated output stream.
 * In a real competitive programming setup, this would write to `process.stdout`.
 * @param {*} value - The value to be outputted.
 */
function print(value) {
    // Implement actual output writing logic here, e.g.:
    // console.log(value); // For Node.js
    // document.write(value); // For browser
    // This is a placeholder; actual implementation depends on execution environment.
    throw new Error("print() not implemented for this environment. Please provide an output writing function.");
}

// Invoke the main function to begin program execution.
main();