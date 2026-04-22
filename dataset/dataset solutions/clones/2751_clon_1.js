var GET = ( /* This is a self-invoking function that creates a utility for reading input. */
    function () {

        // The main factory function 'f' that creates a new reader instance.
        function f(s) {
            return new g(s);
        }

        // The constructor 'g' for the input reader.
        function g(s) {
            // Trim whitespace from the input string and split it into an array of lines.
            this._s = s.trim()
                .split("\n");
            // Initialize the current line index.
            this._y = 0;
        }

        // Prototype methods for the 'g' (GET) object.

        /*
         * Reads a single element from the current line.
         * If the current line hasn't been processed, it reverses and splits it.
         * 'f' flag indicates whether to return as string (true) or number (false/undefined).
         */
        g.prototype.a = function (f) {
            var s = this._s, // Reference to the array of lines.
                y = this._y, // Current line index.
                r; // Variable to hold the result.

            // Check if the current line is a string and needs processing.
            if (typeof s[y] === "string") {
                s[y] = s[y]
                    .split(" ")
                    .reverse(); // Split by space and reverse to pop elements from the end.
            }

            r = s[y].pop(); // Get the last element from the current line.

            // If the current line is empty after popping, move to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // Return as string or convert to number based on the 'f' flag.
            return f ? r : +r;
        };

        /*
         * Reads an entire line of elements.
         * Increments the line index after reading.
         * 'f' flag indicates whether to return elements as strings (true) or numbers (false/undefined).
         */
        g.prototype.l = function (f) {
            var s = this._s[this._y++] // Get the current line and then increment the line index.
                .split(" "); // Split the line by spaces.

            // Return as strings or convert all elements to numbers.
            return f ? s : s
                .map(a => +a);
        };

        /*
         * Reads 'n' lines as a 2D array (matrix).
         * 'f' flag indicates whether to return elements as strings (true) or numbers (false/undefined).
         */
        g.prototype.m = function (n, f) {
            var r = this._s
                .slice(this._y, this._y += n) // Extract 'n' lines and update the line index.
                .map(a => a.split(" ")); // Split each line into an array of strings.

            // Return as strings or convert all elements in the matrix to numbers.
            return f ? r : r
                .map(a => a.map(a => +a));
        };

        /*
         * Reads 'n' lines, each as a single element.
         * 'f' flag indicates whether to return as strings (true) or numbers (false/undefined).
         */
        g.prototype.r = function (n, f) {
            var r = this._s
                .slice(this._y, this._y += n); // Extract 'n' lines and update the line index.

            // Return as strings or convert all elements to numbers.
            return f ? r : r
                .map(a => +a);
        };

        // Return the factory function 'f'.
        return f;
    })();


// Initialize the input reader 'o' by reading from standard input.
var o = GET(
    require("fs")
    .readFileSync(
        "/dev/stdin", // Path to standard input.
        "utf8" // Encoding.
    )
);


/*
 * Generates a multi-dimensional array initialization string.
 * 'v' is the initial value for the innermost array elements.
 * Subsequent arguments are the dimensions of the array.
 * Example: xArray("[]", 3, 2) => Array(3).fill(0).map(x=>Array(2).fill(0).map(x=>[]))
 */
function xArray(v) {
    var a = arguments, // All arguments passed to the function.
        l = a.length, // Number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array definition.

    // Loop to build up the outer array definitions.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
}


/*
 * Constructor for a Union-Find data structure.
 * Initializes 'n' elements, each in its own set.
 */
function unionFind(n) {
    // 'a' stores the parent of each element, or the negative size of the set if it's a root.
    this.a = Array(n + 1)
        .fill(-1);
}

