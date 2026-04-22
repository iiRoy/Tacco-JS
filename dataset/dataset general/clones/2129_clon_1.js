/*
 *  wordtree.js - Core utilities for transforming sentences into a graphical tree structure.
 *  This file contains the logic for building, manipulating, and displaying word trees.
 *
 *  Original Author: Aditi Muralidharan
 *  Copyright (C) 2011 Aditi Muralidharan
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// Function to construct a word tree from a given context (list of sentences).
// This tree can represent either left or right contexts depending on the processing logic.
/**
 * Processes a list of sentences to build a hierarchical tree structure.
 *
 * @param {Array<string[]>} context    - An array of string arrays, where each inner array is a sentence.
 * @param {number}          level      - The current depth level in the tree (for size calculation).
 * @param {number}          detail     - A percentage threshold to determine when to collapse branches.
 * @param {number}          orientation- Specifies the tree's orientation (e.g., left-to-right, right-to-left).
 * @returns {Array<Object>} The sorted tree structure.
 */
function makeTree ( context , level , detail , orientation ) {

	var tree = { } ; // Initialize the main tree object.
	var first, sentence, max, collapsed, subtree, key ; // Declare variables.

	max = 0 ; // Initialize maximum count.
	var keys = [ ] ; // Array to hold keys for iteration.

	// Iterate through each sentence in the provided context.
	for ( var i = 0 ; i < context . length ; i ++ ) {
		sentence = context [ i ] ;

		if ( sentence . length > 0 ) {
			first = sentence [ 0 ] ; // Get the first word of the sentence.

			// Handle cases where the first element might be empty or null.
			if ( ! first ) {
				sentence = sentence . slice ( 1 ) ; // Remove the empty element.
				first = sentence [ 0 ] ; // Get the new first word.
			}

			if ( first ) {
				first = first . toLowerCase ( ) ; // Normalize the word to lowercase.

				// If this word is not yet in the tree, initialize its entry.
				if ( tree [ first ] == undefined ) {
					tree [ first ] = { key : first , after : [ ] , level : level , count : 0 , tree : { } } ;
				}

				// Add the rest of the sentence to the 'after' list for this word.
				tree [ first ] . after . push ( sentence . slice ( 1 ) ) ;
				tree [ first ] . count += 1 ; // Increment the count for this word.
			}
		}
	}

	// Determine the maximum count among all words and collect all keys.
	for ( var key in tree ) {
		if ( tree [ key ] . count > max ) {
			max = tree [ key ] . count ; // Update max count if current word count is higher.
		}
		keys . push ( key ) ; // Add the key to the list.
	}

	// Process each key to potentially collapse branches based on detail level.
	for ( var i = 0 ; i < keys . length ; i ++ ) {
		key = keys [ i ] ;

		// Check if the word's count meets the detail threshold.
		if ( tree [ key ] . count > ( max * ( 100 - detail ) / 100 ) ) {
			// If there are multiple 'after' sentences, recursively build a subtree.
			if ( tree [ key ] . after . length > 1 ) {
				subtree = makeTree ( tree [ key ] . after , level + 1 , detail , orientation ) ;
				collapsed = collapse ( subtree , key , orientation ) ; // Collapse the subtree if possible.

				var tmp = tree [ key ] ; // Temporarily store the current node's properties.
				delete tree [ key ] ; // Remove the original node.

				// Create a new node with the collapsed key and transfer properties.
				tree [ collapsed . key ] = { } ;
				tree [ collapsed . key ] [ "after" ] = tmp [ "after" ] ;
				tree [ collapsed . key ] [ "count" ] = tmp [ "count" ] ;
				tree [ collapsed . key ] [ "level" ] = tmp [ "level" ] ;
				tree [ collapsed . key ] [ "tree" ] = collapsed . tree ;
				tree [ collapsed . key ] [ "key" ] = collapsed . key ;
			}
		} else {
			// If the word's count is below the threshold, remove it from the tree.
			delete tree [ key ] ;
		}
	}

	return sort ( tree ) ; // Return the sorted tree.
}


