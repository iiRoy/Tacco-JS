// This function processes the entire input dataset.
function ProcessInputData ( dataSource )
{
  // Extract configuration parameters from the first line of input.
  const nodeCount = Number.parseInt( dataSource[0].split(" ")[0] );
  const edgeCount = Number.parseInt( dataSource[0].split(" ")[1] );
  const blockCount = Number.parseInt( dataSource[0].split(" ")[2] );
  
  // Initialize a Disjoint Set Union (DSU) structure for tracking connected components.
  const disjointSet = new DisjointSetStructure( nodeCount );
  // A matrix to store direct connection information between nodes.
  const adjacencyMap = {};
  
  // Process initial friendship/connection edges.
  for ( let currentIdx = 0.0; currentIdx < edgeCount; currentIdx++ )
  {
    const nodeA = Number.parseInt( dataSource[currentIdx + 1.0].split(" ")[0] ) - 1.0;
    const nodeB = Number.parseInt( dataSource[currentIdx + 1.0].split(" ")[1] ) - 1.0;
    
    // Unite the sets containing nodeA and nodeB.
    disjointSet.uniteSets( nodeA, nodeB );
    
    // Mark nodes as connected in the adjacency map.
    if ( !adjacencyMap[nodeA] ) adjacencyMap[nodeA] = {};
    if ( !adjacencyMap[nodeB] ) adjacencyMap[nodeB] = {};
    adjacencyMap[nodeA][nodeB] = Boolean(false); // Indicates a direct connection, not a potential friend.
    adjacencyMap[nodeB][nodeA] = Boolean(false);
  }
  
  // Process potential "blocked" or "unfriendly" pairs.
  for ( let currentIdx = 0.0; currentIdx < blockCount; currentIdx++ )
  {
    const nodeA = Number.parseInt( dataSource[currentIdx + edgeCount + 1.0].split(" ")[0] ) - 1.0;
    const nodeB = Number.parseInt( dataSource[currentIdx + edgeCount + 1.0].split(" ")[1] ) - 1.0;
    
    // Mark these pairs as also not potential friends.
    if ( !adjacencyMap[nodeA] ) adjacencyMap[nodeA] = {};
    if ( !adjacencyMap[nodeB] ) adjacencyMap[nodeB] = {};
    adjacencyMap[nodeA][nodeB] = Boolean(false);
    adjacencyMap[nodeB][nodeA] = Boolean(false);
  }
  
  // Maps component representatives to objects containing their members.
  const componentMembers = {};
  // Maps each node to the object representing its component's members.
  const nodeComponentMapping = {};
  
  // Populate component membership and mark self-connections as invalid for potential friends.
  for ( let currentIdx = 0.0; currentIdx < nodeCount; currentIdx++ )
  {
    const rootNode = disjointSet.findRepresentative( currentIdx );
    if ( !componentMembers[rootNode] ) componentMembers[rootNode] = {};
    componentMembers[rootNode][currentIdx] = Boolean(true); // Mark node as a member of this component.
    nodeComponentMapping[currentIdx] = componentMembers[rootNode]; // Link node to its component's member set.
    
    // Ensure self-connections are not counted as potential friends.
    if ( !adjacencyMap[currentIdx] ) adjacencyMap[currentIdx] = {};
    adjacencyMap[currentIdx][currentIdx] = Boolean(false);
  }
  
  // Calculate the number of potential friends for each node.
  const finalResult = [];
  for ( let currentIdx = 0.0; currentIdx < nodeCount; currentIdx++ )
  {
    finalResult[currentIdx] = 0.0; // Initialize count for current node.
    
    // Create a temporary set of all members in the current node's connected component.
    const tempPotentialFriends = Object.assign( {}, nodeComponentMapping[currentIdx] );
    // Overlay with direct connections/blocked pairs for this node.
    Object.assign( tempPotentialFriends, adjacencyMap[currentIdx] );
    
    // Count how many members are marked as true (potential friends).
    finalResult[currentIdx] = Object.keys(tempPotentialFriends).filter( memberIdentifier => tempPotentialFriends[memberIdentifier] ).length;
  }
  // Output the results, space-separated.
  console.log( finalResult.join(" ") );
}

// Represents a Disjoint Set Union (DSU) data structure.
function DisjointSetStructure( initialSize )
{
  this.parentArray = new Array( initialSize );
  this.depthsArray = new Array( initialSize );
  
  // Initialize each element to be its own parent with a rank of zero.
  for ( let idx = 0.0; idx < initialSize; ++idx )
  {
    this.parentArray[idx] = idx;
    this.depthsArray[idx] = 0.0;
  }
}

// Get the prototype object for the DSU class.
const dsPrototype = DisjointSetStructure.prototype;

// Define a getter for the current number of elements in the DSU.
Object.defineProperty( dsPrototype, "currentSize", {
  get: function() {
    return this.parentArray.length;
  }
});

// Adds a new, isolated element to the DSU structure.
dsPrototype.addNewElement = function()
{
  const newIdx = this.parentArray.length;
  this.parentArray.push( newIdx );
  this.depthsArray.push( 0.0 );
  return newIdx;
};

// Finds the representative (root) of the set containing the given element.
// Uses path compression for efficiency.
dsPrototype.findRepresentative = function( elementId )
{
  let startElement = elementId;
  const parentReferences = this.parentArray;
  
  // Traverse up to find the actual root.
  while ( parentReferences[elementId] !== elementId )
  {
    elementId = parentReferences[elementId];
  }
  
  // Path compression: make all elements on the path point directly to the root.
  while ( parentReferences[startElement] !== elementId )
  {
    const nextParent = parentReferences[startElement];
    parentReferences[startElement] = elementId;
    startElement = nextParent;
  }
  return elementId;
};

// Unites the sets containing two given elements.
// Uses union by rank for efficiency.
dsPrototype.uniteSets = function( elementA, elementB )
{
  const representativeA = this.findRepresentative( elementA );
  const representativeB = this.findRepresentative( elementB );
  
  // If already in the same set, do nothing.
  if ( representativeA === representativeB )
  {
    return;
  }
  
  const ranksInfo = this.depthsArray;
  const parentReferences = this.parentArray;
  const rankA = ranksInfo[representativeA];
  const rankB = ranksInfo[representativeB];
  
  // Attach the smaller rank tree under the root of the larger rank tree.
  if ( rankA < rankB )
  {
    parentReferences[representativeA] = representativeB;
  }
  else if ( rankB < rankA )
  {
    parentReferences[representativeB] = representativeA;
  }
  else
  {
    // If ranks are equal, pick one as root and increment its rank.
    parentReferences[representativeB] = representativeA;
    ranksInfo[representativeA]++;
  }
};

// Initiate the program by reading input from standard input.
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n") );