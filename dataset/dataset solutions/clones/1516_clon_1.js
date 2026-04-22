// This file contains a solution for a dynamic programming problem.
// It includes several utility functions for input processing and output.

// === Start of boilerplate/utility code section ===
// This section handles reading input from stdin and setting up helper functions.

var read = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var obj; // Will store the custom input reader object.
var inLine = []; // An array to accumulate all lines read from input.

// Event listener for each line of input received.
read.on('line', function (input) {
    inLine.push(input);
});

// Event listener for when the input stream closes.
read.on('close', function () {
    // Initialize the custom input object with all collected lines.
    obj = init(inLine);
    // Print a separator to stderr, indicating input is done and output will follow.
    console.error('\n↑入力 ↓出力');
    // Execute the main program logic.
    Main();
});

/**
 * Creates a deep clone of an object or a Set.
 * For Sets, it creates a new Set from the elements.
 * For other objects, it uses JSON serialization/deserialization for a deep copy.
 * @param {any} obj The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone(obj) {
    return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));
}

// --- Input parsing helper functions ---

/**
 * Reads the next input token and converts it to an integer.
 * @returns {number} The next input token as an integer.
 */
function nextInt() {
    return myconv(next(), 1);
}

/**
 * Reads the next input token and splits it into an array of strings by spaces.
 * @returns {string[]} An array of strings.
 */
function nextStrArray() {
    return myconv(next(), 2);
}

/**
 * Reads the next input token, splits it by spaces, and converts parts to numbers.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray() {
    return myconv(next(), 4);
}

/**
 * Reads the next input token and splits it into an array of single characters.
 * @returns {string[]} An array of characters.
 */
function nextCharArray() {
    return myconv(next(), 6);
}

/**
 * Retrieves the next token from the input stream.
 * @returns {string} The next input token.
 */
function next() {
    return obj.next();
}

/**
 * Checks if there are more tokens available in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext() {
    return obj.hasNext();
}

/**
 * Initializes the custom input reader object.
 * This object manages the list of input lines and provides methods to access them.
 * @param {string[]} input An array of strings, where each string is a line of input.
 * @returns {object} An object with methods to read input.
 */
function init(input) {
    return {
        list: input,
        index: 0,
        max: input.length,

        // Checks if there are unread input lines.
        hasNext: function () {
            return (this.index < this.max);
        },

        // Retrieves the next input line and advances the index.
        next: function () {
            if (this.hasNext()) {
                return this.list[this.index++];
            } else {
                // Throws an error if no more input is available.
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
            }
        }
    };
}

/**
 * Prints the given argument to standard output, followed by a newline.
 * @param {any} s The value to print.
 */
function myout(s) {
    console.log(s);
}

/**
 * Prints debug information to standard error.
 * Uses Node.js's `util.inspect` for detailed object inspection.
 * @param {any} s The value to debug print.
 */
function myerr(s) {
    console.error('debug:' + require('util').inspect(s, false, null));
}

// Documentation for the `myconv` function's 'no' parameter.
// This function acts as a versatile converter for input values.
// The 'no' parameter dictates the specific conversion logic to apply.
// - If 'no' is unknown or an outlier, the original input 'i' is returned.
// - 1: Parses 'i' into an integer (using `parseInt`).
// - 2: Splits 'i' by spaces into an array of strings.
// - 4: Splits 'i' by spaces and then maps each resulting string to a Number.
// - 6: Splits 'i' into an array of individual characters.
// - 7: Splits 'i' into individual characters and maps each to a Number.
// - 8: Joins the elements of array 'i' with spaces.
// - 9: Joins the elements of array 'i' with newline characters.
// - 0: Joins the elements of array 'i' without any separator.
function myconv(i, no) {
    try {
        switch (no) {
            case 1:
                return parseInt(i);
            case 2:
                return i.split(' ');
            case 4:
                return i.split(' ').map(Number);
            case 6:
                return i.split('');
            case 7:
                return i.split('').map(Number);
            case 8:
                return i.join(' ');
            case 9:
                return i.join('\n');
            case 0:
                return i.join('');
            default:
                return i; // Default case: return original input if 'no' is not recognized.
        }
    } catch (e) {
        // If any error occurs during conversion, gracefully return the original input.
        return i;
    }
}

// === End of boilerplate/utility code section ===

/**
 * The main function containing the core logic of the problem.
 * This particular problem appears to be a dynamic programming problem
 * involving jumps or steps with specific range constraints.
 */
function Main() {
    // Read the first line of input, which contains N and K.
    var one = nextIntArray();
    var N = one[0]; // N represents the target index or size of the DP array.
    var K = one[1]; // K represents the number of allowed jump ranges.

    var mod = 998244353; // A common large prime number used for modulo operations in competitive programming.

    // Initialize the dynamic programming array 'dp' and a cumulative sum array 'ruiseki'.
    // Both are filled with zeros initially.
    var dp = new Array(N).fill(0);
    var ruiseki = new Array(N).fill(0);

    // Set the base case for the DP: dp[0] is typically 1, meaning there's one way to reach position 0.
    dp[0] = 1;
    // The cumulative sum up to index 0 is also 1.
    ruiseki[0] = 1;

    // Read K jump ranges. Each range consists of a lower bound (L) and an upper bound (R).
    var list = new Array(K);
    for (var i = 0; i < K; i++) {
        var tmp = nextIntArray(); // Read L and R for the current range.
        list[i] = {
            L: tmp[0], // Lower bound of the jump.
            R: tmp[1] // Upper bound of the jump.
        };
    }

    // Core dynamic programming loop.
    // We calculate dp[i] for each index 'i' from 1 up to N-1.
    for (var i = 1; i < N; i++) {
        // For each index 'i', consider all K allowed jump ranges.
        for (var j = 0; j < K; j++) {
            var check = list[j]; // Get the current jump range {L, R}.

            // If jumping 'check.L' steps back from 'i' results in a negative index,
            // this jump range is not applicable for the current 'i', so skip it.
            if (i - check.L < 0) {
                continue;
            }

            // Case 1: If the jump range is a single point (L == R).
            if (check.L == check.R) {
                dp[i] += dp[i - check.L];
            }
            // Case 2: If the lower bound of the cumulative sum range (i - R - 1)
            // would go below index 0. This means we sum from index 0 up to (i - L).
            else if (i - check.R - 1 < 0) {
                dp[i] += ruiseki[i - check.L];
            }
            // Case 3: The full cumulative sum range [i - R, i - L] is valid.
            // We calculate the sum by subtracting ruiseki[i - R - 1] from ruiseki[i - L].
            else {
                dp[i] += ruiseki[i - check.L] - ruiseki[i - check.R - 1];
            }

            // Handle negative results from subtraction due to modulo arithmetic.
            // If dp[i] becomes negative, add 'mod' to bring it back into positive range.
            if (dp[i] < 0) {
                dp[i] += mod;
            }
            // Apply modulo to dp[i] to keep the result within the required range.
            dp[i] %= mod;
        }

        // Update the cumulative sum array for the current index 'i'.
        // ruiseki[i] is the sum of dp values from dp[0] to dp[i].
        ruiseki[i] = dp[i] + ruiseki[i - 1];
        // Apply modulo to the cumulative sum.
        ruiseki[i] %= mod;
    }

    // After all calculations, output the final result, which is dp[N-1].
    myout(dp[N - 1]);
}