// Prototype methods for the Union-Find data structure.
unionFind.prototype = {

    /*
     * Finds the root of the set containing element 'i'.
     * Uses path compression for optimization.
     */
    root: function (i) {
        // If 'a[i]' is negative, 'i' is a root.
        // Otherwise, recursively find the root and compress the path.
        return this.a[i] < 0 ? i : (this.a[i] = this.root(this.a[i]));
    },

    /*
     * Checks if two elements 'x' and 'y' are in the same set.
     */
    same: function (x, y) {
        return this.root(x) === this.root(y);
    },

    /*
     * Unites the sets containing elements 'x' and 'y'.
     * Returns 1 if a union occurred, 0 otherwise (if they were already in the same set).
     */
    unite: function (x, y) {
        x = this.root(x); // Find the root of x.
        y = this.root(y); // Find the root of y.

        if (x === y) {
            return 0; // Already in the same set, no union needed.
        }

        // Union by size (rank). Attach smaller tree to the root of the larger tree.
        if (this.a[y] <= this.a[x]) {
            this.a[y] += this.a[x]; // Update size of new root (y).
            this.a[x] = y; // Make y the parent of x.
        } else {
            this.a[x] += this.a[y]; // Update size of new root (x).
            this.a[y] = x; // Make x the parent of y.
        }

        return 1; // Union successful.
    },

    /*
     * Returns the size of the set containing element 'i'.
     */
    size: function (i) {
        return -this.a[this.root(i)]; // The size is the negative of the root's value.
    },
};


// Execute the main function and print its result to the console.
console.log(main());


/*
 * Main function containing the problem logic.
 */
function main() {
    var n = o.a(); // Read the number of nodes.
    var m = o.a(); // Read the number of edges.

    // If the number of edges is odd, it's impossible to form pairs, so return -1.
    if (m & 1) {
        return -1;
    }

    var a = o.m(m); // Read 'm' edges, each as a pair [u, v].

    var uf = new unionFind(n); // Initialize Union-Find structure for 'n' nodes.

    var ans = []; // Array to store the resulting paired edges.

    // e will store adjacency lists for nodes within the same connected component
    // that are *not* part of the spanning forest initially formed by `unite`.
    var e = xArray("[]", n + 1);

    // w tracks the parity of edges connected to each node in the spanning forest.
    // 0: even, 1: odd.
    var w = xArray(0, n + 1);

    // Process each edge.
    for (var i = 0; i < m; i++) {
        var u = a[i][0], // First node of the edge.
            v = a[i][1]; // Second node of the edge.

        // Try to unite the components of u and v.
        if (uf.unite(u, v)) {
            // If they were in different components and united, this edge is part of the spanning forest.
            ans.push(u + " " + v); // Add this edge to the answer.
            w[u] ^= 1; // Flip the parity count for node u.
            w[v] ^= 1; // Flip the parity count for node v.
        } else {
            // If they were already in the same component, this is a back-edge.
            // Add it to the adjacency list 'e' for later processing.
            e[u].push(v);
            e[v].push(u);
        }
    }

    // Perform a Depth-First Search starting from node 1 (assuming nodes are 1-indexed)
    // to process the back-edges and adjust parities.
    dfs(1, 0); // 0 is used as a dummy parent for the root of the DFS.

    // Join the collected edges with newline characters and return the result.
    return ans.join("\n");

    /*
     * Depth-First Search function to process edges and ensure parity.
     * 'v' is the current node, 'p' is its parent in the DFS tree.
     */
    function dfs(v, p) {
        // Iterate over neighbors of the current node 'v' from the 'e' adjacency list.
        for (var V of e[v]) {
            if (V === p) {
                continue; // Skip the parent to avoid going back up the tree.
            }
            dfs(V, v); // Recursively call DFS for the child node.
        }

        // If 'v' is the root of the DFS (parent is 0), nothing more to do for pairing.
        if (p === 0) {
            return;
        }

        // If the parity count for node 'v' is 1 (odd), it means 'v' needs one more edge
        // to balance its parity. We pair it with its parent 'p'.
        if (w[v]) {
            ans.push(v + " " + p); // Add edge (v, p) to the answer.
            w[v] ^= 1; // Flip parity for v (now even).
            w[p] ^= 1; // Flip parity for p.
        } else {
            // If the parity count for node 'v' is 0 (even), it doesn't need an edge
            // from its parent. We pair the parent 'p' with 'v'.
            ans.push(p + " " + v); // Add edge (p, v) to the answer.
            w[p] ^= 1; // Flip parity for p.
            w[v] ^= 1; // Flip parity for v (remains even).
        }
    }
}