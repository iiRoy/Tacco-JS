const findSet = p => { // This function implements the 'find' operation with path compression.
                               // It takes the parent array 'p' as an argument.

    return x => { // Returns an inner function that actually performs the find operation for a given element 'x'.
        // If the element 'x' is not its own parent,
        // it means we haven't reached the root of its set yet.
        // In this case, we perform path compression by setting
        // p[x] directly to the root of its set.
        if (x != p[x])
            p[x] = findSet(p)(p[x]); // Recursive call for path compression.

        // Return the representative (root) of the set that 'x' belongs to.
        return p[x];
    }
}


const link = (p, r) => { // This function implements the 'union' operation using union by rank heuristic.
                                 // It takes the parent array 'p' and rank array 'r' as arguments.

    return (x, y) => { // Returns an inner function that links two sets represented by elements 'x' and 'y'.

        // If the rank of set 'x' is greater than the rank of set 'y',
        // make 'x' the parent of 'y'.
        if (r[x] > r[y]) {
            p[y] = x;
        }
        else { // Otherwise, make 'y' the parent of 'x'.
            p[x] = y;

            // If the ranks were equal, increment the rank of the new root 'y'.
            if (r[x] === r[y]) {
                r[y]++;
            }
        }
    }
}


const dsFactory = n => { // This is a factory function to create a Disjoint Set Union (DSU) data structure.
                                 // It initializes 'n' disjoint sets, where each element is its own parent.

    this.p = []; // 'p' will store the parent of each element.
    this.r = []; // 'r' will store the rank of each set (used for union by rank).

    // Initialize each element to be its own parent and have a rank of 0.
    for (let i = 0; i < n; i++) {
        this.p[i] = i; // Element 'i' is initially its own parent.
        this.r[i] = 0; // The rank of each individual set is 0.
    }

    // Bind the findSet and link functions to the internal parent and rank arrays.
    this.findSet = findSet(this.p); // Pre-binds the parent array for 'find' operations.
    this.link = link(this.p, this.r); // Pre-binds parent and rank arrays for 'link' (union) operations.

    return { // Return an object with public methods for interacting with the DSU.
        same: (x, y) => this.findSet(x) === this.findSet(y), // Checks if two elements are in the same set.
        unite: (x, y) => this.link(this.findSet(x), this.findSet(y)) // Unites the sets containing 'x' and 'y'.
    }
}


// --- Main program execution starts here ---

// Read input from standard input.
const input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines.
const lines = input.split("\n");

// Parse the first line to get the number of elements 'n' and queries 'q'.
const [n, q] = lines.shift().split(" ").map(Number); // 'shift()' removes the first line from 'lines'.

// Create a new Disjoint Set Union instance with 'n' elements.
const ds = dsFactory(n);


// Process each remaining line as a query.
lines.forEach(x => { // Iterate over each query line.
    // Parse the query type 't' and the two elements 'a' and 'b'.
    const [t, a, b] = x.split(" ").map(Number);

    switch (t) { // Check the type of query.
        case 0: // Type 0 query: Unite the sets containing 'a' and 'b'.
            ds.unite(a, b);
            break; // Exit the switch statement.
        case 1: // Type 1 query: Check if 'a' and 'b' are in the same set.
            const ret = ds.same(a, b) ? 1 : 0; // '1' if same, '0' if different.
            console.log(ret); // Output the result to standard output.
            break; // Exit the switch statement.
    }
});