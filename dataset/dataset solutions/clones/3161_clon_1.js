var GET = ( /* This is an Immediately Invoked Function Expression (IIFE) */ function () {

    /*
     * Factory function to create a new input reader instance.
     * @param {string} s - The raw input string.
     * @returns {g} A new input reader object.
     */
    function f(s) {

        return new g(s); // Return a new instance of the internal 'g' class.

    }


    /*
     * Constructor for the input reader object.
     * It processes the raw input string into lines.
     * @param {string} s - The raw input string.
     */
    function g(s) {
        // Store lines of input, trimming each line.
        this._s = s.trim().split("\n");
        // Initialize the current line index.
        this._y = 0;
    }


    // --- Prototype methods for the input reader 'g' ---

    /*
     * Reads a single item from the current line.
     * If the line is not yet processed, it's split and reversed.
     * @param {boolean} f - If true, return as string; otherwise, parse as number.
     * @returns {string|number} The read item.
     */
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the stored lines.
            y = this._y, // Current line index.
            r;           // Variable to hold the result.

        // Check if the current line needs to be split.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse(); // Split by space and reverse for easy popping.
        }

        r = s[y].pop(); // Get the last element (original first element) from the current line.

        // If the current line is exhausted, move to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, either as string or parsed number.
        return f ? r : +r;
    };


    /*
     * Reads an entire line of space-separated items.
     * @param {boolean} f - If true, return as strings; otherwise, parse as numbers.
     * @returns {string[]|number[]} An array of items from the line.
     */
    g.prototype.l = function (f) {
        // Get the current line, split it by space, and then increment the line index.
        var s = this._s[this._y++].split(" ");

        // Return the array, optionally parsing elements to numbers.
        return f ? s : s.map(a => +a);
    };


    /*
     * Reads a matrix (multiple lines, each with space-separated items).
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return as strings; otherwise, parse as numbers.
     * @returns {string[][]|number[][]} A 2D array representing the matrix.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines, split each line by space.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, optionally parsing elements to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };


    /*
     * Reads 'n' lines as raw strings or numbers.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return as strings; otherwise, parse as numbers.
     * @returns {string[]|number[]} An array of lines.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the input.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array, optionally parsing elements to numbers.
        return f ? r : r.map(a => +a);
    };


    return f; // The factory function `f` is the public interface of the GET module.

})();
// --- End of GET module ---


// Initialize the input reader 'o' by reading from standard input.
// This assumes the environment provides 'require("fs")'.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// --- Union-Find Data Structure Definition ---

/*
 * Constructor for the Union-Find data structure.
 * Initializes 'n' disjoint sets.
 * @param {number} n - The number of elements.
 */
function unionFind(n) {
    // 'a' array stores parent pointers (or negative size for roots).
    this.a = Array(n + 1).fill(-1);
}


/*
 * Prototype methods for the Union-Find data structure.
 */
unionFind.prototype = {

    /*
     * Finds the root of the set containing element 'i' with path compression.
     * @param {number} i - The element to find the root for.
     * @returns {number} The root of the set.
     */
    root: function (i) {
        // If 'i' is a root (value is negative), return 'i'.
        // Otherwise, recursively find the root and compress the path.
        return this.a[i] < 0 ? i : (this.a[i] = this.root(this.a[i]));
    },


    /*
     * Checks if two elements are in the same set.
     * @param {number} x - The first element.
     * @param {number} y - The second element.
     * @returns {boolean} True if they are in the same set, false otherwise.
     */
    same: function (x, y) {
        return this.root(x) === this.root(y);
    },


    /*
     * Unites the sets containing elements 'x' and 'y'.
     * Uses union by size/rank heuristic.
     * @param {number} x - The first element.
     * @param {number} y - The second element.
     */
    unite: function (x, y) {
        x = this.root(x); // Find root of x.
        y = this.root(y); // Find root of y.

        if (x === y) {
            return; // Already in the same set, nothing to do.
        }

        // Union by size heuristic: attach smaller tree to root of larger tree.
        if (this.a[x] >= this.a[y]) {
            // y's tree is larger or equal (more negative value means larger size).
            this.a[y] += this.a[x]; // Update size of new root (y).
            this.a[x] = y;           // Make y the parent of x.
        } else {
            // x's tree is larger.
            this.a[x] += this.a[y]; // Update size of new root (x).
            this.a[y] = x;           // Make x the parent of y.
        }
    },


    /*
     * Returns the size of the set containing element 'i'.
     * @param {number} i - The element.
     * @returns {number} The size of its set.
     */
    size: function (i) {
        // The size is stored as the negative value at the root.
        return -this.a[this.root(i)];
    },

}; // End of unionFind.prototype


// Execute the main logic and print the result to the console.
console.log(main());


// --- Main Function Definition ---

/*
 * The primary logic of the program.
 * Reads input, performs calculations using Union-Find, and returns the result.
 * @returns {string} The final answer, joined by newlines.
 */
function main() {
    // Read the number of nodes (n) and edges (m).
    var n = o.a();
    var m = o.a();

    // Read 'm' edges, each represented as an array of two numbers.
    var a = o.m(m);

    // Initialize an array to store the answers for each step.
    var ans = Array(m);

    // Create a new Union-Find instance with 'n' elements.
    var uf = new unionFind(n);

    // Calculate the initial number of unconnected pairs (total possible pairs).
    // This is for the state before any edges are considered.
    ans[m - 1] = n * (n - 1) / 2;

    // Iterate through the edges in reverse order.
    // This simulates removing edges one by one from a fully connected graph.
    for (var i = m - 1; i > 0; i--) {

        var currentEdgeNode1 = a[i][0];
        var currentEdgeNode2 = a[i][1];

        // Check if the two nodes of the current edge are already in the same connected component.
        if (uf.same(currentEdgeNode1, currentEdgeNode2)) {
            // If they are, adding/removing this edge doesn't change the number of unconnected pairs.
            ans[i - 1] = ans[i];
        } else {
            // If they are in different components, uniting them reduces the number of unconnected pairs.

            // Calculate the product of the sizes of the two components.
            // This product represents the number of pairs that become connected by adding this edge.
            var s = uf.size(currentEdgeNode1) * uf.size(currentEdgeNode2);

            // Subtract this quantity from the previous count of unconnected pairs.
            ans[i - 1] = ans[i] - s;

            // Unite the two components.
            uf.unite(currentEdgeNode1, currentEdgeNode2);
        }
    }

    // Join the calculated answers with newline characters and return.
    return ans.join("\n");

} // End of main function