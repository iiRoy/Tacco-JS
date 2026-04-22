function ProcessInputData(incomingText) {
  // Normalize input data: trim, split into lines, then split each line by space
  let formattedLines = incomingText.trim().split("\n").map(function(textSegment) {
    return textSegment.split(" ");
  });

  // Parse the first line to get the number of elements and relationships
  let countOfEntities = parseInt(formattedLines[0][0], 10);
  let countOfRelations = parseInt(formattedLines[0][1], 10);

  // Initialize a Disjoint Set data structure with the given number of entities
  var disjointSetStructure = new DisjointSet(countOfEntities);
  let currentRelation;

  // Iterate through each relation to perform union operations
  for (let relationIndex = 0; relationIndex < countOfRelations; relationIndex++) {
    // Convert current relation's elements from string to integer
    currentRelation = formattedLines[relationIndex + 1].map(elementString => parseInt(elementString, 10));

    // Perform union on the two entities involved in the relation (adjusting for 0-based indexing)
    disjointSetStructure.uniteComponents(currentRelation[0] - 1, currentRelation[1] - 1);
  }

  // Count the number of distinct components (sets)
  let distinctComponentCount = 0;
  for (let entityIndex = 0; entityIndex < countOfEntities; entityIndex++) {
    // If an entity is its own representative, it's the root of a distinct component
    if (disjointSetStructure.findRepresentative(entityIndex) === entityIndex) {
      distinctComponentCount++;
    }
  }

  // Output the final count of distinct components
  console.log(distinctComponentCount);
}


function DisjointSet(initialSize) {
  // Initialize an array to store parent links for each element
  this.parentLinks = new Array(initialSize);
  // Each element is initially its own set (represented by -1, indicating size 1)
  for (let nodeIdx = 0; nodeIdx < initialSize; nodeIdx++) {
    this.parentLinks[nodeIdx] = -1;
  }
}

DisjointSet.prototype.findRepresentative = function(targetNode) {
  // If the element's parent link is negative, it's a root (and its value is -size)
  if (this.parentLinks[targetNode] < 0) {
    return targetNode;
  }
  // Otherwise, recursively find the root and perform path compression
  return this.parentLinks[targetNode] = this.findRepresentative(this.parentLinks[targetNode]);
};


DisjointSet.prototype.uniteComponents = function(nodeA, nodeB) {
  // Find the representatives (roots) of the components containing nodeA and nodeB
  nodeA = this.findRepresentative(nodeA);
  nodeB = this.findRepresentative(nodeB);

  // If they are already in the same component, do nothing
  if (nodeA === nodeB) {
    return;
  }

  // Union by size/rank: attach the smaller tree under the root of the larger tree
  // If nodeA's component is smaller (more negative size), swap to ensure nodeA is the larger
  if (this.parentLinks[nodeA] > this.parentLinks[nodeB]) {
    [nodeA, nodeB] = [nodeB, nodeA];
  }

  // Update the size of the new root component
  this.parentLinks[nodeA] += this.parentLinks[nodeB];
  // Set the parent of the smaller component's root to the larger component's root
  this.parentLinks[nodeB] = nodeA;
};


DisjointSet.prototype.getComponentSize = function(queryNode) {
  // Find the representative of the component containing the queryNode
  queryNode = this.findRepresentative(queryNode);
  // The size of the component is stored as a negative value at its root
  return this.parentLinks[queryNode] * -1;
};


// Execute the main processing function by reading input from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));