/*
 * This file contains a JavaScript implementation of the Union-Find data structure,
 * also known as a Disjoint Set Union (DSU).
 * It supports operations like `unite` (union) and `findSet` (find representative).
 */
class UnionFind {
  // The 'p' array stores the parent of each element.
  // Initially, each element is its own parent.
  p;

  // The 'height' array stores the rank/height of each tree,
  // used for union by rank optimization.
  height;

  // The 'size' array stores the size of each set (number of elements),
  // useful for union by size optimization or querying set sizes.
  size;

  /**
   * Initializes a new UnionFind structure with 'n' elements.
   * Each element is initially in its own disjoint set.
   * @param {number} n The total number of elements.
   */
  constructor(n) {
    // Initialize parent array: p[i] = i for all i
    this.p = new Array(n).fill(null).map((_, i) => i);

    // Initialize height array: all heights are 0 initially
    this.height = new Array(n).fill(0);

    // Initialize size array: all sizes are 1 initially (each element is a set of size 1)
    this.size = new Array(n).fill(1);
  }

  /**
   * Unites the sets containing elements 'a' and 'b'.
   * It first finds the representative of each element's set,
   * then links these two sets.
   * @param {number} a The first element.
   * @param {number} b The second element.
   */
  unite(a, b) {
    // Find the representatives of the sets containing 'a' and 'b'
    let rootA = this.findSet(a);
    let rootB = this.findSet(b);

    // Link the two sets using their representatives
    this.link(rootA, rootB);
  }

  /**
   * Links two sets represented by their roots 'a' and 'b'.
   * This method implements the union by height (rank) optimization.
   * @param {number} a The representative of the first set.
   * @param {number} b The representative of the second set.
   * @returns {null} Returns null if the sets are already the same, otherwise performs union.
   */
  link(a, b) {
    // If 'a' and 'b' are already in the same set (have the same representative), do nothing.
    if (a === b) {
      return null;
    }

    // Union by height optimization: attach the shorter tree under the root of the taller tree.
    if (this.height[a] > this.height[b]) {
      // If set 'a' is taller, make 'a' the parent of 'b'.
      this.p[b] = a;
      // Update the size of the new combined set.
      this.size[a] += this.size[b];
    } else {
      // If set 'b' is taller or they have equal heights, make 'b' the parent of 'a'.
      this.p[a] = b;
      // Update the size of the new combined set.
      this.size[b] += this.size[a];

      // If their heights were equal, the height of the new root increases.
      if (this.height[a] === this.height[b]) {
        this.height[b]++;
      }
    }
  }

  /**
   * Finds the representative (root) of the set containing element 'x'.
   * This method implements path compression optimization.
   * @param {number} x The element to find the set representative for.
   * @returns {number} The representative of the set containing 'x'.
   */
  findSet(x) {
    // Base case: If 'x' is its own parent, it is the representative of its set.
    if (this.p[x] === x) {
      return x;
    }

    // Recursive step with path compression:
    // Set the parent of 'x' directly to the root of its set,
    // thereby flattening the tree structure for future lookups.
    this.p[x] = this.findSet(this.p[x]);

    // Return the representative.
    return this.p[x];
  }
}

/**
 * The main function that processes the input and performs Union-Find operations.
 * It reads queries, unites elements, and then outputs the number of disjoint sets.
 * @param {string} input The raw input string from stdin.
 */
const main = (input) => {
  // Split the input into lines and trim whitespace.
  const [tLine, ...queryLines] = input.trim().split('\n');

  // Parse the first line to get the number of elements (n) and number of queries (m).
  const [nElements, mQueries] = tLine.split(' ').map(Number);

  // Initialize a UnionFind structure with 'n' elements.
  const ufInstance = new UnionFind(nElements);

  // Iterate through each query line.
  for (let i = 0; i < queryLines.length; i++) {
    // Parse the current query to get the two elements to unite.
    const [elementA, elementB] = queryLines[i].split(' ').map(Number);

    // Unite the sets containing (elementA - 1) and (elementB - 1).
    // Subtracting 1 because input is 1-indexed, but arrays are 0-indexed.
    ufInstance.unite(elementA - 1, elementB - 1);
  }

  // Calculate the number of disjoint sets.
  // This is done by finding all representatives in the 'p' array (after path compression)
  // and counting the unique ones.
  // The 'new Set(ufInstance.p).size' gives the number of unique parent pointers,
  // which effectively represents the number of disjoint sets.
  // We subtract 1 because the problem context often implies counting distinct components,
  // and this specific solution might be tailored to a context where one is subtracted,
  // or it's a common way to count components after all unions are done.
  const numberOfDisjointSets = new Set(ufInstance.p).size;

  // Log the result to the console.
  return console.log(numberOfDisjointSets - 1);
};

// This block handles the execution environment.
// It checks for a 'MYTEST' environment variable.
process.env.MYTEST
  ? // If 'MYTEST' is set:
    (
      // If 'MYTEST' is 'test', execute a hypothetical 'test()' function.
      process.env.MYTEST === 'test'
        ? test()
        : // Otherwise, read from 'dev/stdin' and pass to 'main'.
          main(require('fs').readFileSync('dev/stdin', 'utf8'))
    )
  : // If 'MYTEST' is not set, read from '/dev/stdin' and pass to 'main'.
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));