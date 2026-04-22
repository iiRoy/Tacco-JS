// This file contains an input reading utility and the main program logic.

// Define an Immediately Invoked Function Expression (IIFE) to create a
// module-like structure for input handling. This pattern helps to avoid
// polluting the global namespace.
var GET = (function () {

    /**
     * Factory function 'f' to create a new input reader instance.
     * @param {string} s The raw input string.
     * @returns {g} A new instance of the input reader.
     */
    function f(s) {
        // Instantiate and return a new input reader object.
        return new g(s);
    }

    /**
     * Constructor 'g' for the input reader.
     * It processes the raw input string into an array of lines.
     * @param {string} s The raw input string, typically read from stdin.
     */
    function g(s) {
        // Trim leading/trailing whitespace from the input string and
        // then split it into an array of lines based on newline characters.
        this._s = s.trim().split("\n");
        // Initialize a line pointer, indicating the current line to be read.
        this._y = 0;
    }

    /**
     * Prototype method 'a' for reading a single item from the current line.
     * Items are expected to be space-separated.
     * @param {boolean} f A flag. If true, returns the item as a string; otherwise, as a number.
     * @returns {string|number} The read item.
     */
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r;           // Variable to store the retrieved item.

        // If the current line (s[y]) is still a string, it means it hasn't been
        // processed into an array of individual items yet.
        if (typeof s[y] === "string") {
            // Split the line by spaces and reverse the resulting array.
            // Reversing allows us to use `pop()` to efficiently get items
            // from the logical "left" (start) of the line while physically
            // removing from the array's end.
            s[y] = s[y].split(" ").reverse();
        }

        // Extract the last element from the (possibly reversed) current line array.
        r = s[y].pop();

        // If the current line array becomes empty after popping, increment
        // the line pointer to move to the next line for subsequent reads.
        if (!s[y].length) {
            this._y++;
        }

        // Return the item. If 'f' is true, return as a string; otherwise,
        // convert it to a number using the unary plus operator.
        return f ? r : +r;
    };

    /**
     * Prototype method 'l' for reading an entire line of space-separated items.
     * @param {boolean} f A flag. If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string>|Array<number>} An array of items from the line.
     */
    g.prototype.l = function (f) {
        // Retrieve the current line, split it by spaces, and then
        // immediately increment the line pointer for the next read.
        var s = this._s[this._y++].split(" ");

        // Return the array. If 'f' is true, return as strings; otherwise,
        // map each string element to its numeric equivalent.
        return f ? s : s.map(a => +a);
    };

    /**
     * Prototype method 'm' for reading a "matrix" or multiple lines of space-separated items.
     * @param {number} n The number of lines to read.
     * @param {boolean} f A flag. If true, returns a 2D array of strings; otherwise, of numbers.
     * @returns {Array<Array<string>>|Array<Array<number>>} The matrix of items.
     */
    g.prototype.m = function (n, f) {
        // Extract 'n' lines from the input array, starting from the current line.
        // Increment the line pointer by 'n'.
        // Then, map each extracted line string to an array of strings by splitting it by spaces.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the 2D array. If 'f' is true, return as strings; otherwise,
        // map each inner array's elements to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Prototype method 'r' for reading a range of lines, treating each line as a single item.
     * @param {number} n The number of lines to read.
     * @param {boolean} f A flag. If true, returns an array of strings; otherwise, of numbers.
     * @returns {Array<string>|Array<number>} An array of lines.
     */
    g.prototype.r = function (n, f) {
        // Extract 'n' lines from the input array, starting from the current line.
        // Increment the line pointer by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array of lines. If 'f' is true, return as strings; otherwise,
        // map each string line to its numeric equivalent.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the factory function 'f', which becomes the public interface
    // for creating input reader instances.
    return f;

})(); // End of the GET IIFE.


// Create an instance of the input reader 'o' by passing the content of stdin.
// 'fs.readFileSync' reads the entire content of the file synchronously.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Execute the main program function and print its return value to the console.
console.log(main());


/**
 * The main function encapsulates the problem-solving logic.
 * It reads input, performs calculations, and returns the result.
 * @returns {string|number} The final answer, formatted as a string or -1 on failure.
 */
function main() {

    // Read the first integer from the input. This is typically 'n',
    // representing the size or count of something.
    var n = o.a();

    // Read the next line of space-separated integers into an array 'b'.
    var b = o.l();

    // Initialize an empty array 'ans' to store the resulting sequence.
    var ans = [];

    // Call the nested helper function 'f' with array 'b'.
    // This function attempts to find a specific pattern or sequence.
    // If 'f' returns false, it indicates that no such sequence could be formed.
    if (f(b) === false) {
        // If the sequence cannot be formed, return -1 as per problem requirements.
        return -1;
    }

    // If 'f' returns true, the 'ans' array now contains the elements in
    // the reverse order of their discovery.
    // Reverse 'ans' to get the correct order and then join its elements
    // with newline characters to form the final output string.
    return ans.reverse().join("\n");


    /**
     * Nested recursive function 'f' to determine if a specific sequence can be formed
     * by removing elements such that the remaining elements satisfy a condition.
     * The condition is that an element `a[i]` must be equal to `i + 1` (1-based index)
     * *within its current sub-array*.
     * @param {Array<number>} a The current sub-array being processed.
     * @returns {boolean} True if a valid sequence can be constructed, false otherwise.
     */
    function f(a) {
        // Base case for the recursion: If the array 'a' is empty, it means
        // all elements have been successfully processed, so a valid sequence is found.
        if (a.length === 0) {
            return true;
        }

        // Iterate through the current sub-array 'a' from the last element to the first.
        // This reverse iteration is crucial for the problem's logic.
        for (var i = a.length - 1; i >= 0; i--) {
            // Check if the element at the current index 'i' is equal to its
            // 1-based index within the *current* sub-array 'a'.
            // For example, if a = [10, 2, 3], when i=2, a[2]=3. 3 === (2+1) is true.
            if (a[i] === i + 1) {
                // If a matching element is found, add it to the 'ans' array.
                // Note: 'ans' accumulates elements in the order they are found (reversed).
                ans.push(a[i]);

                // Recursively call 'f' with a new array that excludes the found element.
                // 'a.slice(0, i)' gets elements before 'i'.
                // 'a.slice(i + 1)' gets elements after 'i'.
                // 'concat' merges these two parts to form the new sub-array.
                return f(a.slice(0, i).concat(a.slice(i + 1)));
            }
        }

        // If the loop completes without finding any element that satisfies the condition,
        // it means a valid sequence cannot be formed from this particular path.
        return false;
    }

} // End of the main function.