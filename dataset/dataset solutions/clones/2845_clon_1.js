// This section handles input/output operations.
// It's part of the boilerplate for competitive programming.

var read = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

/*
 * Global variables for processing input lines.
 * `obj` will hold the parsed input object.
 * `inLine` is an array to store raw input lines.
 */
var obj;
var inLine = [];

// Event listener for each line of input received.
// Adds the line to the `inLine` array.
read.on('line', function (input) {
    inLine.push(input);
});

// Event listener for the 'close' event, indicating end of input.
// Initializes the `obj` with the collected input lines and then calls `Main`.
read.on('close', function () {
    obj = init(inLine); // Initialize the input processing object.
    console.error('\n↑入力 ↓出力'); // Debug message for input/output separation.
    Main(); // Execute the main logic of the program.
});

/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically to ensure proper cloning.
 * For other objects, it uses JSON serialization/deserialization.
 *
 * @param {any} obj The object to clone.
 * @returns {any} A deep clone of the object.
 */
function makeClone(obj) {
    return (obj instanceof Set)
        ? new Set(Array.from(obj)) // If it's a Set, create a new Set from its elements.
        : JSON.parse(JSON.stringify(obj)); // Otherwise, use JSON stringify/parse for deep copy.
}

/*
 * Helper functions for parsing different types of input from `obj`.
 * These functions abstract away the input reading mechanism.
 */

// Reads the next token as an integer.
function nextInt() {
    return myconv(next(), 1);
}

// Reads the next token and splits it into an array of strings.
function nextStrArray() {
    return myconv(next(), 2);
}

// Reads the next token, splits it by space, and converts parts to numbers.
function nextIntArray() {
    return myconv(next(), 4);
}

// Reads the next token and splits it into an array of characters.
function nextCharArray() {
    return myconv(next(), 6);
}

// Retrieves the next available input token.
function next() {
    return obj.next();
}

// Checks if there are more input tokens available.
function hasNext() {
    return obj.hasNext();
}

/**
 * Initializes an input object with methods for sequential reading.
 * This object manages the list of input lines and the current reading index.
 *
 * @param {string[]} input An array of strings, where each string is a line of input.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init(input) {
    return {
        list: input, // The array of input lines.
        index: 0, // Current index for reading from `list`.
        max: input.length, // Total number of input lines.

        /**
         * Checks if there are more input lines to read.
         * @returns {boolean} True if more lines are available, false otherwise.
         */
        hasNext: function () {
            return (this.index < this.max);
        },

        /**
         * Returns the next input line and advances the index.
         * Throws an error if no more input is available.
         * @returns {string} The next input line.
         * @throws {string} 'ArrayIndexOutOfBoundsException' if no more input.
         */
        next: function () {
            if (this.hasNext()) {
                return this.list[this.index++];
            } else {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
            }
        }
    };
}

/**
 * Outputs a string to the console, followed by a newline.
 * This is the standard output function.
 * @param {string} s The string to output.
 */
function myout(s) {
    console.log(s);
}

/**
 * Outputs debug information to the standard error stream.
 * Uses `util.inspect` for detailed object inspection.
 * @param {any} s The data to debug output.
 */
function myerr(s) {
    console.error('debug:' + require('util').inspect(s, false, null));
}

// This function acts as a versatile converter for input data.
// The `no` parameter dictates the type of conversion to perform.
//
// param "no" is:
// unknown or outlier : return i (no conversion).
// 1: parseInt (converts string to integer).
// 2: split space (splits string by space into an array of strings).
// 4: split space and parseInt (splits by space, then converts parts to numbers).
// 6: split 1 character (splits string into an array of characters).
// 7: split 1 character and parseInt (splits by character, then converts parts to numbers).
// 8: join space (joins array elements with spaces).
// 9: join newline (joins array elements with newlines).
// 0: join no character (joins array elements without any separator).
/**
 * Converts input `i` based on the specified `no` type.
 * @param {any} i The input to convert.
 * @param {number} no The conversion type identifier.
 * @returns {any} The converted output.
 */
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
                return i; // No conversion if `no` is unknown.
        }
    } catch (e) {
        // In case of any error during conversion, return the original input.
        return i;
    }
}

// Don't have to see. end------------------------------------------

/**
 * The main function containing the core logic of the program.
 * It reads input, performs calculations, and outputs results.
 */
function Main() {
    // Read the number of elements, N.
    var N = nextInt();

    // Read the list of N integers.
    var list = nextIntArray();

    // Sort the list in ascending order.
    list.sort(function (a, b) {
        return a - b;
    });

    // Calculate the initial value of M.
    // M represents the sum of absolute differences.
    var M = -list[0] + list[N - 1];

    // Iterate through the middle elements (excluding first and last).
    // Add the absolute value of each element to M.
    for (var i = 1; i < N - 1; i++) {
        M += Math.abs(list[i]);
    }

    // Output the final calculated value of M.
    myout(M);

    // Initialize an array to store the sequence of operations.
    var output = new Array(N - 1);

    // Initialize L and R with the smallest and largest elements from the sorted list.
    var L = list[0];
    var R = list[N - 1];

    // Process the elements between the smallest and largest.
    // The goal is to reduce the range [L, R] by incorporating middle elements.
    for (var i = 1; i < N - 1; i++) {
        if (list[i] < 0) {
            // If the current element is negative, subtract it from R.
            // This effectively increases R (since subtracting a negative is adding).
            output[i - 1] = R + " " + list[i];
            R -= list[i];
        } else {
            // If the current element is non-negative, subtract it from L.
            // This effectively decreases L.
            output[i - 1] = L + " " + list[i];
            L -= list[i];
        }
    }

    // After processing all middle elements, the final operation is to combine R and L.
    // The result of this operation will be R - L, which should be M.
    output[output.length - 1] = R + " " + L;

    // Output the sequence of operations, joined by newlines.
    myout(myconv(output, 9));
}