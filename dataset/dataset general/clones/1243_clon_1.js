/*
 * HTML Canvas Renderer Module
 *
 * This file is part of a larger project designed for rendering HTML content
 * onto a canvas element. It handles parsing, layout, and rendering of a
 * simplified DOM structure.
 *
 * Original Author: James S Urquhart
 * Copyright (C) 2009 James S Urquhart
 * License information can be found in the accompanying LICENSE file.
 *
 * Version: 1.0.0
 * Last Modified: 2023-10-27
 *
 * This module is self-contained within an IIFE to prevent global namespace pollution.
 */


( function ( ) {

	// Extend String prototype with a trim method for convenience.
	// This ensures compatibility across various JavaScript environments.
	String.prototype.trim = function ( ) {
		return this . replace ( /^\s+|\s+$/ , '' ) ;
	} ;


	/**
	 * Represents a generic document node within our custom DOM structure.
	 *
	 * @param {number} etype - The type of the node (e.g., 1 for element, 3 for text).
	 * @param {object} document - A reference to the parent document object.
	 */
	function docNode ( etype , document ) {

		// Core properties for DOM representation
		this . ownerDocument = document ;     // Reference to the document this node belongs to
		this . nodeType = etype ;             // Numeric type of the node (e.g., ELEMENT_NODE, TEXT_NODE)
		this . tagName = '' ;                 // The tag name of the element node (e.g., 'DIV', 'P')
		this . nodeValue = '' ;               // The text content of a text node or comment node
		this . index = 0 ;                    // Unique identifier for this node within the document's node list
		this . attributes = { } ;             // Key-value pairs of attributes for element nodes
		this . parentIndex = 0 ;              // Index of the parent node in the document's node list


		// DOM API-like properties for tree traversal
		this . parentNode = null ;            // Reference to the parent node object
		this . childNodes = null ;            // Array-like list of child node objects
		this . firstChild = null ;            // Reference to the first child node
		this . lastChild = null ;             // Reference to the last child node
		this . nextSibling = null ;           // Reference to the next sibling node
		this . previousSibling = null ;       // Reference to the previous sibling node


		// Rendering-specific temporary properties
		this . blockX = 0 ;                   // X-coordinate of the node's block origin
		this . blockY = 0 ;                   // Y-coordinate of the node's block origin
		this . renderX = 0 ;                  // X-coordinate of the current render position within the block
		this . renderY = 0 ;                  // Y-coordinate of the current render position within the block
		this . renderWidth = 0 ;              // Calculated width of the rendered content
		this . renderHeight = 0 ;             // Calculated height of the rendered content

	}


	/**
	 * Represents the entire HTML document structure.
	 *
	 * @constructor
	 */
	function docHTML ( )
	{
		this . nodes = [ ] ;   // An array containing all nodes in the document, in order of appearance
		this . body = null ;   // Reference to the <body> element node
		this . title = null ;  // Reference to the <title> element node
	}


	/**
	 * Iterates through child nodes starting from the current node's next sibling.
	 * It stops when the parent index indicates a node outside the current hierarchy
	 * or when the provided function returns `false`.
	 *
	 * @param {Function} func - The callback function to execute for each node.
	 *                          It receives the node as an argument.
	 *                          Iteration stops if `func` returns `false`.
	 * @returns {docNode|null} The node for which `func` returned `false`, or `null` if all nodes were processed.
	 */
	docNode . prototype . iterateNodes = function ( func ) {

		var nodeList = this . ownerDocument . nodes ;
		var len = nodeList . length ;
		var curStack = this . index ; // The index of the current node, used to determine hierarchy boundaries


		// Start iteration from the node immediately following the current node.
		for ( var i = this . index + 1 ; i < len ; i ++ ) {

			var node = nodeList [ i ] ;

			// If the node's parent index is less than the current stack's index,
			// it means we've moved up the hierarchy, so break the iteration.
			if ( node . parentIndex < curStack )
				break ;

			// Execute the provided function. If it returns false, stop and return the node.
			if ( ! func . call ( null , node ) ) {
				return node ;
			}
		}

		return null ; // All nodes processed or no node caused the function to return false.
	} ;


	/**
	 * Finds the first child element with the specified tag name within the current node's descendants.
	 *
	 * @param {string} tag - The tag name to search for (e.g., 'div', 'p'). Use '*' to select any element.
	 * @returns {docNode|null} The first matching node, or `null` if none is found.
	 */
	docNode . prototype . getFirstElementByTagName = function ( tag ) {

		var selectAll = tag == '*' ; // Flag to indicate if all elements should be selected


		// Use iterateNodes to find the first matching element.
		return this . iterateNodes ( function ( node ) {
			// The callback returns true to continue, false to stop.
			// We want to stop when we find a match, so negate the condition.
			return ! ( selectAll || node . tagName == tag ) ;
		} ) ;

	} ;


	// --- Helpful element functions for DOM-like interaction ---


	/**
	 * Retrieves a list of all descendant elements with the specified tag name.
	 *
	 * @param {string} tag - The tag name to search for. Use '*' to select all elements.
	 * @returns {Array<docNode>} An array of matching `docNode` objects.
	 */
	docNode . prototype . getElementsByTagName = function ( tag ) {

		var selectAll = tag == '*' ; // Determine if all elements should be considered
		var list = [ ] ;             // Initialize an empty array to store matching nodes

		// Iterate through all descendant nodes.
		this . iterateNodes ( function ( node ) {

			// If `selectAll` is true, or the node's tag matches, add it to the list.
			if ( selectAll || node . tagName == tag )
				list . push ( node ) ;

			return true ; // Continue iterating through all nodes.
		} ) ;

		return list ; // Return the collected list of nodes.
	} ;


	/**
	 * Retrieves a list of all descendant elements with the specified 'name' attribute.
	 *
	 * @param {string} name - The value of the 'name' attribute to search for.
	 * @returns {Array<docNode>} An array of matching `docNode` objects.
	 */
	docNode . prototype . getElementsByName = function ( name ) {

		var list = [ ] ; // Initialize an empty array to store matching nodes

		// Iterate through all descendant nodes.
		this . iterateNodes ( function ( node ) {

			// Check if the node's 'name' attribute matches the target name.
			// NOTE: 'selectAll' is not defined in this scope, potentially a bug in original code if intended to be used.
			// Assuming 'selectAll' was intended to be local to `getElementsByTagName`
			// and this function should only match by name attribute.
			if ( node . attributes . name == name )
				list . push ( node ) ;

			return true ; // Continue iterating.
		} ) ;

		return list ; // Return the collected list of nodes.
	} ;


	/**
	 * Finds the first descendant element with the specified 'id' attribute.
	 *
	 * @param {string} id - The value of the 'id' attribute to search for.
	 * @returns {docNode|null} The first matching node, or `null` if none is found.
	 */
	docNode . prototype . getElementById = function ( id ) {

		// Use iterateNodes to find the node whose 'id' attribute matches.
		return this . iterateNodes ( function ( node ) {
			// Return true to continue if no match, false to stop if match is found.
			return node . attributes . id != id ;
		} ) ;

	} ;


	/**
	 * Retrieves the value of a specified attribute for the current node.
	 *
	 * @param {string} name - The name of the attribute to retrieve.
	 * @returns {*} The value of the attribute, or `undefined` if not found.
	 */
	docNode . prototype . getAttribute = function ( name ) {

		return this . attributes [ name ] ; // Access the attribute directly from the 'attributes' object.

	} ;


	/**
	 * Sets the value of a specified attribute for the current node.
	 *
	 * @param {string} name - The name of the attribute to set.
	 * @param {*} value - The value to assign to the attribute.
	 */
	docNode . prototype . setAttribute = function ( name , value ) {

		this . attributes [ name ] = value ; // Assign the value to the attribute in the 'attributes' object.

	} ;


	/**
	 * Searches a list of nodes for the document's main body node (nodeType 9).
	 *
	 * @param {Array<docNode>} nodeList - The array of document nodes.
	 * @returns {docNode|number} The body node if found, otherwise 0 (indicating not found).
	 */
	function findBody ( nodeList ) {

		var len = nodeList . length ; // Get the total number of nodes to iterate through


		// Loop through each node in the provided list.
		for ( var i = 0 ; i < len ; i ++ ) {

			var obj = nodeList [ i ] ;

			// Check if the current node's type is 9 (DOCUMENT_NODE or similar for body).
			if ( obj . nodeType == 9 )
				return obj ; // Return the found body node.
		}

		return 0 ; // Return 0 if no body node is found after checking all nodes.
	}


	/**
	 * Searches a list of nodes for a node with a specific index.
	 * The search is performed in reverse, which might be optimized for finding recently added nodes.
	 *
	 * @param {Array<docNode>} list - The array of nodes to search within.
	 * @param {number} id - The `index` property of the node to find.
	 * @returns {number} The array index of the found node, or -1 if not found.
	 */
	function findNodeID ( list , id ) {

		var len = list . length ; // Cache the length of the list for performance


		// Iterate backwards from the end of the list.
		for ( var i = len - 1 ; i > - 1 ; i -- ) {

			// If the current node's index matches the target ID, return its position in the list.
			if ( list [ i ] . index == id )
				return i ;
		}

		return - 1 ; // Return -1 if no node with the specified ID is found.
	}


	/**
	 * Trims a node stack down to a specific node identified by its index.
	 * This is useful for simulating closing tags and returning to a parent context.
	 *
	 * @param {Array<docNode>} nodeStack - The current stack of open nodes.
	 * @param {number} idx - The `index` property of the node to pop to.
	 * @returns {Array<docNode>} A new node stack, truncated at or after the specified index.
	 */
	function popToNodeStack ( nodeStack , idx ) {

		var closedNodeIDX = findNodeID ( nodeStack , idx ) ; // Find the position of the target node in the stack


		if ( closedNodeIDX >= 0 ) {
			// If the node is found, slice the stack to include it and all preceding nodes.
			return nodeStack . slice ( 0 , closedNodeIDX + 1 ) ;
		}

		return nodeStack ; // If the node is not found, return the original stack unchanged.
	}


	/**
	 * Finds the index of the last open node in the stack with a given tag name.
	 *
	 * @param {Array<docNode>} list - The stack of currently open nodes.
	 * @param {string} tagName - The tag name to search for (e.g., 'P', 'B').
	 * @returns {number} The index within the `list` array of the found node, or -1 if not found.
	 */
	function findOpenNode ( list , tagName ) {

		var len = list . length ; // Get the length of the list for iteration


		// Iterate backwards from the end of the list (most recently opened node).
		for ( var i = len - 1 ; i > - 1 ; i -- ) {

			// For debugging, if enabled: debugLog(list[i].tagName + '==' + tagName);
			if ( list [ i ] . tagName == tagName )
				return i ; // Return the index in the list if a matching tag name is found.
		}

		return - 1 ; // Return -1 if no node with the specified tag name is found in the stack.
	}


	/**
	 * Performs a basic layout pass on the document nodes to calculate render positions and sizes.
	 * This function modifies node properties directly.
	 *
	 * @param {docNode} body - The root body node from which to start layout.
	 * @param {Array<docNode>} nodeList - The complete list of document nodes.
	 * @returns {Array<docNode>} The modified nodeList with layout properties updated.
	 */
	function layout ( body , nodeList ) {

		var len = nodeList . length ; // Total number of nodes in the document


		var nodeStack = [ ] ; // Stack to keep track of open parent nodes during layout
		var ctx = document . getElementById ( 'output' ) . getContext ( "2d" ) ; // Get 2D rendering context


		// Initialize canvas rendering styles
		ctx . font = "12pt Arial" ;
		ctx . textAlign = "left" ;
		ctx . textBaseline = "top" ;
		ctx . fillStyle = "rgb(0, 0, 0, 1.0)" ;
		ctx . strokeStyle = "rgb(1, 0, 0, 1.0)" ;


		var curNode = body ; // Start with the body as the current node
		nodeStack . push ( body ) ; // Add the body to the node stack


		// Iterate through nodes starting from after the body element.
		for ( var i = body . index + 1 ; i < len ; i ++ ) {

			var obj = nodeList [ i ] ; // The current node being processed


			// Log current node information for debugging purposes
			debugLog ( "[" + i + "]" + obj . tagName + "=" + obj . nodeValue + ' @ P[' + obj . parentIndex + '] START=' + ( curNode . blockX + curNode . renderWidth ) ) ;


			// Check if we've exited the scope of the body element.
			if ( obj . parentIndex < body . index ) {
				break ; // Stop layout if we're no longer within the body's descendants.
			}


			// Variable to indicate if a line break or block-level layout change is needed.
			var doBreak = false ;


			// Update the node stack if the current node's parent index indicates a closure of previous elements.
			if ( obj . parentIndex < curNode . index ) {

				var closedNodeIDX = findNodeID ( nodeStack , obj . parentIndex ) ; // Find the parent node's position in the stack

				// debugLog('POP STACK'); // Debugging message


				// Increment width and height for all parent nodes up to the closing index.
				// This propagates the dimensions of children back up the tree.
				for ( var j = nodeStack . length - 2 ; j >= closedNodeIDX ; j -- ) {

					// TODO: This width/height propagation needs more robust handling for complex layouts.
					var node = nodeStack [ j + 1 ] ;       // The child node whose dimensions are being propagated
					var parentNode = nodeStack [ j ] ;     // The parent node to update


					// If the child's right edge extends beyond the parent's current width, expand parent's width.
					if ( parentNode . blockX + parentNode . renderWidth < node . blockX + node . renderWidth )
						parentNode . renderWidth = node . blockX + node . renderWidth - parentNode . blockX ;


					// If the child's bottom edge extends beyond the parent's current height, expand parent's height.
					if ( parentNode . blockY + parentNode . renderHeight < node . blockY + node . renderHeight )
						parentNode . renderHeight = node . blockY + node . renderHeight - parentNode . blockY ;


					parentNode . renderX = node . blockX + node . renderWidth ; // Update parent's next render position
					debugLog ( "  [" + nodeStack [ j ] . index + "] += " + nodeStack [ j + 1 ] . index ) ; // Debugging parent update
				}


				// Test for a paragraph break: if the node being closed is a 'P' tag, force a line break.
				// TODO: This should be handled by CSS-like style rules, not hardcoded.
				if ( nodeStack [ closedNodeIDX + 1 ] . tagName == 'P' ) {
					doBreak = true ;
				}

				// Pop the stack to the correct parent node.
				nodeStack = popToNodeStack ( nodeStack , obj . parentIndex ) ;
				curNode = nodeStack [ nodeStack . length - 1 ] ; // The new current node is the top of the stack.
			}


			// Check if the current node is a content/text node (nodeType 3).
			if ( obj . nodeType == 3 ) {

				// Apply basic styling based on parent node's tag name.
				// TODO: Replace with proper style inheritance and cascade.
				if ( curNode . tagName == 'B' )
					ctx . font = "bold 12pt Arial" ; // Bold font for <b> tags
				else
					ctx . font = "12pt Arial" ;      // Regular font otherwise


				var renderMetrics = ctx . measureText ( obj . nodeValue ) ; // Measure the text width


				// debugLog("ADD ONTO " + curNode.tagName + "," + curNode.index); // Debugging text node processing


				debugLog ( '    R AT ' + curNode . renderX + '[' + curNode . index + ']' ) ; // Log render position


				// Plot position for the content node relative to the current node's render position.
				obj . renderX = curNode . renderX ;
				obj . renderY = curNode . renderY ;
				obj . renderWidth = renderMetrics . width ;


				// Increment current node's render position and update its total width.
				curNode . renderX += obj . renderWidth ;
				var delta = curNode . renderX - ( curNode . blockX + curNode . renderWidth ) ;
				if ( delta > 0 )
					curNode . renderWidth += delta ;


				curNode . renderHeight = 14 ; // Fixed height for text content, roughly 12pt font size.
			}
			else { // This is an element node (not content/text).

				// Sanity check: Ensure the current node's parent index is not greater than its own index.
				// This usually indicates a parsing error or malformed structure.
				if ( obj . parentIndex > curNode . index ) {
					debugLog ( "!!Parse oddity" ) ;
					continue ; // Skip this node if it's an oddity.
				}


				// Add the new element node to the stack.
				nodeStack . push ( obj ) ;


				// Set the block origin (top-left corner) for the new element.
				if ( doBreak ) {
					// If a break is required (e.g., after a <P> tag), start on a new line.
					obj . blockX = curNode . blockX ;
					obj . blockY = curNode . renderY + curNode . renderHeight ;
				}
				else {
					// Otherwise, continue on the same line from the current render position.
					obj . blockX = curNode . renderX ;
					obj . blockY = curNode . renderY ;
				}


				// Set the initial render position for the new element.
				obj . renderX = obj . blockX ;
				obj . renderY = obj . blockY ;


				curNode = obj ; // The new element becomes the current node.
			}
		}


		debugLog ( "LAYOUT:" ) ;
		debugLog ( nodeList ) ; // Log the final nodeList after layout for inspection.

		return nodeList ; // Return the nodeList with updated layout properties.
	}


	/**
	 * A simple debugging utility to log messages to the console if available.
	 *
	 * @param {string} line - The message to log.
	 */
	function debugLog ( line ) {

		if ( window . console )
			console . log ( line ) ; // Use console.log if the console object exists.

	}


	/**
	 * Renders the parsed document onto the canvas element.
	 * This function assumes `layout` has already been called to prepare node positions.
	 *
	 * @param {docHTML} doc - The `docHTML` object containing the parsed document structure.
	 */
	function render ( doc ) {

		var nodeList = doc . nodes ; // Get the array of all nodes
		var len = nodeList . length ; // Total number of nodes
		var curX = 0 ; // Current X position (unused in this render function, but present in original)
		var curY = 0 ; // Current Y position (unused in this render function, but present in original)


		var styleStack = [ ] ; // Stack for managing styles (currently unused)
		var nodeStack = [ ] ;  // Stack for managing parent nodes during traversal
		var ctx = document . getElementById ( 'output' ) . getContext ( "2d" ) ; // Get the 2D rendering context


		// Set initial rendering styles for the canvas.
		ctx . font = "12pt Arial" ;
		ctx . textAlign = "left" ;
		ctx . textBaseline = "top" ;
		ctx . fillStyle = "rgb(0, 0, 0, 1.0)" ;


		var body = doc . body ; // Get the body node, which is the root for rendering content


		// Pre-process the layout of all nodes before rendering.
		// This calculates all renderX, renderY, renderWidth, renderHeight properties.
		nodeList = layout ( body , nodeList ) ;


		// Iterate through nodes, starting from immediately after the body.
		var curNode = body ; // Current node being processed, initially the body
		for ( var i = body . index + 1 ; i < len ; i ++ ) {

			var obj = nodeList [ i ] ; // The node currently under consideration


			// If the current node's parent index is less than the body's index,
			// it means we've exited the body's scope, so stop rendering.
			if ( obj . parentIndex < body . index )
				break ;


			// DEBUG: Example of drawing a stroke rectangle for paragraph boundaries.
			// if (obj.tagName == 'P')
			//	ctx.strokeRect(obj.blockX, obj.blockY, obj.renderWidth, 12);


			// Update the node stack if the current node's parent index indicates a closure.
			// This simulates popping nodes off the stack as their closing tags are encountered.
			if ( obj . parentIndex < curNode . index ) {
				nodeStack = popToNodeStack ( nodeStack , obj . parentIndex ) ; // Adjust the stack
				curNode = nodeStack [ nodeStack . length - 1 ] ;               // Update the current node to the new top of stack
			}


			// If the node is a content/text node (nodeType 3).
			if ( obj . nodeType == 3 ) {

				// Apply basic styling based on the current parent node's tag.
				// TODO: Implement a proper CSS-like style lookup mechanism.
				if ( curNode . tagName == 'B' )
					ctx . font = "bold 12pt Arial" ; // Bold for <b> tags
				else
					ctx . font = "12pt Arial" ;      // Regular font otherwise


				// Render the text content at its pre-calculated position.
				ctx . fillText ( obj . nodeValue , obj . renderX , obj . renderY ) ;
				debugLog ( obj . nodeValue + " at " + obj . renderX + "," + obj . renderY ) ; // Log rendered text position
			}
			else { // If it's an element node (not content/text).

				// Sanity check: If the parent index is greater than the current node's index,
				// it indicates a structural anomaly, so skip.
				if ( obj . parentIndex > curNode . index )
					continue ;


				// This is a new element node, push it onto the stack and make it the current node.
				nodeStack . push ( obj ) ;
				curNode = obj ;
			}
		}

	}


	/**
	 * Populates standard DOM-like attributes on all nodes within the document.
	 * This includes parentNode, childNodes, firstChild, lastChild, previousSibling, and nextSibling.
	 *
	 * @param {docNode} root - The root node of the document (e.g., the `docHTML` object's main node)
	 *                         from which to start populating relationships.
	 */
	function populateDOM ( root )
	{
		var nodeStack = [ ] ;   // Stack to keep track of open parent nodes
		var curNode = root ;    // The current node whose children are being processed
		var lastNode = null ;   // The last node processed (for setting previousSibling)


		/*
		 * Example of expected DOM relationships after population:
		 *
		 * BODY[ch=[P,P], fc=P, lc=P]
		 *   P [pn=BODY, cn=P, ln=P, ch=[B,TX,B], fc=B, lc=B, ns=P]
		 *     B [pn=P, cn=B, ns=TX]
		 *     TX [cn=TX, ps=B, pn=P, ns=B]
		 *     B [cn=B, ps=TX, pn=P]
		 *   P [cn=P, ps=P, pn=BODY]
		 */


		// Iterate through all nodes starting from the root's descendants.
		root . iterateNodes ( function ( node ) {

			// Reset all DOM-related properties for the current node before setting them.
			node . childNodes = null ;
			node . firstChild = null ;
			node . lastChild = null ;
			node . previousSibling = null ;
			node . nextSibling = null ;


			// If the node's parent index is less than the current node on the stack,
			// it means we've closed one or more parent elements.
			if ( node . parentIndex < curNode . index ) {

				nodeStack = popToNodeStack ( nodeStack , node . parentIndex ) ; // Pop the stack back to the correct parent
				curNode = nodeStack [ nodeStack . length - 1 ] ;                 // Update the current parent node
			}


			// Set children of the current parent node (`curNode`).
			if ( curNode . childNodes == null ) {
				// If this is the first child, initialize childNodes array and set firstChild.
				curNode . childNodes = [ node ] ;
				curNode . firstChild = node ;
			}
			else {
				// Otherwise, add to the existing childNodes array.
				curNode . childNodes . push ( node ) ;
			}


			// Set sibling relationships.
			if ( curNode . lastChild ) {
				// If there was a previous lastChild, set its nextSibling to the current node.
				curNode . lastChild . nextSibling = node ;
				// Set the current node's previousSibling to the former lastChild.
				node . previousSibling = curNode . lastChild ;
			}

			curNode . lastChild = node ; // The current node now becomes the lastChild of its parent.
			node . parentNode = curNode ; // Set the current node's parentNode.


			// Update the stack for opening new nodes.
			if ( node . parentIndex >= curNode . index ) {
				// If the current node is a child or sibling at the same level as the current stack parent,
				// push it onto the stack as a potential new parent for subsequent nodes.
				nodeStack . push ( node ) ;
				curNode = node ; // The current node becomes the new context.
			}


			lastNode = node ; // Keep track of the last processed node (though not directly used for sibling logic here).
			return true ;     // Continue iterating through all nodes.
		} ) ;
	}


	// --- Functions to create different types of content nodes ---


	/**
	 * Adds a generic content node (nodeType 3 - Text Node) to the document.
	 *
	 * @param {docHTML} document - The `docHTML` object to which the node will be added.
	 * @param {string} content - The text content for the node.
	 * @param {docNode} parent - The parent `docNode` of this new content node.
	 * @returns {docNode} The newly created content node.
	 */
	function addContentNode ( document , content , parent )
	{
		var anon = new docNode ( 3 , document ) ; // Create a new docNode of type 3 (text)


		// Trim content unless the parent is a 'SPAN' tag (might preserve whitespace in spans).
		if ( parent . tagName == 'SPAN' )
			anon . nodeValue = content ;
		else
			anon . nodeValue = content . trim ( ) ;


		anon . index = document . nodes . length ; // Assign a unique index
		anon . parentIndex = parent . index ;     // Set the parent's index
		document . nodes . push ( anon ) ;        // Add the node to the document's node list

		return anon ; // Return the newly created node.
	}


	/**
	 * Adds a root-level node (e.g., HTML tag) to the document.
	 *
	 * @param {docHTML} document - The `docHTML` object.
	 * @param {string} content - The node's value (can be empty).
	 * @param {docNode} parent - The parent node (typically implies no parent, parentIndex -1).
	 * @returns {docNode} The newly created root node.
	 */
	function addRootNode ( document , content , parent )
	{
		var anon = new docNode ( 1 , document ) ; // Create a new docNode of type 1 (element)


		anon . nodeValue = content ; // Assign content
		anon . index = document . nodes . length ; // Assign index
		anon . parentIndex = - 1 ;                 // Root nodes have parentIndex -1
		document . nodes . push ( anon ) ;         // Add to document's node list

		return anon ; // Return the new node.
	}


	/**
	 * Adds a document attribute node (e.g., TITLE tag) to the document.
	 *
	 * @param {docHTML} document - The `docHTML` object.
	 * @param {string} content - The text content of the attribute node.
	 * @param {docNode} parent - The parent node (e.g., <head>).
	 * @returns {docNode} The newly created attribute node.
	 */
	function addDocAttrNode ( document , content , parent )
	{
		var anon = new docNode ( 2 , document ) ; // Create a new docNode of type 2 (attribute node, though typically used for text content of specific tags)


		anon . nodeValue = content . trim ( ) ; // Assign trimmed content
		anon . index = document . nodes . length ; // Assign index
		anon . parentIndex = parent . index ;     // Set parent's index
		document . nodes . push ( anon ) ;        // Add to document's node list

		return anon ; // Return the new node.
	}


	/**
	 * Adds a body node (nodeType 9) to the document.
	 *
	 * @param {docHTML} document - The `docHTML` object.
	 * @param {string} content - The node's value (can be empty).
	 * @param {docNode} parent - The parent node (typically <html>).
	 * @returns {docNode} The newly created body node.
	 */
	function addBodyNode ( document , content , parent )
	{
		var anon = new docNode ( 9 , document ) ; // Create a new docNode of type 9 (Document_Fragment_Node or similar for body representation)


		anon . nodeValue = content . trim ( ) ; // Assign trimmed content
		anon . index = document . nodes . length ; // Assign index
		anon . parentIndex = parent . index ;     // Set parent's index
		document . nodes . push ( anon ) ;        // Add to document's node list

		return anon ; // Return the new node.
	}


	/**
	 * Adds a generic dummy node (nodeType 0) to the document.
	 * This is likely used for elements that don't have special parsing logic beyond being containers.
	 *
	 * @param {docHTML} document - The `docHTML` object.
	 * @param {string} content - The node's value (can be empty).
	 * @param {docNode} parent - The parent node.
	 * @returns {docNode} The newly created dummy node.
	 */
	function addDummyNode ( document , content , parent )
	{
		var anon = new docNode ( 1 , document ) ; // Create a new docNode (initially type 1 for element)


		anon . nodeType = 0 ;                   // Explicitly set nodeType to 0
		anon . nodeValue = content . trim ( ) ; // Assign trimmed content
		anon . index = document . nodes . length ; // Assign index
		anon . parentIndex = parent . index ;     // Set parent's index
		document . nodes . push ( anon ) ;        // Add to document's node list

		return anon ; // Return the new node.
	}


	// Map of tag names to their corresponding node creation functions.
	// This allows dynamic creation of specific node types based on the parsed tag.
	var makeTagFuncs = {
		'HTML'  : addRootNode ,
		'TITLE' : addDocAttrNode ,
		'BODY'  : addBodyNode ,
		'P'     : addDummyNode ,
		'B'     : addDummyNode ,
		'SPAN'  : addDummyNode ,
	} ;


	// Regular expression to strip HTML comments from the input string.
	// This is a simple regex and might not handle all edge cases of comments.
	var HTMLCommentStrip = new RegExp ( "<![^>]*>" ) ;


	/**
	 * Parses an HTML string into a custom `docHTML` document structure.
	 * This function extracts tags, attributes, and content, building a flat list of nodes
	 * with parent-child relationships indicated by `parentIndex`.
	 *
	 * @param {string} doc - The HTML string to parse.
	 * @returns {docHTML} The parsed document object.
	 *
	 * Example Input:
	 * "<html><head><title></title></head><body><p class="top">FOO <b>woo</b></p><p>Foo 2</p></body></html>"
	 *
	 * Example Output (simplified representation of the node list):
	 * [
	 *  ["html", "", 0, -1],
	 *  ["head", "", 1, 0],
	 *  ["title", "", 2, 1],
	 *  ["body", "", 3, 0],
	 *  ["p", "FOO ", 4, 3],
	 *  ["b", "woo", 5, 4],
	 *  ["p", "Foo 2", 6, 3],
	 * ]
	 */
	function parse ( doc ) {

		// Regular expression to find HTML tags (opening or closing) and their attributes.
		// Group 1: Tag name (e.g., 'div', 'p')
		// Group 2: Attributes string (e.g., ' class="top"')
		var tagParse = new RegExp ( "</?([A-Za-z]*)( ([a-zA-Z0-9_-]*=(\".*\")|('.*') ?)*)?>" , "" ) ;