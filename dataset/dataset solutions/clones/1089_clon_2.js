// System configuration for input processing
const  systemSettings =  {  inputPath: '/dev/stdin',  lineSeparator: '\n'  };

// Read raw data from the specified input path
// and perform initial processing steps
let  rawInputLines =  require('fs')
  .readFileSync(systemSettings.inputPath, 'ascii')
  .trim() // Remove leading/trailing whitespace from the entire content
  .split(systemSettings.lineSeparator); // Divide into individual lines

// Discard the first line, as it often contains metadata like count
rawInputLines.shift();

// Define a constant for non-existent nodes to replace '-1'
const  NIL_NODE_IDENTIFIER = '-1';

// Initialize a structure to hold graph nodes
const  graphNodes = {};

// Iterate through each raw input line to populate the graph structure
for (const  lineIndex  in  rawInputLines) {
  // Split the current line into components: [nodeID, leftChildID, rightChildID]
  const  nodeComponents = rawInputLines[lineIndex].split(' ');

  // Store node information in the graphNodes map
  // The first component is the node's unique ID
  // The second is its left child, the third is its right child
  // Initially, every node is considered a potential root
  graphNodes[nodeComponents[0]] = {
    leftChild:  nodeComponents[1],
    rightChild:  nodeComponents[2],
    isRootCandidate:  true
  };
}

// Determine the actual root node by identifying nodes that are not children
for (const  nodeKey  in  graphNodes) {
  // If a node has a left child that is not NIL_NODE_IDENTIFIER,
  // then that left child cannot be the root of the entire tree.
  if (graphNodes[nodeKey].leftChild  !==  NIL_NODE_IDENTIFIER) {
    graphNodes[graphNodes[nodeKey].leftChild].isRootCandidate = false;
  }
  // Similarly, if a node has a right child that is not NIL_NODE_IDENTIFIER,
  // that right child also cannot be the overall root.
  if (graphNodes[nodeKey].rightChild  !==  NIL_NODE_IDENTIFIER) {
    graphNodes[graphNodes[nodeKey].rightChild].isRootCandidate = false;
  }
}

// Find the single node that remains a root candidate
let  mainTreeRootID;
for (const  nodeKey  in  graphNodes) {
  if (graphNodes[nodeKey].isRootCandidate) {
    mainTreeRootID = nodeKey;
    break; // Assuming there's only one root
  }
}

// Function to perform a pre-order traversal of the tree
function  performPreorderTraversal(currentElementID) {
  const  currentElement = graphNodes[currentElementID];
  const  leftLink = currentElement.leftChild;
  const  rightLink = currentElement.rightChild;
  let  traversalOutput = [currentElementID]; // Add current node first

  // Recursively visit the left subtree if it exists
  if (leftLink  !==  NIL_NODE_IDENTIFIER) {
    traversalOutput = traversalOutput.concat(performPreorderTraversal(leftLink));
  }
  // Recursively visit the right subtree if it exists
  if (rightLink  !==  NIL_NODE_IDENTIFIER) {
    traversalOutput = traversalOutput.concat(performPreorderTraversal(rightLink));
  }
  return  traversalOutput;
}

// Output the pre-order traversal sequence
console.log('Pre-order Sequence');
console.log(performPreorderTraversal(mainTreeRootID).join(' '));

// Function to perform an in-order traversal of the tree
function  performInorderTraversal(elementIdentifier) {
  const  elementData = graphNodes[elementIdentifier];
  const  leftPointer = elementData.leftChild;
  const  rightPointer = elementData.rightChild;
  let  resultCollection = [];

  // Recursively visit the left subtree
  if (leftPointer  !==  NIL_NODE_IDENTIFIER) {
    resultCollection = resultCollection.concat(performInorderTraversal(leftPointer));
  }
  // Add the current node after visiting the left subtree
  resultCollection.push(elementIdentifier);
  // Recursively visit the right subtree
  if (rightPointer  !==  NIL_NODE_IDENTIFIER) {
    resultCollection = resultCollection.concat(performInorderTraversal(rightPointer));
  }
  return  resultCollection;
}

// Output the in-order traversal sequence
console.log('In-order Sequence');
console.log(performInorderTraversal(mainTreeRootID).join(' '));

// Function to perform a post-order traversal of the tree
function  performPostorderTraversal(nodeKey) {
  const  nodeDetails = graphNodes[nodeKey];
  const  leftBranch = nodeDetails.leftChild;
  const  rightBranch = nodeDetails.rightChild;
  let  sequenceList = [];

  // Recursively visit the left subtree first
  if (leftBranch  !==  NIL_NODE_IDENTIFIER) {
    sequenceList = sequenceList.concat(performPostorderTraversal(leftBranch));
  }
  // Then recursively visit the right subtree
  if (rightBranch  !==  NIL_NODE_IDENTIFIER) {
    sequenceList = sequenceList.concat(performPostorderTraversal(rightBranch));
  }
  // Finally, add the current node
  sequenceList.push(nodeKey);
  return  sequenceList;
}

// Output the post-order traversal sequence
console.log('Post-order Sequence');
console.log(performPostorderTraversal(mainTreeRootID).join(' '));