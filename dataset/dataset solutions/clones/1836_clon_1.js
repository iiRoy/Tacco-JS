/*
 * This file defines a set of functions for managing a tree-like structure
 * represented by Node objects. The structure is built dynamically based on
 * input parameters.
 *
 * It's crucial to maintain the exact logical and structural integrity
 * of the original code, only altering whitespace and comments.
 */

function       Node(  ) {
	this.left   =   null; // Pointer to the left child node
	this.right  =   null; // Pointer to the right child node
	this.depth  =   null; // Depth level of this node in the tree
	this.isChild=   null; // Flag indicating if this node is a leaf node
}


var list    =   [ ] ; // Global array to store all created nodes


/*
 * Function to add multiple nodes in sequence, connecting them
 * to a given parent node up to a specified depth.
 *
 * @param parent The node to which new children will be attached.
 * @param depth  The maximum depth level to which nodes should be added.
 */
function addNodeAll(parent, depth) {

	// console.log({ // Debugging: state before adding nodes
	// 	addNodeAllBefore: true, /* Flag for before execution */
	// 	depth: depth,          /* Current target depth */
	// 	list: list             /* Current list of nodes */
	// });

	var currentParent = parent; // Start with the given parent
	/* Loop from the parent's depth + 1 up to the target depth */
	for (  var i = parent.depth + 1 ; i <= depth ; i++  )
	{
		var node = new Node( );    // Create a new node instance
		node.depth = i;             // Set its depth
		node.isChild = (i === depth); // Mark as child if it's the last node in sequence

		if (parent.left) {          // If parent already has a left child
			currentParent.right = node; // Attach new node to currentParent's right
		} else {                    // Otherwise (parent has no left child)
			currentParent.left = node;  // Attach new node to currentParent's left
		}
		list.push(node);            // Add the newly created node to the global list
		currentParent = node;       // The new node becomes the parent for the next iteration
	}

	/* After adding, sort the entire list by depth for consistent order */
	list.sort( function (a, b) {
		return a.depth - b.depth;
	} );

	// console.log({ // Debugging: state after adding nodes
	// 	addNodeAllAfter: true, /* Flag for after execution */
	// 	depth: depth,          /* Current target depth */
	// 	list: list             /* Updated list of nodes */
	// });
}

/*
 * Function to find an available parent node and add a new node
 * at the specified depth.
 *
 * @param depth The depth at which the new node should be added.
 * @returns true if a node was successfully added, false otherwise.
 */
function addNode(depth) {

	// console.log({ // Debugging: entry point for addNode
	// 	addNode: true,  /* Indication of function call */
	// 	depth: depth    /* Target depth */
	// });

	for (  var i = 0 ; i < list.length ; i++  )
	{
		var parent = list[i]; // Get current potential parent from the list
		if (parent.isChild) { // If this parent is already a leaf, skip it
			continue;
		}
		if (parent.left && parent.right) { // If parent has both children, skip it
			continue;
		}
		addNodeAll(parent, depth); // If available, add nodes starting from this parent
		return true; // Successfully added a node
	}
	return false; // No suitable parent found to add a node
}


// The 'input' variable receives the entire input data as a string.
function Main(  input  ) {

	// inputLines[0] is the first line, inputLines[1] is the second, and so on.
	const inputLines = input.split(  "\n"  );
	const line0      = inputLines[0];
	const line1      = inputLines[1];
	const line1vars  = line1.split(  " "  );

	const n = parseInt(  line0, 10  ); // Parse the first line as an integer (base 10)
	const a = line1vars.map(x => parseInt(x, 10)); // Map elements of the second line to integers

	/*
	// console.log({ // Debugging: parsed input values
	// 	n: n, // Value of n
	// 	a: a  // Array a
	// });
	*/

	if (  a[0] !== 0  ) { /* If the first element of 'a' is not 0 */
		console.log(  -1  ); // Output -1, indicating an error condition
		return;              // Exit the function
	}

	// Initialize the very first node (root) at depth 0
	var node = new Node( );
	node.depth = 0;
	node.isChild = false; // Root is not a child initially
	list.push(node);       // Add root to the global list

	/* Loop through each depth level from 1 to n */
	for (  var i = 1 ; i <= n ; i++  )
	{
		/* For each depth, add 'a[i]' number of nodes */
		for (  var j = 0 ; j < a[i] ; j++  )
		{
			var result = addNode(i); // Attempt to add a node at current depth 'i'
			if (  !result  ) {       // If addNode failed (no suitable parent)
				console.log(  -1  ); // Output -1
				return;              // Exit
			}
		}
	}
	// console.log({ // Debugging: final state of the node list
	// 	list: list
	// });
	// console.log(JSON.stringify(list)); // Debugging: JSON string representation of the list
	console.log(list.length); // Output the total number of nodes in the list

	/*
	// --- Example of commented-out code (original from template) ---
	// tmp = input[1].split(" ");
	// // When converting a string to a decimal integer, use parseInt.
	// var a = parseInt(input[0], 10);
	// var b = parseInt(tmp[0], 10);
	// var c = parseInt(tmp[1], 10);
	// var s = input[2];
	*/

}
//* This line and below should not be edited (it reads input from stdin and calls Main)
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  );

/*
 * Example usage:
 * To run this code with sample input, save it as e.g., 'solution.js'
 * and then run from terminal:
 * node solution.js < input.txt
 *
 * Where input.txt might contain:
 * 1
 * 2 3
 * test
 *
 * (Ctrl + D) on some systems signals end of input when typing directly.
 */