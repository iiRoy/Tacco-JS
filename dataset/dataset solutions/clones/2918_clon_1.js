/*
 * This JavaScript file implements a solution using a segment tree data structure.
 * It strictly adheres to "use strict" mode for robust and error-free execution.
 */
'use strict';


/*
 * --- START OF CORE UTILITIES AND DATA STRUCTURES ---
 * This section contains foundational functions and the segment tree implementation.
 */

// A large integer constant, often used as a placeholder for infinity in algorithms.
// It's chosen to be significantly smaller than Number.MAX_SAFE_INTEGER
// to prevent potential overflow issues during arithmetic operations.
const INF = 900719925474099; // Represents a sufficiently large number.


/**
 * Parses a string of space-separated numbers into an array of integers.
 * This utility function simplifies input processing for numerical data.
 *
 * @param { string } line - The input string, e.g., "10 20 30".
 * @returns { number[] } An array of integers, e.g., [10, 20, 30].
 */
function mapint( line ) {
	return line
		.split(' ')
		.map( ( v ) => parseInt(v) );
}


/**
 * Performs a binary search-like operation to find the 'lower bound' in a sorted array.
 * It finds the index of the first element in the range [a, b) that is greater than or equal to 'e'.
 *
 * @param { number[] } d - The sorted array in which to search.
 * @param { number } a - The starting index for the search (inclusive).
 * @param { number } b - The ending index for the search (exclusive).
 * @param { number } e - The value to search for.
 * @returns { number } The index of the first element >= e, or 'b' if all elements are less than 'e'.
 */
function lower_bound( d, a, b, e ) {
	for ( var c; 1 < b - a; ) {
		c = 0 | ( a + b ) / 2; // Calculate the middle index using bitwise OR for floor.
		if ( d[c] < e ) {
			a = c; // If mid element is too small, search in the right half.
		} else {
			b = c; // Otherwise, search in the left half (including mid).
		}
	}
	return d[a] < e ? b : a; // Final check to return the correct boundary.
};


/**
 * Segment Tree constructor.
 * Initializes a segment tree capable of handling range updates and point queries (or path queries in this specific implementation).
 *
 * @param { number } n - The initial size/capacity of the array that the segment tree will represent.
 */
function segTree( n ) {
	var u = n - 1,
		x = 2; // 'x' will be the smallest power of 2 greater than or equal to 'n'.
	while ( u ) {
		u >>= 1; /* Halve 'u' by right-shifting. */
		x <<= 1; /* Double 'x' by left-shifting. */
	}

	// The segment tree's internal array. It's sized to be a complete binary tree.
	// Filled with a large value (2e9) representing 'infinity' or an unset state.
	this.seg = Array( x - 1 ).fill( 2e9 );
	this.l = x >> 1; // 'l' represents the offset to the first leaf node in the 'seg' array.

	// console.log('init:',n,x,this.seg,this.l); // Debugging line, kept commented.
}


