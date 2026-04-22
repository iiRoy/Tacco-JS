// This class facilitates the management of a collection of disjoint sets, enabling efficient
// union (merge) and find (root identification) operations, often used in graph algorithms.
class GroupManager {

  /**
   * Constructs a new Disjoint Set Union (DSU) data structure.
   * Each element initially resides in its own distinct set.
   * @param {number} totalItems The total count of elements the structure will manage.
   */
  constructor(totalItems) {
    // 'representatives[k]' stores the direct parent of element 'k'.
    // Initially, every element is its own parent, forming 'totalItems' singleton sets.
    this.representatives = new Array(totalItems).fill(undefined).map((_ignored, currentIdx) => currentIdx);

    // 'depths[k]' stores the rank or height of the tree rooted at 'k'.
    // This is used for the union-by-rank optimization to maintain balanced trees.
    this.depths = new Array(totalItems).fill(0);

    // 'memberCounts[k]' stores the total number of elements within the set whose root is 'k'.
    // This is used for the union-by-size optimization.
    this.memberCounts = new Array(totalItems).fill(1);
  }

  /**
   * Merges the sets that contain the two specified elements, 'elemX' and 'elemY'.
   * If they are already in the same set, no action is taken.
   * @param {number} elemX The first element.
   * @param {number} elemY The second element.
   */
  mergeSets(elemX, elemY) {
    // First, identify the root representative for each element's set.
    // Then, proceed to combine these two sets by linking their roots.
    this.fuseRepresentatives(this.getGroupRoot(elemX), this.getGroupRoot(elemY));
  }

  /**
   * Connects two sets by making one root a child of the other.
   * This method applies either a union-by-rank or union-by-size heuristic
   * to maintain the efficiency of the DSU structure.
   * @param {number} rootOne The representative (root) of the first set.
   * @param {number} rootTwo The representative (root) of the second set.
   * @returns {void} No explicit return value; performs a side effect.
   */
  fuseRepresentatives(rootOne, rootTwo) {
    // If both elements already share the same root, they are in the same set.
    // Therefore, no merging operation is required.
    if (rootOne === rootTwo) {
      return; // Exit early as sets are identical.
    }

    // Apply the union-by-rank heuristic: attach the tree with the smaller rank
    // under the root of the tree with the larger rank.
    if (this.depths[rootOne] > this.depths[rootTwo]) {
      this.representatives[rootTwo] = rootOne; // 'rootOne' becomes the new parent of 'rootTwo'.
      this.memberCounts[rootOne] += this.memberCounts[rootTwo]; // Update the size of the combined set.
    } else {
      this.representatives[rootOne] = rootTwo; // 'rootTwo' becomes the new parent of 'rootOne'.
      this.memberCounts[rootTwo] += this.memberCounts[rootOne]; // Update the size of the combined set.

      // If the ranks were initially equal, increment the rank of the new root.
      // This is crucial for maintaining the logarithmic height property.
      if (this.depths[rootOne] === this.depths[rootTwo]) {
        this.depths[rootTwo]++;
      }
    }
  }

  /**
   * Determines the representative (root) of the set to which a given element belongs.
   * This method incorporates path compression optimization to flatten the tree structure
   * during traversal, making future 'find' operations faster.
   * @param {number} specificItem The element for which to find the set representative.
   * @returns {number} The integer identifier of the set's representative.
   */
  getGroupRoot(specificItem) {
    // If the element's parent pointer points to itself, it is the root of its set.
    if (this.representatives[specificItem] === specificItem) {
      return specificItem;
    }
    // Otherwise, recursively find the root and compress the path:
    // Make the element point directly to the found root.
    this.representatives[specificItem] = this.getGroupRoot(this.representatives[specificItem]);
    return this.representatives[specificItem];
  }
}


/**
 * The primary execution point of the program.
 * It parses input data, performs a sequence of DSU operations, and prints the final result.
 * @param {string} sourceData The complete input string read from stdin.
 */
const runSolution = (sourceData) => {
  // Normalize the input: remove leading/trailing whitespace and split into individual lines.
  const [initialConfig, ...commandBatch] = sourceData.trim().split('\n');

  // Parse the initial configuration line, which typically contains
  // the total number of entities and the number of operations (though the latter isn't explicitly used here).
  const [totalEntities, numOperations] = initialConfig.split(' ').map(Number);

  // Initialize the Disjoint Set Manager with the specified number of entities.
  const setManager = new GroupManager(totalEntities);

  // Process each command from the batch. Each command typically represents a merge operation.
  for (let currentOpIndex = 0; currentOpIndex < commandBatch.length; currentOpIndex++) {
    // Extract the two entity identifiers from the current command line.
    const [nodeOne, nodeTwo] = commandBatch[currentOpIndex].split(' ').map(Number);

    // Execute the merge operation. Node identifiers are adjusted for 0-based indexing.
    setManager.mergeSets(nodeOne - 1, nodeTwo - 1);
  }

  // Calculate and output the result.
  // The problem's specific requirement is to count the number of unique parent pointers
  // found in the `representatives` array after all operations, and then subtract one.
  // This might correspond to a specific graph property or problem formulation.
  console.log(new Set(setManager.representatives).size - 1);
};


// This conditional block determines how the program receives its input.
// It checks for a 'MYTEST' environment variable to switch between test mode,
// reading from a specific file, or reading from the standard input.
process.env.MYTEST
  ? (process.env.MYTEST === 'test' // Is the environment variable 'MYTEST' set to 'test'?
    ? test() // If yes, execute a test function (not defined in this snippet).
    : runSolution(require('fs').readFileSync('dev/stdin', 'utf8')) // Otherwise, read input from 'dev/stdin'.
  )
  : runSolution(require('fs').readFileSync('/dev/stdin', 'utf8')); // If 'MYTEST' is not set at all, read input from '/dev/stdin'.