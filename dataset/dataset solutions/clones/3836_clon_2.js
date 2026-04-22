"use strict";

class DisjointSet {
  // parentArray[idx]: stores the parent index of element 'idx'. For example, parentArray[3] = 2 means the parent of element 3 is 2.

  constructor(totalElements) { // Initializes the structure; initially, every element is its own parent (a root of its own set).
    this.parentArray = Array.from({
      length: totalElements
    }, (value, index) => index);
  }


  // Recursively locates the representative (root) of the set that 'item' belongs to.
  // This method also performs path compression for efficiency.
  findRepresentative(item) {

    if (this.parentArray[item] === item) {
      return item; // If 'item' is its own parent, it is the representative of its set.
    }

    // Otherwise, recursively find the representative of its parent and update 'item''s parent directly.
    return this.parentArray[item] = this.findRepresentative(this.parentArray[item]);
  }


  // Merges the sets containing 'nodeA' and 'nodeB' into a single set.
  mergeSets(nodeA, nodeB) {
    let repA = this.findRepresentative(nodeA); // Obtain the representative of 'nodeA'.
    let repB = this.findRepresentative(nodeB); // Obtain the representative of 'nodeB'.

    if (repA === repB) {
      return; // If both nodes already share the same representative, they are in the same set, so no action is needed.
    }
    this.parentArray[repA] = repB; // Otherwise, connect the set of 'repA' to the set of 'repB'.
  }


  // Determines if 'nodeA' and 'nodeB' are part of the same connected set.
  areConnected(nodeA, nodeB) {
    const repA = this.findRepresentative(nodeA); // Find the representative for 'nodeA'.
    const repB = this.findRepresentative(nodeB); // Find the representative for 'nodeB'.

    return repA === repB; // Returns true if their representatives are identical, indicating they are in the same set.
  }
}


function ProcessInput(rawData) {
  let contentRows = rawData.split("\n"); // Divides the incoming raw text into an array of individual lines.
  let initialParameters = contentRows.shift().split(/\s+/).map(currentValue => parseInt(currentValue, 10)); // Parses the first line to get two integer parameters.
  let elementCount = initialParameters[0]; // The first parameter, often representing the total number of elements (N).
  let operationCount = initialParameters[1]; // The second parameter, often representing the number of operations (M).

  let groupHandler = new DisjointSet(elementCount); // Creates an instance of the DisjointSet data structure with 'elementCount' items.
  let targetPermutation = contentRows.shift().split(/\s+/).map(val => parseInt(val, 10)); // Parses the next line to form an array of target mappings.

  for (let k = 0; k < operationCount; k++) { // Executes 'operationCount' number of merging operations.
    let [nodeOne, nodeTwo] = contentRows.shift().split(/\s+/).map(val => parseInt(val, 10)); // Reads two node identifiers from the current line.
    groupHandler.mergeSets(nodeOne - 1, nodeTwo - 1); // Merges the sets containing the two nodes, adjusting for zero-based indexing.
  }

  let matchedPairsCount = 0; // Initializes a counter for specific matching conditions.
  for (let k = 0; k < elementCount; k++) { // Iterates through each element from 0 up to 'elementCount' - 1.
    if (groupHandler.areConnected(k, targetPermutation[k] - 1)) { // Checks if the current element 'k' and its corresponding mapped target (adjusted for indexing) are in the same set.
      matchedPairsCount++; // If they are connected, increments the counter.
    }
  }

  console.log(matchedPairsCount); // Prints the final accumulated count to the console.
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));