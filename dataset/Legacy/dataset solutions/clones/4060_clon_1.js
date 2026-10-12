/*
 * This file implements a Weighted Disjoint Set (Union-Find) data structure.
 * It is designed to track relationships between elements and associated weights.
 */


const Node = function (val) {

    // The value held by this node.
    this.val = val;

    // Initially, each node is its own parent (representing a set of size 1).
    this.parent = this;

    // Rank is used for union by rank optimization.
    this.rank = 1;

    /*
     * The weight of this node relative to its parent.
     * This is crucial for the "weighted" aspect of the Disjoint Set.
     */
    this.weight = 0; // 親に対してのweight
};


const WeightedDisjointSet = function () {

    // 'm' is a map (or array) to store Node instances, keyed by their values.
    this.m = [];
};


// Adds a new element to the disjoint set, creating a new set for it.
WeightedDisjointSet.prototype.add = function (val) {

    this.m[val] = new Node(val);
};


/*
 * Merges the sets containing val1 and val2.
 * It also incorporates the given weight into the structure.
 */
WeightedDisjointSet.prototype.merge = function (val1, val2, weight) {

    // Find the representatives (roots) of the sets containing val1 and val2.
    const p1 = this.find(val1);
    const p2 = this.find(val2);

    // Get the accumulated weights from the root to val1 and val2.
    const w1 = this.weight(val1);
    const w2 = this.weight(val2);

    // If both elements are already in the same set...
    if (p1 === p2) {
        // ...check if the provided weight is consistent with existing relations.
        if (w2 - w1 !== weight) {
            // If not, it indicates an inconsistency or a cycle with conflicting weights.
            throw Error("invalid weight");
        }
        // If consistent, no merge is needed.
        return;
    }

    // Perform union by rank. Attach the smaller rank tree under the root of the larger rank tree.
    if (p1.rank <= p2.rank) {
        // If ranks are equal, increment the rank of the new root.
        if (p1.rank == p2.rank) {
            p2.rank++;
        }
        // Make p2 the parent of p1.
        p1.parent = p2;
        // Update p1's weight relative to its new parent p2.
        p1.weight = -weight + w1 - w2;
    } else {
        // If p1's rank is greater, make p1 the parent of p2.
        p2.parent = p1;
        // Update p2's weight relative to its new parent p1.
        p2.weight = weight - w1 + w2;
    }
};


/*
 * Finds the representative (root) of the set containing 'val'.
 * This method also performs path compression and updates weights during traversal.
 */
WeightedDisjointSet.prototype.find = function (val) {

    let cur = this.m[val]; // Start from the node corresponding to 'val'.

    // If 'cur' is not the root of its set...
    if (cur.parent != cur) {

        // Recursively find the root of its parent's set.
        const root = this.find(cur.parent.val);

        // Add the parent's weight to 'cur's weight to reflect the new path to the root.
        cur.weight += cur.parent.weight;

        // Set 'cur's parent directly to the root (path compression).
        cur.parent = root;
    }

    // Return the representative (which is 'cur.parent' after compression, or 'cur' if it was already the root).
    return cur.parent;
};


/*
 * Calculates the difference in accumulated weights between val1 and val2
 * IF they are in the same set. Returns null otherwise.
 */
WeightedDisjointSet.prototype.diff = function (val1, val2) {

    // Find the roots for both elements.
    const p1 = this.find(val1);
    const p2 = this.find(val2);

    // If they are not in the same set, their relative weight is undefined.
    if (p1 != p2) {
        return null;
    }

    // If they are in the same set, the difference in their accumulated weights
    // relative to the common root gives their relative weight.
    return this.weight(val2) - this.weight(val1);
};


/*
 * Calculates the accumulated weight from the node 'val' up to its set's root.
 * This is a helper for 'merge' and 'diff' and does not perform path compression.
 */
WeightedDisjointSet.prototype.weight = function (val) {

    let weight = 0; // Initialize accumulated weight.
    let cur = this.m[val]; // Start from the node 'val'.

    // Traverse up the parent chain until the root is reached.
    while (cur.parent != cur) {

        weight += cur.weight; // Add current node's weight relative to its parent.
        cur = cur.parent; // Move to the parent.
    }

    // Return the total accumulated weight.
    return weight;
};


/*
 * Main execution block: reads input, processes it, and outputs "Yes" or "No".
 */
let input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split("\n");

let n, m, d; // Declare variables for number of elements, operations, and the Disjoint Set instance.


try {
    // Iterate through each line of input.
    for (let i = 0; i < lines.length; i++) {
        // The first line contains N and M.
        if (i === 0) {
            [n, m] = lines[i].split(" "); // Parse N and M.
            d = new WeightedDisjointSet(); // Initialize the Disjoint Set.
            // Add N elements to the Disjoint Set, each in its own set.
            for (let i = 0; i < n; i++) {
                d.add(i);
            }
        } else {
            // Subsequent lines contain X, Y, and W for merge operations.
            // Parse X, Y, W and convert them to integers.
            const [x, y, w] = lines[i].split(" ").map((v) => parseInt(v));
            // Perform the merge operation. Adjust indices (0-based).
            d.merge(x - 1, y - 1, w);
        }
    }
} catch (err) {
    // If an "invalid weight" error is thrown during merge, output "No".
    console.log("No");
    return; // Terminate execution.
}

// If all operations complete without an error, output "Yes".
console.log("Yes");