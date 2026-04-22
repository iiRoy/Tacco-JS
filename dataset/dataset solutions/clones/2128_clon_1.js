/* This file contains utility functions for reading input and a custom BIT (Binary Indexed Tree) implementation.
   It then solves a problem involving character frequencies in a string using the BIT. */

"use strict"; // Enforce strict mode for cleaner code and fewer errors.

// Read the entire input from standard input, assuming UTF-8 encoding.
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into an array of strings using spaces or newlines as delimiters.
// 'cin' stores the tokenized input, 'cid' is the current index for consumption.
var cin = input.split(/ |\n/),
    cid = 0;

/**
 * Retrieves the next token from the input array.
 * @param {boolean} a - If true, returns the token as a string; otherwise, converts it to a number.
 * @returns {string|number} The next token.
 */
function next(a) {
    if (a) {
        return cin[cid++];
    } else {
        return +cin[cid++]; // Convert to number using unary plus operator.
    }
}

/**
 * Retrieves a specified number of tokens from the input array.
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function nexts(n, a) {
    if (a) {
        return cin.slice(cid, (cid += n));
    } else {
        return cin.slice(cid, (cid += n)).map(a => +a); // Map each token to a number.
    }
}

/**
 * Retrieves a 2D array (matrix) of tokens from the input.
 * @param {number} h - The number of rows (height).
 * @param {number} w - The number of columns (width).
 * @param {boolean} a - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array of tokens.
 */
function nextm(h, w, a) {
    var r = [],
        i = 0;

    if (a) {
        for (; i < h; i++) {
            r.push(cin.slice(cid, (cid += w)));
        }
    } else {
        for (; i < h; i++) {
            r.push(cin.slice(cid, (cid += w)).map(a => +a));
        }
    }

    return r;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses 'eval' and string concatenation, which can be risky.
 * @param {*} v - The initial value for the innermost elements.
 * @returns {Array} The multi-dimensional array.
 */
function xArray(v) {
    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";

    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }

    return eval(r); // Executes the constructed string as JavaScript code.
}


// Define a Binary Indexed Tree (BIT) / Fenwick Tree implementation.
var BIT = (function() {
    // Factory function to create a new BIT instance.
    function f(n) {
        return new BIT(n);
    }

    // Constructor for the BIT.
    function BIT(n) {
        // 'a' is the underlying array for the BIT, 1-indexed.
        this.a = Array(n + 1).fill(0);
    }

    /**
     * Adds a value 'x' to the element at index 'i' in the conceptual array,
     * updating the BIT structure.
     * @param {number} x - The value to add.
     * @param {number} i - The 1-based index to update.
     */
    BIT.prototype.add = function(x, i) {
        for (; i < this.a.length; i += i & -i) {
            this.a[i] += x;
        }
    };

    /**
     * Retrieves the prefix sum up to index 'i' from the BIT.
     * @param {number} i - The 1-based index to query.
     * @returns {number} The sum of elements from index 1 to 'i'.
     */
    BIT.prototype.get = function(i) {
        var r = 0; // 'r' accumulates the sum.

        for (; i; i -= i & -i) {
            r += this.a[i];
        }

        return r;
    };

    return f; // Return the factory function.
})(); // Immediately Invoked Function Expression (IIFE) for encapsulation.


// Call the main function to execute the problem logic.
var myOut = main();

// If the main function returns a value, print it to the console.
if (myOut !== undefined) {
    console.log(myOut);
}

/**
 * Main function containing the problem's logic.
 * Reads queries and processes them using the BITs.
 * @returns {string} The answers to the queries, joined by newlines.
 */
function main() {
    var n = next(); // Read the length of the string.
    var s = next(1); // Read the string itself.
    var q = next(); // Read the number of queries.

    // Create an array of 26 BITs, one for each lowercase English letter.
    // Each BIT tracks the occurrences of its corresponding character.
    var bit = Array(26).fill().map(a => new BIT(n));

    // Initialize the BITs based on the initial string 's'.
    for (var i = 0; i < n; i++) {
        // Convert character to 0-25 index (a=0, b=1, ...).
        // Add 1 at the (i+1)-th position for the character.
        bit[s[i].charCodeAt() - 97].add(1, i + 1);
    }

    var ans = []; // Array to store answers for type 2 queries.

    // Process each query.
    for (var i = 0; i < q; i++) {
        // Check query type.
        if (next() === 1) { // Type 1 query: update a character.
            var j = next(), // Position to update (1-based).
                c = next(1); // New character.

            // Decrement count for the old character at position 'j'.
            bit[s[j - 1].charCodeAt() - 97].add(-1, j);

            // Update the string 's' with the new character.
            // This is crucial because subsequent queries need the updated string.
            // Note: The original code does not explicitly update 's'.
            // This implies 's' is treated as immutable for character lookup,
            // or the original problem statement implies character replacement
            // only affects BITs, not the string 's' for index lookups.
            // Assuming 's' itself is NOT updated, and `s[j-1]` refers to the original char for removal.
            // If `s` *should* be updated, this would be `s = s.substring(0, j-1) + c + s.substring(j);`
            // For a Type I clone, I must not change `s[j-1]` in the `add` call.
            // The original code implies that `s[j-1]` still refers to the *original* character at that position.
            // After re-reading, `s` is used to get the character to *remove*.
            // The new character `c` is then added.
            // The problem is that the *next* query, if it's a type 1 query on `j`, will use the *original* `s[j-1]`.
            // This looks like a potential bug or a specific interpretation in the original problem.
            // Since this is a Type I clone, I *must not* alter `s`.
            // So, `s[j-1]` will always refer to the character initially at `j-1`.
            // This means the `add(-1, j)` operation is effectively removing the *original* character,
            // and `add(1, j)` is adding the *new* character.
            // This is a subtle point, but to be a Type I clone, I cannot add `s[j-1] = c;`.

            // Increment count for the new character at position 'j'.
            bit[c.charCodeAt() - 97].add(1, j);

        } else { // Type 2 query: count distinct characters in a range.
            var l = next() - 1, // Left boundary of the range (0-based).
                r = next(); // Right boundary of the range (1-based).

            var cnt = 0; // Counter for distinct characters.

            // Iterate through all 26 possible lowercase letters.
            for (var j = 0; j < 26; j++) {
                // Check if the character 'j' exists in the range [l+1, r].
                // `bit[j].get(r)` is sum up to `r`.
                // `bit[j].get(l)` is sum up to `l`.
                // Their difference tells if character 'j' appears at least once in `(l, r]`.
                if (bit[j].get(r) - bit[j].get(l)) {
                    cnt++;
                }
            }
            ans.push(cnt); // Store the count of distinct characters.
        }
    }

    // Join the collected answers with newline characters and return the result.
    return ans.join("\n");
}