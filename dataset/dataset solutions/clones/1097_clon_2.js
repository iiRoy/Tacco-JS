process.stdin.resume();

/*
 * Configure the standard input stream to interpret incoming bytes
 * as UTF-8 characters.
 */
process.stdin.setEncoding( "utf8" );

// Buffer to accumulate all data received from standard input.
let receivedData = "";

/*
 * Event listener for incoming data chunks.
 * Appends each data chunk to the 'receivedData' string.
 */
process.stdin.on( "data" , function ( dataSegment ) {
    receivedData += dataSegment;
} );

/*
 * Event listener for the end of the input stream.
 * Splits the accumulated data by newline characters and passes the resulting
 * array of lines to the primary processing function.
 */
process.stdin.on( "end" , function () {
    primaryProcessor( receivedData.split( "\n" ) );
} );


/**
 * Creates and initializes a new tree node object.
 *
 * @param {number} value The numerical value to store in the node.
 * @returns {object} A new node object with the given value and null children pointers.
 */
function createTreeNode ( value ) {
    // Initialize an empty object for the node.
    let nodeObject = {};

    // Assign the provided value to the node's 'val' property.
    nodeObject.val = value;

    // Initialize left and right child pointers to null.
    nodeObject.leftPtr = null;
    nodeObject.rightPtr = null;

    // Return the newly created node.
    return nodeObject;
}

/**
 * Inserts a child node into a binary search tree rooted at parentNode.
 *
 * @param {object|null} parentNode The current node in the traversal, or null if empty.
 * @param {object} childNode The node to be inserted.
 * @returns {object} The root of the (sub)tree after insertion.
 */
function placeNode ( parentNode , childNode ) {
    // If the current position is empty, the child node becomes the root of this subtree.
    if ( parentNode === null ) {
        return childNode;
    }

    // Compare the value of the child node with the current parent node.
    if ( childNode.val < parentNode.val ) {
        // If child's value is smaller, insert into the left subtree.
        parentNode.leftPtr = placeNode( parentNode.leftPtr , childNode );
    } else {
        // Otherwise, insert into the right subtree (handles equal or larger values).
        parentNode.rightPtr = placeNode( parentNode.rightPtr , childNode );
    }

    // Return the (potentially updated) parent node.
    return parentNode;
}

/**
 * Performs an in-order traversal of a binary tree, collecting node values.
 * (Left -> Root -> Right)
 *
 * @param {object|null} currentElement The current node being visited.
 * @param {Array<number>} resultList The array to which collected values are pushed.
 */
function traverseInOrder ( currentElement , resultList ) {
    // Base case: if the current node is null, do nothing.
    if ( currentElement === null ) {
        return;
    }

    // Recursively traverse the left subtree.
    traverseInOrder( currentElement.leftPtr , resultList );

    // Add the current node's value to the result list.
    resultList.push( currentElement.val );

    // Recursively traverse the right subtree.
    traverseInOrder( currentElement.rightPtr , resultList );
}

/**
 * Performs a pre-order traversal of a binary tree, collecting node values.
 * (Root -> Left -> Right)
 *
 * @param {object|null} currentElement The current node being visited.
 * @param {Array<number>} resultList The array to which collected values are pushed.
 */
function traversePreOrder ( currentElement , resultList ) {
    // Base case: if the current node is null, do nothing.
    if ( currentElement === null ) {
        return;
    }

    // Add the current node's value to the result list first.
    resultList.push( currentElement.val );

    // Recursively traverse the left subtree.
    traversePreOrder( currentElement.leftPtr , resultList );

    // Recursively traverse the right subtree.
    traversePreOrder( currentElement.rightPtr , resultList );
}

/**
 * Executes a specified traversal function on a tree and prints the collected values.
 *
 * @param {object|null} treeRoot The root node of the tree to traverse.
 * @param {Function} traversalFunction The function to use for traversing the tree
 *                                     (e.g., traverseInOrder, traversePreOrder).
 */
function outputTraversal ( treeRoot , traversalFunction ) {
    // Initialize an empty array to store the values collected during traversal.
    let collectedValues = [];

    // Call the provided traversal function, passing the tree root and the collection array.
    traversalFunction( treeRoot , collectedValues );

    // Print the collected values, joined by spaces, to the console.
    console.log( collectedValues.join( " " ) );
}

/**
 * Main processing function that handles input lines to build and query a binary search tree.
 *
 * @param {Array<string>} inputLines An array of strings, where each string represents a line of input.
 */
function primaryProcessor ( inputLines ) {
    // The first line contains the total number of operations.
    let operationCount = Number( inputLines[ 0 ] );

    // Initialize the root of the binary search tree to null.
    let binarySearchTreeRoot = null;

    // Loop through each operation specified in the input lines.
    for ( let opIdx = 0; opIdx < operationCount; opIdx++ ) {
        // Split the current instruction line into parts.
        // The index is opIdx + 1 because the first line was operationCount.
        let currentInstruction = inputLines[ opIdx + 1 ].split( " " );

        // Determine the type of operation based on the first character of the first part.
        switch ( currentInstruction[ 0 ][ 0 ] ) {
            case "i": // Case for inserting a new value into the tree.
                // Parse the numeric value to be inserted.
                let numericValue = Number( currentInstruction[ 1 ] );

                // Create a new tree node with the parsed value.
                let newNodeObj = createTreeNode( numericValue );

                // Insert the new node into the binary search tree.
                binarySearchTreeRoot = placeNode( binarySearchTreeRoot , newNodeObj );
                break;

            case "p": // Case for printing tree traversals.
                // Output the in-order traversal of the tree.
                outputTraversal( binarySearchTreeRoot , traverseInOrder );
                // Output the pre-order traversal of the tree.
                outputTraversal( binarySearchTreeRoot , traversePreOrder );
                break;

            // No default case needed as input is assumed to be valid per problem spec.
        }
    }
}