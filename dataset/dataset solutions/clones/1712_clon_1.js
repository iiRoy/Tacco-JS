"use strict";

// Reads input from standard input, using 'fs' module
var input = require("fs").readFileSync("/dev/stdin", "utf8");

/* Global variables for parsing input.
 * `cin` holds tokenized input, `cid` is the current token index.
 */
var cin = input.split(/ |\n/), cid = 0;

// Parses the next input token as a number.
function next() {
    return +cin[cid++];
}

// Parses the next input token as a string.
function nextstr() {
    return cin[cid++];
}

// Parses the next input token as a BigInt.
function nextbig() {
    return BigInt(cin[cid++]);
}


/*
 * Reads 'n' tokens from the input.
 * If the optional argument 'a' is truthy, tokens are returned as strings.
 * Otherwise, tokens are parsed as numbers.
 */
function nexts(n, a) {
    return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a);
}

function nextm(h, w, a) {
    var r = [], i = 0; // Initialize result array and counter
    if (a) {
        // If 'a' is true, read 'w' string tokens for each of 'h' rows
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w));
        }
    } else {
        // Otherwise, read 'w' number tokens for each of 'h' rows
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(a => +a));
        }
    }
    return r; // Return the 2D array
}

function xArray(v) {
    var a = arguments;
    var l = a.length;
    // Construct the initial array creation string, starting from the innermost dimension
    var r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";
    // Nest array creations for multi-dimensional arrays, working outwards
    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    // Evaluate the constructed string to create the array dynamically
    return eval(r);
}

// Global variable to accumulate the total score
var score = 0;

// Execute the main logic and store its return value
var myOut = main();

// If main() returns a value, print it to console
if (myOut !== undefined) {
    console.log(String(myOut));
}
/* console.log(score); // Debugging output, currently commented out */


/*
 * The main function where the core logic resides.
 * It processes daily data and calculates an optimal schedule based on
 * satisfaction and cost values.
 */
function main() {
    const d = next();   // Read the number of days (e.g., 365) from input
    const n = 26;       // Define the number of items/categories (e.g., 26 for A-Z)
    const c = nexts(n); // Read 'n' cost values (Ci) from input
    var a = xArray(0, n); // Initialize an array 'a' of size 'n' with zeros. This array
                          // seems to track accumulated negative values for each item.
    var ans = [];       // Array to store the 1-based index of the chosen item for each day

    // Loop through each of the 'd' days
    for (var i = 0; i < d; i++) {
        var s = nexts(n); // Read 'n' satisfaction values (Si,j) for the current day
        var t = -1e9;     // Initialize 't' (maximum satisfaction found for the day) to a very small number
        var id = 0;       // Initialize 'id' (index of the chosen item for the day)

        // Loop through each item/category to find the best one for the current day
        for (var j = 0; j < n; j++) {
            a[j] -= c[j]; // Decrease 'a[j]' by 'c[j]'. This accumulates negative cost over time.
            var u = s[j] - a[j] + c[j]; // Calculate 'u', a potential satisfaction value for item 'j'.
                                        // This formula appears to be s[j] - (a[j]-c[j]) = s[j] - a'[j]
                                        // where a'[j] is the accumulated negative value after this day.
            if (t < u) {
                t = u;    // Update max satisfaction if current 'u' is greater
                id = j;   // Update chosen item index to 'j'
            }
        }
        ans[i] = id + 1; // Store the 1-based index of the chosen item for day 'i'
        a[id] = 0;       // Reset 'a[id]' to 0 for the chosen item, as its "negative accumulation" is reset.
        score += s[id];  // Add the satisfaction of the chosen item to the total score

        // Update the total score by adding all current 'a' values
        // This seems to penalize items that haven't been chosen recently.
        for (var j = 0; j < n; j++) {
            score += a[j];
        }
    }
    // Join the results (chosen item indices) with newlines and return the string
    return ans.join("\n");
}