// Prototype methods for the segTree object.
segTree.prototype = {

	/**
	 * Queries the segment tree to find the minimum value along the path from the root to a specific leaf index.
	 * This specific implementation seems to retrieve the minimum value that has been 'set' for any range that includes 'x'.
	 *
	 * @param { number } x - The index of the leaf node to query.
	 * @returns { number } The minimum value found along the path to 'x', or -1 if no value was ever set for this path.
	 */
	get: function( x ) {
		x += this.l - 1; // Adjust 'x' to its corresponding index in the 'seg' array (leaf node).
		var r = 2e9; // Initialize result with a large value.
		while ( x >= 0 ) {
			if ( this.seg[x] < r ) {
				r = this.seg[x]; // Update 'r' if a smaller value is found in an ancestor.
			}
			x = ( x - 1 ) >> 1; // Move up to the parent node.
		}
		if ( r === 2e9 ) {
			r = -1; // If the default large value remains, it means no specific value was set.
		}
		return r;
	},

	/**
	 * Updates a specified range [l, r) in the segment tree with a given value 't'.
	 * This is typically a "range set" or "range assignment" operation, not an aggregate update like "range add" or "range min".
	 *
	 * @param { number } l - The starting index of the range to update (inclusive).
	 * @param { number } r - The ending index of the range to update (exclusive).
	 * @param { number } t - The value to assign to the nodes covering the specified range.
	 */
	update: function( l, r, t ) {
		// console.log('update-----',l,r,t); // Debugging log for update operations.
		var v = this.seg; // Reference to the segment tree's internal array.

		// Inner recursive function to perform the range update.
		// (l, r) is the query range. (x, y) is the current node's covered range. 'i' is the current node's index.
		function q( l, r, x, y, i ) {
			// console.log('q--l:',l,'r:',r,'x:',x,'y:',y,'i:',i); // Debugging log for recursive calls.

			// If the current node's range completely matches the query range,
			// update its value and stop recursion for this branch.
			if ( l === x && r === y ) {
				v[i] = t;
				return;
			}

			var m = ( x + y ) >> 1; // Calculate the midpoint of the current node's range.

			// Determine which child nodes need to be updated.
			if ( m < r ) {
				if ( l < m ) {
					q( l, m, x, m, i + i + 1 ); // Left child covers part of the range.
					q( m, r, m, y, ( i + 1 ) << 1 ); // Right child covers part/all of the range.
				} else {
					q( l, r, m, y, ( i + 1 ) << 1 ); // Only the right child covers the range.
				}
			} else {
				q( l, r, x, m, i + i + 1 ); // Only the left child covers the range.
			}
		}

		q( l, r, 0, this.l, 0 ); // Initiate the recursive update starting from the root (index 0).
		// this.printing(); // Debug call to print the tree state after update.
	},

	/**
	 * A debugging utility method to print the first few levels of the segment tree.
	 * This is not part of the core segment tree algorithm but helps visualize its state.
	 */
	printing: function() {
		console.log( this.seg[0] ); // Print the root node.

		let s = [];
		for ( let i = 1; i <= 2; i++ ) {
			s.push( this.seg[i] );
		}
		console.log( s.join(' ') ); // Print nodes at level 1.

		s = [];
		for ( let i = 3; i <= 6; i++ ) {
			s.push( this.seg[i] );
		}
		console.log( s.join(' ') ); // Print nodes at level 2.

		s = [];
		for ( let i = 7; i <= 14; i++ ) {
			s.push( this.seg[i] );
		}
		console.log( s.join(' ') ); // Print nodes at level 3.
	},
};

/*
 * --- END OF CORE UTILITIES AND DATA STRUCTURES ---
 */


/**
 * The primary function that orchestrates the program's logic.
 * It reads input, processes it using the defined utilities and data structures,
 * and then outputs the final results.
 *
 * @param { string } input - The complete input string read from stdin.
 */
function Main( input ) {
	let temp = input.trim().split('\n'); // Trim whitespace and split input into an array of lines.
	let temp2 = mapint( temp[0] ); // Parse the first line to get N and Q.
	let n = temp2.shift(); // Extract N (number of items).
	let q = temp2.shift(); // Extract Q (number of queries).

	let s = new Array( n ); // Initialize an array to store N items.
	// Populate the 's' array by parsing subsequent lines.
	for ( let i = 1; i <= n; i++ ) {
		s[i - 1] = mapint( temp[i] );
	}

	let d = new Array( q ); // Initialize an array to store Q query values.
	// Populate the 'd' array by parsing the remaining lines.
	for ( let i = 1; i <= q; i++ ) {
		d[i - 1] = parseInt( temp[n + i] );
	}

	var st = new segTree( q ); // Create a new segment tree instance for 'q' queries.
	s.sort( ( a, b ) => b[2] - a[2] ); // Sort 's' array in descending order based on the third element (index 2).

	// Iterate through the sorted 's' array to perform segment tree updates.
	for ( var i = 0; i < n; i++ ) {
		// Conditional check to skip updates if a specific criterion is not met.
		if ( s[i][1] - s[i][2] - 1 < d[0] ) {
			continue; // Skip to the next iteration.
		}

		// Use lower_bound to find the relevant range [l, r) within array 'd'.
		var l = lower_bound( d, 0, q, s[i][0] - s[i][2] );
		var r = lower_bound( d, l, q, s[i][1] - s[i][2] );

		// If a valid range [l, r) is found, update the segment tree.
		if ( l < r ) {
			st.update( l, r, s[i][2] );
		}
	}

	var ans = Array( q ); // Initialize an array to store the final answers.
	// Query the segment tree for each index from 0 to q-1.
	for ( var i = 0; i < q; i++ ) {
		ans[i] = st.get( i );
	}

	console.log( ans.join("\n") ); // Print the collected answers, each on a new line.
	// st.printing(); // Debugging call, kept commented out.
}


// Read the entire input from standard input (usually "/dev/stdin" in competitive programming environments)
// and pass it to the Main function to begin processing.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );