var GET = (

    function() {

        /**
         * Factory function to create a new GET instance.
         * @param {string} s - The input string to parse.
         * @returns {g} A new GET instance.
         */
        function f(s) { return new g(s); }

        /**
         * Constructor for the GET parser.
         * Initializes the internal state for parsing.
         * @param {string} s - The input string, typically from stdin.
         */
        function g(s) {

            // Trim whitespace and split the input string by newlines.
            this._s = s.trim().split("\n");

            // Initialize the current line index.
            this._y = 0;
        }

        /**
         * Parses a single value from the current line.
         * It can parse either a string or a number.
         * @param {boolean} f - If true, return as string; otherwise, as number.
         * @returns {string|number} The parsed value.
         */
        g.prototype.a = function(f) {

            var s = this._s, // Reference to the lines array
                y = this._y, // Current line index
                r;           // Result variable

            // If the current line hasn't been split yet, split it by spaces and reverse it.
            // Reversing allows efficient popping from the end to get values in original order.
            if (typeof s[y] === "string") {
                s[y] = s[y].split(" ").reverse();
            }

            // Pop the last element (which is the next value) from the current line.
            r = s[y].pop();

            // If the current line is now empty, advance to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // Return the result, optionally converting to number.
            return f ? r : +r;
        };

        /**
         * Parses an entire line as an array of values.
         * @param {boolean} f - If true, return as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of parsed values from the line.
         */
        g.prototype.l = function(f) {

            // Get the current line, increment index, and split by spaces.
            var s = this._s[this._y++].split(" ");

            // Return as strings or map to numbers.
            return f ? s : s.map(a => +a);
        };

        /**
         * Parses multiple lines as a 2D array (matrix).
         * Each line is split into an array of values.
         * @param {number} n - The number of lines to parse.
         * @param {boolean} f - If true, return as strings; otherwise, as numbers.
         * @returns {string[][]|number[][]} A 2D array of parsed values.
         */
        g.prototype.m = function(n, f) {

            // Slice 'n' lines, increment index, and map each line to an array of split values.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // Return as strings or map all elements to numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };

        /**
         * Parses multiple lines as a 1D array.
         * Each line is treated as a single value.
         * @param {number} n - The number of lines to parse.
         * @param {boolean} f - If true, return as strings; otherwise, as numbers.
         * @returns {string[]|number[]} A 1D array of parsed values.
         */
        g.prototype.r = function(n, f) {

            // Slice 'n' lines, increment index.
            var r = this._s.slice(this._y, this._y += n);

            // Return as strings or map to numbers.
            return f ? r : r.map(a => +a);
        };

        // Return the factory function 'f'.
        return f;
    }

)();

// Initialize the 'o' object using the GET parser, reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function uses `eval` for dynamic array creation.
 * @param {*} v - The initial value for the array elements.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {

    var a = arguments, // All arguments passed to the function (dimensions)
        l = a.length,  // Number of arguments
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation

    // Build the string for nested array creation.
    // Loop backwards through dimensions to create outer arrays.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval(r);
}

var RollingHash = (

    function() {

        // Base values for polynomial hashing, typically prime numbers.
        var base = [1009, 1007];

        // Modulo values for hashing, large prime numbers to reduce collisions.
        var mod = [1e9 + 7, 1e9 + 9];

        // Arrays to store powers of base[j] modulo mod[j].
        var pow = [
            [],
            []
        ];

        // Arrays to store prefix hashes.
        var hash = [
            [],
            []
        ];

        // Current size of the string being hashed.
        var size;

        /**
         * Factory function to create a new RollingHash instance.
         * @param {string} s - The initial string to hash.
         * @returns {RollingHash} A new RollingHash instance.
         */
        function f(s) { return new RollingHash(s); }

        /**
         * Constructor for the RollingHash object.
         * Precomputes powers and prefix hashes for the given string.
         * @param {string} s - The string to initialize the hash with.
         */
        function RollingHash(s) {

            size = this.size = s.length; // Store the string length.

            // Iterate over each hash function (defined by base/mod pairs).
            for (var j = 0; j < mod.length; j++) {

                // Initialize power and hash arrays for the current modulus.
                pow[j].length = hash[j].length = size + 1;
                pow[j][0] = 1; // Base^0 = 1
                hash[j][0] = 0; // Hash of empty prefix is 0

                // Compute powers and prefix hashes.
                for (var i = 0; i < size; i++) {

                    pow[j][i + 1] = mul(pow[j][i], base[j], mod[j]); // pow[j][i+1] = base^i * base
                    hash[j][i + 1] = mul(hash[j][i], base[j], mod[j]) + s.charCodeAt(i); // hash[j][i+1] = (hash[j][i] * base + char_code) % mod

                    // Ensure hash stays within modulo range.
                    if (hash[j][i + 1] >= mod[j]) {
                        hash[j][i + 1] -= mod[j];
                    }
                }
            }
        }

        /**
         * Checks if a substring 's' exists within the hashed string.
         * @param {string} s - The substring to search for.
         * @param {number} [k=0] - The starting index in the hashed string to begin searching.
         * @returns {number} The starting index of the first occurrence, or -1 if not found.
         */
        RollingHash.prototype.has = function(s, k) {

            var t = getStrHash(s); // Precompute hash of the search string.
            var len = s.length;    // Length of the search string.
            var m = mod.length;    // Number of hash functions.
            var n = size - len + 1; // Number of possible starting positions.
            var f = 0;             // Flag for matching hashes.

            // Iterate through all possible starting positions in the main string.
            for (var i = k || 0; i < n; i++) {

                // Get hash of substring from index i to i+len using the first hash function.
                var h = get(i, i + len, 0);

                // If the first hash matches, check other hash functions.
                if (h === t[0]) {

                    f = 1; // Count of matching hash functions.

                    // Check remaining hash functions.
                    for (var j = 1; j < m; j++) {
                        h = get(i, i + len, j);
                        if (h !== t[j]) break; // If any hash doesn't match, break.
                        f++;
                    }

                    // If all hash functions matched, we found the substring.
                    if (f === m) return i;
                }
            }

            return -1; // Substring not found.
        };

        /**
         * Appends a new string to the end of the current hashed string.
         * Updates all prefix hashes and powers.
         * @param {string} s - The string to append.
         * @returns {number} The new total length of the hashed string.
         */
        RollingHash.prototype.add = function(s) {

            var oldSize = size; // Store the original size.
            size = this.size = size + s.length; // Update the total size.

            // Iterate over each hash function.
            for (var j = 0; j < mod.length; j++) {

                // Resize power and hash arrays.
                pow[j].length = hash[j].length = size + 1;

                // Compute hashes for the newly added part.
                for (var i = oldSize; i < size; i++) {

                    pow[j][i + 1] = mul(pow[j][i], base[j], mod[j]);
                    hash[j][i + 1] = mul(hash[j][i], base[j], mod[j]) + s.charCodeAt(i - oldSize);

                    if (hash[j][i + 1] >= mod[j]) {
                        hash[j][i + 1] -= mod[j];
                    }
                }
            }
            return size; // Return the new total size.
        };

        /**
         * Computes the hash of a given string 's'.
         * @param {string} s - The string to hash.
         * @returns {number[]} An array of hashes, one for each hash function.
         */
        function getStrHash(s) {

            var r = []; // Array to store resulting hashes.

            // Compute hash for each hash function.
            for (var j = 0; j < mod.length; j++) {

                var t = 0; // Current hash value for this function.

                for (var i = 0; i < s.length; i++) {
                    t = mul(t, base[j], mod[j]) + s.charCodeAt(i);
                }

                if (t >= mod[j]) {
                    t -= mod[j];
                }
                r.push(t); // Add the computed hash.
            }
            return r;
        }

        /**
         * Retrieves the hash of a substring from the precomputed hashes.
         * Uses the formula: hash(l, r) = (hash[r] - hash[l] * base^(r-l)) % mod.
         * @param {number} l - The starting index (inclusive).
         * @param {number} r - The ending index (exclusive).
         * @param {number} j - The index of the hash function to use.
         * @returns {number} The hash of the substring.
         */
        function get(l, r, j) {

            var t = hash[j][r] - mul(hash[j][l], pow[j][r - l], mod[j]);

            // Ensure the result is positive.
            if (t < 0) {
                t += mod[j];
            }
            return t;
        }

        /**
         * Performs modular multiplication efficiently.
         * This prevents overflow for large numbers before taking modulo.
         * @param {number} a - First operand.
         * @param {number} b - Second operand.
         * @param {number} c - Modulo.
         * @returns {number} (a * b) % c.
         */
        function mul(a, b, c) {

            // Uses a trick to split 'a' into two 16-bit parts to prevent overflow.
            return ((a >> 16) * b % c * 65536 + (a & 65535) * b) % c;
        }

        // Return the factory function 'f'.
        return f;
    }

)();


// Execute the main logic and print the result to the console.
console.log(main());


/**
 * Main function to solve the problem.
 * It appears to be solving a string matching problem, possibly related to
 * finding the minimum number of repetitions of string 's' to contain string 't'
 * multiple times.
 */
function main() {

    // Read two strings from input.
    var s = o.a(1); // String s
    var t = o.a(1); // String t

    // Create a working copy of s, extending it until it's at least as long as t.
    var s1 = s;
    while (s1.length < t.length) {
        s1 += s;
    }

    // Create a RollingHash instance with 's1' concatenated with itself.
    // This allows searching for 't' across potential boundaries of 's1' repetitions.
    var rh = RollingHash(s1 + s1);

    // Find the first occurrence of 't' in the extended 's1'.
    var x = rh.has(t);

    // If 't' is not found at all, it's impossible.
    if (x === -1) {
        return 0;
    }

    // Initialize variables for finding multiple occurrences.
    var tt = t;    // Current target string (t, then t+t, then t+t+t, etc.)
    var y;         // Stores the last successful match index.
    var ans = 0;   // Counter for the number of repetitions of 't' found.

    // Loop to find consecutive occurrences of 't'.
    while (x >= 0) {

        tt += t;     // Extend the target string by one 't'.
        y = x;       // Store the current match index.
        ans++;       // Increment the count of 't' repetitions.

        // Search for the extended 'tt' starting from the previous match position 'x'.
        x = rh.has(tt, x);
    }

    // After finding the maximum 't' repetitions in s1+s1,
    // add another 's1' to the RollingHash. This simulates a third repetition.
    // This is crucial to check if the next 't' repetition would cross the boundary
    // of s1+s1 and be found in s1+s1+s1.
    rh.add(s1);

    // If the 'tt' (which is the last successfully matched 't' sequence + one more 't')
    // is found starting from 'y' (the start of the last 't' sequence) in the now
    // even longer string (s1+s1+s1), it means 't' can be repeated indefinitely.
    // This indicates an infinite repetition scenario.
    if (rh.has(tt, y) >= 0) {
        return -1; // Return -1 for infinite repetitions.
    }

    // Otherwise, return the number of 't' repetitions found.
    return ans;
}