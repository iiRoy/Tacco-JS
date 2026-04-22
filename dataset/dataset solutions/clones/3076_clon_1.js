'use strict'

// Global object to manage input stream, initialized once.
var obj = init();

// Entry point of the program.
Main();


// Function to read the next integer from the input.
function nextInt() {
    return myconv(next(), 1);
}

// Function to read the next line and split it by space into a string array.
function nextStrArray() {
    return myconv(next(), 2); // Splits by half-width space.
}

// Function to read the next line, split by space, and convert to an integer array.
function nextIntArray() {
    return myconv(next(), 4); // Splits by half-width space and converts to numbers.
}

// Function to read the next line and split into a character array.
function nextCharArray() {
    return myconv(next(), 6); // Splits into individual characters.
}

// Retrieves the next line of input as a string.
function next() {
    return obj.next();
}

// Checks if there is more input available.
function hasNext() {
    return obj.hasNext();
}

// Reads the entire standard input, trims it, and splits by newlines.
function myin() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

// Initializes the input object.
function init() {
    var inputFile = myin(); // Read all input lines.

    var returnObj = {
        "list": inputFile, // Array of input lines.
        "index": 0, // Current position in the input array.
        "max": inputFile.length, // Total number of input lines.

        // Method to check if more input lines are available.
        "hasNext": function() {
            return (this.index < this.max);
        },

        // Method to get the next input line.
        "next": function() {
            if (!this.hasNext()) {
                return ""; // Return empty string if no more input.
            } else {
                var returnInput = this.list[this.index]; // Get current line.
                this.index++; // Advance to the next line.
                return returnInput;
            }
        }
    };
    return returnObj;
}

// Outputs to standard console.
function myout(t) {
    console.log(t);
}

// Outputs to standard error console.
function myerr(t) {
    console.error(t);
}

// Function to handle various data type conversions and operations.
// [no] parameter defines the operation:
// Undefined/Abnormal: Returns input as is.
// 1: Converts to integer.
// 2: Splits by half-width space.
// 4: Splits by half-width space and converts to number array.
// 6: Splits into characters.
// 7: Splits into characters and converts to number array.
// 8: Joins array elements with half-width space.
// 9: Joins array elements with a newline.
// 0: Joins array elements without any separator.
function myconv(i, no) {
    try {
        switch (no) {
            case 1: // Convert to integer
                return parseInt(i);
            case 2: // Split by space
                return i.split(" ");
            case 4: // Split by space and map to numbers
                return i.split(" ").map((a) => Number(a));
            case 6: // Split into characters
                return i.split("");
            case 7: // Split into characters and map to numbers
                return i.split("").map((a) => Number(a));
            case 8: // Join array elements with space
                return i.join(" ");
            case 9: // Join array elements with newline
                return i.join("\n");
            case 0: // Join array elements without separator
                return i.join("");
            default: // Default: return input as is
                return i;
        }
    } catch (e) {
        return i; // In case of error, return original input.
    }
}


// Main function where the program logic resides.
function Main() {

    // Read the first line containing X, Y, Z, K.
    var one = nextIntArray();
    var X = one[0];
    var Y = one[1];
    var Z = one[2];
    var K = one[3];

    // Read the lists of numbers.
    var xlist = nextIntArray();
    var ylist = nextIntArray();
    var zlist = nextIntArray();

    // Create a list to store sums of elements from xlist and ylist.
    var maelist = new Array(X * Y);

    // Populate maelist with sums of all possible pairs from xlist and ylist.
    for (var i = 0; i < X; i++) {
        for (var j = 0; j < Y; j++) {
            maelist[i * Y + j] = xlist[i] + ylist[j];
        }
    }

    // Sort maelist in descending order.
    maelist.sort(function(a, b) {
        return b - a; // Descending sort.
    });

    // Take only the top K elements (or fewer if maelist has less than K elements).
    // Note: This `slice` creates a new array but doesn't modify `maelist` itself.
    // The problem statement likely implies using the top K for the next step,
    // so `maelist` should be re-assigned or used with `splice` for in-place modification.
    // However, adhering to Type I clone, we keep the original expression.
    maelist.slice(0, K);

    // Create a list to store sums of elements from (modified) maelist and zlist.
    var atolist = new Array(maelist.length * Z);

    // Populate atolist with sums of all possible pairs from maelist and zlist.
    for (var i = 0; i < maelist.length; i++) {
        for (var j = 0; j < Z; j++) {
            atolist[i * Z + j] = maelist[i] + zlist[j];
        }
    }

    // Sort atolist in descending order.
    atolist.sort(function(a, b) {
        return b - a; // Descending sort.
    });

    // Take only the top K elements (or fewer if atolist has less than K elements).
    // Similar to the previous slice, this creates a new array but doesn't modify `atolist`.
    // The problem context implies using these top K elements for output.
    atolist.slice(0, K);

    // Output the resulting list, joined by newlines.
    myout(myconv(atolist, 9));
}