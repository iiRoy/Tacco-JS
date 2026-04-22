// This file contains a solution for a programming problem.
// It's a JavaScript implementation designed for competitive programming environments.
"use strict";

// Standard input reading setup
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// Processing input into an array of tokens
var cin = input.split(/ |\n/), cid = 0; // cin: collected input, cid: current input index

/*
 * Helper function to read the next token from the input array.
 * @param {boolean} a - If true, returns the token as a string; otherwise, converts to a number.
 * @returns {string|number} The next token.
 */
function next(a) {
    return a ? cin[cid++] : +cin[cid++];
}


// Helper function to read 'n' tokens from the input.
// @param {number} n - The number of tokens to read.
// @param {boolean} a - If true, returns tokens as strings; otherwise, converts to numbers.
// @returns {Array<string|number>} An array of tokens.
function nexts(n, a) {
    return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a);
}


// Helper function to read a 2D matrix of 'h' rows and 'w' columns.
// @param {number} h - Number of rows.
// @param {number} w - Number of columns.
// @param {boolean} a - If true, returns elements as strings; otherwise, converts to numbers.
// @returns {Array<Array<string|number>>} The 2D matrix.
function nextm(h, w, a) {
    var r = [], i = 0;
    if (a) {
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w));
        }
    } else {
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(a => +a));
        }
    }
    return r;
}


/*
 * Dynamically creates a multi-dimensional array.
 * @param {*} v - The initial value for the innermost elements.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, l = a.length, r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";
    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    return eval(r);
}


// Call the main function to execute the problem logic.
var myOut = main();

// If the main function returns a value, print it to console.
if (myOut !== undefined) {
    console.log(myOut);
}


// The primary logic of the program resides in the main function.
function main() {

    // Read initial parameters: n, a, b, c
    var [n, a, b, c] = nexts(4);

    // Read an array of strings 's' of length 'n'
    var s = nexts(n, 1);

    // Initialize an array to store the answers
    var ans = [];

    // Define the "No" string for early exit conditions
    var NN = "No";

    // Loop through the input array 's' up to the second to last element
    for (var i = 0; i < n - 1; i++) {

        // Check the current element s[i]
        if (s[i] === "AB") {
            // Decrement counts for 'a' and 'b'
            a--, b--;
            // If both 'a' and 'b' are negative, it's impossible
            if (a < 0 && b < 0) {
                return NN;
            }
            // Decision logic for "AB" case, considering the next element
            if (a > b || (s[i + 1] !== "AC" && a >= 0)) {
                b += 2; // Increase 'b' count
                ans.push("B"); // Record action "B"
            } else {
                a += 2; // Increase 'a' count
                ans.push("A"); // Record action "A"
            }
        }

        // Check for "AC" case
        if (s[i] === "AC") {
            // Decrement counts for 'a' and 'c'
            a--, c--;
            // If both 'a' and 'c' are negative, it's impossible
            if (a < 0 && c < 0) {
                return NN;
            }
            // Decision logic for "AC" case, considering the next element
            if (a > c || (s[i + 1] !== "AB" && a >= 0)) {
                c += 2; // Increase 'c' count
                ans.push("C"); // Record action "C"
            } else {
                a += 2; // Increase 'a' count
                ans.push("A"); // Record action "A"
            }
        }

        // Check for "BC" case
        if (s[i] === "BC") {
            // Decrement counts for 'c' and 'b'
            c--, b--;
            // If both 'c' and 'b' are negative, it's impossible
            if (c < 0 && b < 0) {
                return NN;
            }
            // Decision logic for "BC" case, considering the next element
            if (c > b || (s[i + 1] !== "AC" && c >= 0)) {
                b += 2; // Increase 'b' count
                ans.push("B"); // Record action "B"
            } else {
                c += 2; // Increase 'c' count
                ans.push("C"); // Record action "C"
            }
        }
    }

    // Handle the last element s[n-1] separately
    // The logic here simplifies as there is no 'next' element to consider for conditional checks.
    if (s[n - 1] === "AB") {
        a--, b--; // Decrement 'a' and 'b'
        if (a < 0 && b < 0) {
            return NN;
        }
        if (a > b) {
            ans.push("B"); // Add "B" if 'a' is greater than 'b'
        } else {
            ans.push("A"); // Otherwise add "A"
        }
    } else if (s[n - 1] === "AC") {
        a--, c--; // Decrement 'a' and 'c'
        if (a < 0 && c < 0) {
            return NN;
        }
        if (a > c) {
            ans.push("C"); // Add "C" if 'a' is greater than 'c'
        } else {
            ans.push("A"); // Otherwise add "A"
        }
    } else { // This implies s[n-1] === "BC"
        b--, c--; // Decrement 'b' and 'c'
        if (b < 0 && c < 0) {
            return NN;
        }
        if (b > c) {
            ans.push("C"); // Add "C" if 'b' is greater than 'c'
        } else {
            ans.push("B"); // Otherwise add "B"
        }
    }

    // If all checks pass and a solution is found, print "Yes"
    console.log("Yes");

    // Join the collected answers with newlines and return the result
    return ans.join("\n");
}