/**
 * Comparison function for sorting subtree nodes based on their count in descending order.
 * @param {Object} t1 - The first tree node.
 * @param {Object} t2 - The second tree node.
 * @returns {number} The difference in counts (t2.count - t1.count) for descending sort.
 */
function compareSubTrees ( t1 , t2 ) {
	return t2 . count - t1 . count ;
}


/**
 * Converts the tree object into an array and sorts it using the compareSubTrees function.
 * @param {Object} tree - The tree object where keys are words and values are node data.
 * @returns {Array<Object>} An array of tree nodes, sorted by count.
 */
function sort ( tree ) {
	var tmp = [ ] ; // Temporary array to hold tree nodes.

	// Iterate over the properties of the tree object.
	for ( var key in tree ) {
		tmp . push ( tree [ key ] ) ; // Add each node to the temporary array.
	}

	tmp . sort ( compareSubTrees ) ; // Sort the array using the custom comparison function.
	return tmp ; // Return the sorted array.
}


/**
 * Recursively collapses single-path branches in the tree, combining words into a single key.
 * This makes the tree more compact for display.
 *
 * @param {Array<Object>} tree        - The current branch of the tree to collapse.
 * @param {string}        key         - The accumulated key string for the current path.
 * @param {number}        orientation - The orientation of the tree (e.g., WordTree.RO_LEFT, WordTree.RO_RIGHT).
 * @returns {Object} An object containing the collapsed tree and its new combined key.
 */
function collapse ( tree , key , orientation ) {
	// If the branch contains only one child, attempt to collapse it further.
	if ( tree . length == 1 ) {
		// Iterate over the single child in the tree array.
		for ( var k in tree ) {
			// Check the orientation to determine how to combine the keys.
			if ( orientation == WordTree . RO_LEFT ) {
				// For left orientation, new word comes after the accumulated key.
				return collapse ( tree [ k ] . tree , key + " " + tree [ k ] . key , orientation ) ;
			} else if ( orientation == WordTree . RO_RIGHT ) {
				// For right orientation, new word comes before the accumulated key.
				return collapse ( tree [ k ] . tree , tree [ k ] . key + " " + key , orientation ) ;
			}
		}
	} else {
		// If there are multiple children (or no children), stop collapsing and return the current state.
		return { tree : tree , "key" : key } ;
	}
}


/**
 * Calculates the appropriate font size for a tree node based on its count and level.
 *
 * @param {number|string} count - The frequency count of the word. Can be "end" for terminal nodes.
 * @param {number}        level - The depth level of the node in the tree.
 * @returns {number} The calculated font size in pixels.
 */
function size ( count , level ) {
	// Special handling for "end" nodes, which represent sentence endings.
	if ( count == "end" ) {
		return 10 ; // Fixed small size for end nodes.
	} else {
		// Calculate size based on count and level, clamped between 12 and 30.
		// Uses Math.log(level+1) to reduce size for deeper levels.
		return Math . min ( 30 , Math . max ( 12 , ( 12 + count ) / ( Math . log ( level + 1 ) ) ) ) ;
	}
}

// Global variable to keep track of node IDs for the display library.
var nodeID ;

/**
 * Initializes and displays the word tree using the WordTree visualization library.
 *
 * @param {string}        context     - The label for the root node of the tree.
 * @param {Array<Object>} tree        - The structured tree data to be displayed.
 * @param {HTMLElement}   container   - The DOM element where the tree will be rendered.
 * @param {number}        width       - The width of the visualization canvas.
 * @param {number}        height      - The height of the visualization canvas.
 * @param {number}        direction   - The root orientation for the WordTree library.
 * @param {Object}        paper       - The Raphael.js paper object or similar drawing surface.
 * @returns {Object} The WordTree instance.
 */
