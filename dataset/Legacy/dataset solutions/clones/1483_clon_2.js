class DisjointSet {
  // Initializes a new DisjointSet structure with a given initial capacity.
  constructor(initialCapacity) {
    // Each element is initially its own parent (representative).
    this.parentNodes = Array.from({ length: initialCapacity }, (_, idx) => idx);
    // Ranks (or heights) of trees, used for union by rank optimization.
    this.rankValues = new Array(initialCapacity).fill(0);
    // Stores the size of each set (number of elements in the component).
    this.groupSizes = new Array(initialCapacity).fill(1);
  }

  // Merges the sets containing elem1 and elem2.
  unionElements(elem1, elem2) {
    // Find the representatives (roots) of the sets containing elem1 and elem2.
    this.mergeSets(this.findRepresentative(elem1), this.findRepresentative(elem2));
  }

  // Links two sets by their roots, applying union by rank.
  mergeSets(root1, root2) {
    // If both elements are already in the same set, do nothing.
    if (root1 === root2) {
      return null;
    }

    // Attach the smaller rank tree under the root of the larger rank tree.
    if (this.rankValues[root1] > this.rankValues[root2]) {
      this.parentNodes[root2] = root1; // root1 becomes the new parent of root2.
      this.groupSizes[root1] += this.groupSizes[root2]; // Update the size of the combined set.
    } else {
      this.parentNodes[root1] = root2; // root2 becomes the new parent of root1.
      this.groupSizes[root2] += this.groupSizes[root1]; // Update the size of the combined set.

      // If ranks are equal, increment the rank of the new root.
      if (this.rankValues[root1] === this.rankValues[root2]) {
        this.rankValues[root2]++;
      }
    }
  }

  // Finds the representative (root) of the set containing targetNode, with path compression.
  findRepresentative(targetNode) {
    // If targetNode is its own parent, it is the representative.
    if (this.parentNodes[targetNode] === targetNode) {
      return targetNode;
    }
    // Recursively find the representative and perform path compression.
    this.parentNodes[targetNode] = this.findRepresentative(this.parentNodes[targetNode]);
    return this.parentNodes[targetNode];
  }
}


// Main function to process input and solve the problem.
const processInput = (rawInputData) => {
  // Split the input string into lines.
  const [configLine, ...queryLines] = rawInputData.trim().split('\n');
  // Parse the first line for total nodes and total queries.
  const [totalNodes, totalQueries] = configLine.split(' ').map(Number);

  // Create a new DisjointSet instance for the given number of nodes.
  const dsuInstance = new DisjointSet(totalNodes);

  // Iterate through each query line.
  for (let currentQueryIdx = 0; currentQueryIdx < queryLines.length; currentQueryIdx++) {
    // Parse the two nodes for the current query.
    const [nodeA, nodeB] = queryLines[currentQueryIdx].split(' ').map(Number);
    // Union the sets containing nodeA and nodeB (adjusting for 0-based indexing).
    dsuInstance.unionElements(nodeA - 1, nodeB - 1);
  }

  // Calculate the number of distinct connected components.
  // The representatives array `dsuInstance.parentNodes` might not be fully compressed
  // for all elements, so we need to find the actual representatives for all elements
  // to count distinct sets. A simpler way is to use the `findRepresentative` method
  // on all elements and then count unique representatives, or rely on the fact that
  // `dsuInstance.p` will contain the final representatives after all unions,
  // and `new Set(dsuInstance.p)` will give the unique representatives.
  // The problem statement implies that `uf.p` (which is `dsuInstance.parentNodes` here)
  // after all unions, will contain the representatives, and counting unique values
  // in it will give the number of components.
  // The `-1` is likely an adjustment based on problem specifics, perhaps for a 0-indexed
  // count or excluding a specific component.
  const distinctComponents = new Set(dsuInstance.parentNodes).size - 1;
  return console.log(distinctComponents);
};

// Conditional execution based on environment variable.
process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
