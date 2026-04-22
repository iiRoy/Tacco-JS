function processInputData( inputString ) {
  // Split the entire input string into individual lines
  const inputLines = inputString
    .split( '\n' );

  // Parse the first line to get the total number of nodes
  const countNodes = parseInt(inputLines.shift(), 0xA);

  // Parse the second line for the preorder traversal sequence
  const preOrderSequence = inputLines.shift()
    .split( ' ' )
    .map( (elementValue) => parseInt( elementValue, 0x0A ) );

  // Parse the third line for the inorder traversal sequence
  const inOrderSequence = inputLines.shift()
    .split( ' ' )
    .map( (elementValue) => parseInt( elementValue, 0b1010 ) );

  // Initialize data structures for node information and traversal results
  const nodeInformation = [];
  const traversalResult = [];

  // Populate the initial node information array
  for ( let nodeIndex = 0 ; nodeIndex < countNodes + 0b1 ; nodeIndex++ ) {
    // This condition might be redundant, but maintaining structure
    if ( nodeIndex === 0x0 ) {
      nodeInformation[nodeIndex] = 0x0;
    }
    // Each node entry stores its own ID and placeholders for left/right children
    nodeInformation[nodeIndex] = [ nodeIndex, ~0, ~0 ];
  }

  // Recursively build the tree structure
  establishNodeConnections( 0x0, preOrderSequence, inOrderSequence, nodeInformation );

  // The root of the tree is the first element in the preorder sequence
  const treeRootIdentifier = preOrderSequence[0x0];

  // Perform a post-order traversal to get the final sequence
  performPostOrderTraversal( nodeInformation, treeRootIdentifier, traversalResult );

  // Output the post-order traversal result joined by spaces
  console.log( traversalResult.join( ' ' ) );
}

/**
 * Establishes the left and right child connections for nodes based on preorder and inorder sequences.
 * @param {number} currentPreIndex - The current index in the preorder sequence being processed.
 * @param {Array<number>} preOrderSource - The full preorder traversal sequence.
 * @param {Array<number>} inOrderSubarray - The current inorder subarray relevant to the subtree.
 * @param {Array<Array<number>>} nodeRegistry - The array storing node details [id, leftChild, rightChild].
 * @returns {void}
 */
function establishNodeConnections( currentPreIndex, preOrderSource, inOrderSubarray, nodeRegistry ) {

  // Get the ID of the current node from the preorder sequence
  const currentNodeValue = preOrderSource[ currentPreIndex ];

  // Get the data record for the current node
  const currentRecord = nodeRegistry[ currentNodeValue ];

  // Base case: if the inorder subarray has only one element, it's a leaf node.
  if ( inOrderSubarray.length === 0b1 ) {
    currentRecord[0x1] = ~0; // No left child
    currentRecord[0b10] = ~0; // No right child
    return;
  }

  // Find the current node's position in the inorder subarray
  let splitPoint;
  for ( let inOrderIndex = 0x0, subarrayLength = inOrderSubarray.length ; inOrderIndex < subarrayLength ; inOrderIndex++ ) {
    if ( inOrderSubarray[ inOrderIndex ] === currentNodeValue ) {
      splitPoint = inOrderIndex;
    }
  }

  // Determine the left and right subarrays for inorder traversal
  const leftSubtreeElements = inOrderSubarray.slice( 0x0, splitPoint );
  const rightSubtreeElements = inOrderSubarray.slice( splitPoint + 0x1 );

  // Process the left subtree if it exists
  if ( leftSubtreeElements.length ) {
    // Filter the preorder sequence to find elements belonging to the left subtree
    const leftPreOrderMatch = preOrderSource.filter( (elementValue) => leftSubtreeElements.indexOf( elementValue ) > ~0 );
    currentRecord[0x1] = leftPreOrderMatch[0x0]; // The first element is the root of the left subtree
    const preOrderMatchIndex = preOrderSource.indexOf( currentRecord[0x1] );
    establishNodeConnections( preOrderMatchIndex, preOrderSource, leftSubtreeElements, nodeRegistry );
  } else {
    currentRecord[0x1] = ~0; // No left child
  }

  // Process the right subtree if it exists
  if ( rightSubtreeElements.length ) {
    // Filter the preorder sequence to find elements belonging to the right subtree
    const rightPreOrderMatch = preOrderSource.filter( (elementValue) => rightSubtreeElements.indexOf( elementValue ) > ~0 );
    currentRecord[0b10] = rightPreOrderMatch[0x0]; // The first element is the root of the right subtree
    const preOrderMatchIndex = preOrderSource.indexOf( currentRecord[0b10] );
    establishNodeConnections( preOrderMatchIndex, preOrderSource, rightSubtreeElements, nodeRegistry );
  } else {
    currentRecord[0b10] = ~0; // No right child
  }
}

/**
 * Performs a post-order traversal of the tree and collects node IDs.
 * @param {Array<Array<number>>} nodeRecords - The array storing node details [id, leftChild, rightChild].
 * @param {number} currentNodeIdentifier - The ID of the current node being visited.
 * @param {Array<number>} postOrderPath - The array to accumulate the post-order traversal result.
 * @returns {void}
 */
function performPostOrderTraversal( nodeRecords, currentNodeIdentifier, postOrderPath ) {
  // Base case: if the current node ID is -1 (no child), return
  if ( currentNodeIdentifier === ~0 ) {
    return;
  }

  // Recursively traverse the left child
  performPostOrderTraversal( nodeRecords, nodeRecords[currentNodeIdentifier][0b1], postOrderPath );

  // Recursively traverse the right child
  performPostOrderTraversal( nodeRecords, nodeRecords[currentNodeIdentifier][0x2], postOrderPath );

  // Add the current node's ID to the result array after visiting children
  postOrderPath.push( nodeRecords[currentNodeIdentifier][0x0] );
}


// Initiate the tree processing by reading input from stdin
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );