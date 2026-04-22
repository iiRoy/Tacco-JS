process. stdin .resume (); /* Initialize the standard input stream. */
process. stdin .setEncoding ( "utf8" ); // Set the character encoding to UTF-8 for incoming data.

let input = ""; // A string buffer to accumulate all input chunks.

process. stdin .on ( "data",
	function ( chunk ) { // Event listener for 'data' chunks from standard input.
		input += chunk; /* Append the received data chunk to the 'input' string. */
	}
);

process. stdin .on ( "end",
	function () { // Event listener for the 'end' of the standard input stream.
		// Once all input has been received, split it by newline characters
		// and pass the resulting array of lines to the main processing function.
		main ( input .split ( "\n" ) );
	}
);


/*
 * Function: allocNode
 * Description: Creates and initializes a new node object for a binary search tree.
 * Parameters:
 *   key - The value to be stored in the node.
 * Returns:
 *   A new node object with the given key and null left/right children.
 */
function allocNode ( key ) {

	const p = {}; // Create a plain JavaScript object to represent the node.

	p. key = key; // Assign the provided 'key' to the 'key' property of the node.
	p. left = null; // Initialize the 'left' child pointer to null.
	p. right = null; // Initialize the 'right' child pointer to null.

	return p; /* Return the newly allocated and initialized node. */
}


/*
 * Function: insert
 * Description: Inserts a new node into a binary search tree (BST).
 *              This is a recursive function that places the new node 'c'
 *              into the correct position within the tree rooted at 'p'.
 * Parameters:
 *   p - The current root of the subtree being considered.
 *   c - The node to be inserted.
 * Returns:
 *   The root of the (potentially modified) subtree after insertion.
 */
function insert ( p , c ) {

	// Base case: If the current node 'p' is null, it means we've found
	// the correct spot for the new node 'c'.
	if ( p === null ) return c;

	// If the key of the node to insert ('c') is less than the current node's key ('p').
	if ( c. key < p. key ) {
		// Recursively call insert on the left child of 'p'.
		// The result of this recursive call updates 'p.left'.
		p. left = insert ( p. left , c );
	}
	// Otherwise (if 'c.key' is greater than or equal to 'p.key').
	else {
		// Recursively call insert on the right child of 'p'.
		// The result of this recursive call updates 'p.right'.
		p. right = insert ( p. right , c );
	}

	return p; /* Return the current node 'p' (which is the root of its subtree). */
}


/*
 * Function: find
 * Description: Searches for a node with a specific key in a binary search tree.
 * Parameters:
 *   p   - The current node being examined in the search (starts with the root).
 *   key - The key value to search for.
 * Returns:
 *   The node object if found, otherwise null.
 */
function find ( p , key ) {

	// Continue searching only if the current node 'p' is not null
	// AND its key does not match the target 'key'.
	if ( p !== null && p. key !== key ) {
		// If the target key is less than the current node's key,
		// then the target key must be in the left subtree.
		if ( key < p. key ) p = find ( p. left , key );
		// Otherwise, the target key must be in the right subtree.
		else p = find ( p. right , key );
	}

	return p; /* Return the node (which will be null if not found, or the matching node). */
}


/*
 * Function: inset
 * Description: Performs an in-order traversal of the binary search tree.
 *              It collects the keys of the nodes in ascending order into an array.
 * Parameters:
 *   p   - The current node in the traversal.
 *   ary - The array where the node keys will be stored.
 * Returns:
 *   (void) - Modifies the 'ary' array directly.
 */
function inset ( p , ary ) {

	// Base case for recursion: if the current node is null, there's nothing to add.
	if ( p === null ) return;

	inset ( p. left , ary ); // Recursively traverse the left subtree.
	ary. push ( p. key ); // Add the current node's key to the array.
	inset ( p. right , ary ); // Recursively traverse the right subtree.

}


/*
 * Function: preset
 * Description: Performs a pre-order traversal of the binary search tree.
 *              It collects the keys of the nodes in the order they are visited
 *              (root, then left subtree, then right subtree) into an array.
 * Parameters:
 *   p   - The current node in the traversal.
 *   ary - The array where the node keys will be stored.
 * Returns:
 *   (void) - Modifies the 'ary' array directly.
 */
function preset ( p , ary ) {

	// Base case for recursion: if the current node is null, there's nothing to add.
	if ( p === null ) return;

	ary. push ( p. key ); // Add the current node's key to the array first.
	preset ( p. left , ary ); // Recursively traverse the left subtree.
	preset ( p. right , ary ); // Recursively traverse the right subtree.

}


/*
 * Function: dump
 * Description: Prints the keys of the binary search tree to the console
 *              using a specified traversal function (e.g., inset for in-order,
 *              preset for pre-order).
 * Parameters:
 *   p       - The root of the binary search tree.
 *   setfunc - The traversal function to use (e.g., inset or preset).
 * Returns:
 *   (void) - Prints output directly to the console.
 */
function dump ( p , setfunc ) {

	const ary = []; // Create an empty array to hold the keys during traversal.

	setfunc ( p , ary ); // Call the provided traversal function to populate 'ary'.

	// Format the array elements by adding a leading space to each key,
	// then join them into a single string and print to the console.
	console. log ( ary. map ( x => ` ${x}` ). join ( "" ) );
}


/*
 * Function: main
 * Description: The primary function that orchestrates the binary search tree operations
 *              based on commands read from the input lines.
 * Parameters:
 *   lines - An array of strings, where each string represents a command line.
 * Returns:
 *   (void) - Performs operations and prints results to console.
 */
function main ( lines ) {

	const n = Number ( lines [ 0 ] ); // The first line contains the number of operations.

	let p , key , line , root = null; // Declare variables: 'p' for node, 'key' for value,
	                                  // 'line' for current input line, and 'root' for the BST root.

	for ( let i = 0; i < n; i ++ ) { // Loop through each of the 'n' operations.

		line = lines [ i + 1 ]. split ( " " ); // Split the current command line into parts.

		switch ( line [ 0 ] [ 0 ] ) { // Examine the first character of the command.

		case "i": // If the command starts with 'i' (for insert).
			key = Number ( line [ 1 ] ); // Extract the key to insert from the second part of the line.
			p = allocNode ( key ); // Allocate a new node with this key.
			root = insert ( root , p ); // Insert the new node into the binary search tree.
			break;

		case "p": // If the command starts with 'p' (for print/dump).
			dump ( root , inset ); // Perform an in-order traversal and print the keys.
			dump ( root , preset ); // Perform a pre-order traversal and print the keys.
			break;

		case "f": // If the command starts with 'f' (for find).
			key = Number ( line [ 1 ] ); // Extract the key to find from the second part of the line.
			// Search for the key in the tree. If found, print "yes"; otherwise, print "no".
			if ( find ( root , key ) !== null ) console. log ( "yes" );
			else console. log ( "no" );
			break;

		} // End of switch statement for command processing.

	} // End of loop iterating through operations.

} // End of main function.