function displayTree ( context , tree , container , width , height , direction , paper ) {
	// Create a new WordTree instance.
	var wordTree = new WordTree ( "tree" , container , width , height , paper ) ;

	// Set the root orientation configuration.
	wordTree . config . iRootOrientation = direction ;

	// Initialize node ID counter for unique identifiers.
	nodeID = 0 ;

	// Add the root node to the word tree.
	// Parameters: id, parentId, label, size, color.
	wordTree . add ( nodeID /* root id */ , -1 , context , 25 , "black" ) ;
	nodeID += 1 ; // Increment node ID.

	// Recursively add all nodes from the processed tree to the WordTree instance.
	addAll ( tree , wordTree , 0 /* parent is the root node (id 0) */ ) ;

	// Update the WordTree to render the visualization.
	wordTree . UpdateTree ( ) ;

	return wordTree ; // Return the initialized WordTree object.
}


/**
 * Recursively adds all nodes from the processed tree data to the WordTree display instance.
 * This function traverses the tree and creates nodes for visualization.
 *
 * @param {Array<Object>} tree     - The current branch of the structured tree data.
 * @param {Object}        wordTree - The WordTree display instance.
 * @param {number}        parent   - The ID of the parent node for the current branch.
 */
function addAll ( tree , wordTree , parent ) {
	var key ; // Declare variable for node key.
	var dsc ; // Declare variable for description (for 'end' nodes).

	// Iterate through each node in the current tree branch.
	for ( var i = 0 ; i < tree . length ; i ++ ) {
		key = tree [ i ] . key ; // Get the key (word) for the current node.

		// Add the current node to the WordTree display.
		// Parameters: id, parentId, label, size, color (default black for intermediate nodes).
		wordTree . add ( nodeID , parent , key , size ( tree [ i ] . count , tree [ i ] . level ) ) ;
		nodeID += 1 ; // Increment node ID for the next node.

		// If this node has further 'after' sentences (i.e., it's not a leaf yet in terms of context).
		if ( tree [ i ] . after . length > 1 ) {
			// Recursively call addAll for the subtree, setting the current node as the parent.
			addAll ( tree [ i ] . tree , wordTree , nodeID - 1 /* current node's ID */ , "black" ) ;
		} else {
			// This is a terminal node in the context path (sentence ending).
			dsc = "" ; // Initialize description string.

			// Construct the description based on the tree orientation.
			if ( wordTree . config . iRootOrientation == WordTree . RO_LEFT ) {
				// For left-to-right, join remaining words as they are.
				dsc = tree [ i ] . after [ 0 ] . join ( " " ) ;
			} else {
				// For right-to-left, reverse and then join.
				dsc = tree [ i ] . after [ 0 ] . reverse ( ) . join ( " " ) ;
			}

			// Add a special "end" node to represent the completion of a sentence.
			// This node is a child of the current word node.
			wordTree . add ( nodeID , nodeID - 1 , dsc , size ( "end" , "" ) , "#999" ) ;
			nodeID += 1 ; // Increment node ID.
		}
	}
}


/**
 * Retrieves a specific context (e.g., left, right) from a data object.
 * This is a utility function to access pre-processed context data.
 *
 * @param {Object} data - The main data object containing different types of contexts.
 * @param {string} type - The type of context (e.g., "left", "right").
 * @param {string} which - Further specifies which specific context within the type.
 * @returns {Array<string[]>} The requested context data.
 */
function makeContext ( data , type , which ) {
	return data [ type ] [ which ] ;
}


/**
 * Orchestrates the creation and display of a complete word tree.
 * This is the main entry point for generating a word tree visualization.
 *
 * @param {Array<string[]>} sentences   - The raw sentence data to build the tree from.
 * @param {string}          context     - The label for the root node.
 * @param {number}          detail      - The detail level for tree construction.
 * @param {HTMLElement}     container   - The DOM element for rendering.
 * @param {number}          width       - Canvas width.
 * @param {number}          height      - Canvas height.
 * @param {number}          direction   - Tree orientation.
 * @param {Object}          paper       - Raphael.js paper object.
 * @returns {Object} The generated WordTree display instance.
 */
function makeWordTree ( sentences , context , detail , container , width , height , direction , paper ) {
	// First, build the internal tree data structure.
	var tree = makeTree ( sentences , 1 , detail , direction ) ;

	// Then, display the constructed tree using the WordTree library.
	return displayTree ( context , tree , container , width , height , direction , paper ) ;
}