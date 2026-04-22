/*
 * JSHint directives for this file.
 * We're intentionally being lenient with strict mode,
 * undefined variables, unused variables, and late definitions
 * to match the original code's context.
 */
/*jshint strict:false, undef:false, unused:false, latedef:false */



// Helper function: Retrieves the node immediately preceding a given offset within a parent node.
var getNodeBefore = function (node, offset) {
    // Initialize children collection.
    var children = node.childNodes;

    // Traverse up the tree while an offset exists and the node is an element.
    while (offset && node.nodeType === ELEMENT_NODE) {
        // Move to the previous sibling element.
        node     = children[offset - 1];
        // Update children for the new node.
        children = node.childNodes;
        // Set offset to the end of the new node's children.
        offset   = children.length;
    }
    // Return the found node.
    return node;
};



/*
 * Another utility function:
 *   Gets the node immediately following a given offset within a parent node.
 */
var getNodeAfter = function ( node, offset ) {
    // Only proceed if the current node is an element type.
    if ( node.nodeType === ELEMENT_NODE ) {
        // Grab all child nodes of the current element.
        var children = node.childNodes;

        // If the offset is within the bounds of the children array...
        if ( offset < children.length ) {
            // ...then the node after is simply the child at that offset.
            node = children[ offset ];
        }
        // Otherwise, if the offset is at or beyond the end of children...
        else {
            // Traverse up the parent chain until a nextSibling is found or the root is reached.
            while ( node && !node.nextSibling ) {
                node = node.parentNode;
            }
            // If a node was found (i.e., not null), move to its next sibling.
            if ( node ) {
                node = node.nextSibling;
            }
        }
    }
    // Return the identified node.
    return node;
};

// --- Separator for logical sections ---



/**
 * Inserts a DOM node into the specified range.
 * The range will be updated to enclose the inserted node.
 * @param {Range} range - The DOM Range object.
 * @param {Node} node - The DOM Node to insert.
 */
var insertNodeInRange = function ( range, node ) {

    // Extract start and end boundary points of the range.
    var startContainer = range.startContainer,
        startOffset    = range.startOffset,
        endContainer   = range.endContainer,
        endOffset      = range.endOffset,
        parent, children, childCount, afterSplit; // Declare additional local variables.

    // Scenario 1: Insertion point is within a text node.
    if ( startContainer.nodeType === TEXT_NODE ) {
        // Get the parent of the text node.
        parent = startContainer.parentNode;
        // Get all children of the parent.
        children = parent.childNodes;

        // If the offset is at the very end of the text node...
        if ( startOffset === startContainer.length ) {
            // Adjust startOffset to be after the text node in its parent's children list.
            startOffset = indexOf.call( children, startContainer ) + 1;
            // If the range is collapsed, the end boundary also moves to this new point.
            if ( range.collapsed ) {
                endContainer = parent;
                endOffset    = startOffset;
            }
        }
        // If the offset is somewhere in the middle of the text node...
        else {
            // If there's an offset (i.e., not at the very beginning)...
            if ( startOffset ) {
                // Split the text node at the startOffset.
                afterSplit = startContainer.splitText( startOffset );

                // Adjust endContainer/endOffset if they were pointing to the original text node.
                if ( endContainer === startContainer ) {
                    endOffset    -= startOffset; // Adjust offset relative to new node.
                    endContainer  = afterSplit;  // Point to the new text node part.
                }
                // If endContainer was the parent, it now needs to account for the split.
                else if ( endContainer === parent ) {
                    endOffset += 1; // Increment offset as a new node was inserted (afterSplit).
                }
                startContainer = afterSplit; // The insertion point is now before 'afterSplit'.
            }
            // Update startOffset to be the index of the (potentially new) startContainer in its parent.
            startOffset = indexOf.call( children, startContainer );
        }
        // The effective startContainer for insertion is now the parent element.
        startContainer = parent;
    }
    // Scenario 2: Insertion point is within an element node.
    else {
        // Children are directly the childNodes of the startContainer.
        children = startContainer.childNodes;
    }

    // Get the initial count of children in the startContainer.
    childCount = children.length;

    // Perform the actual insertion.
    // If the offset is at the end of the children list, append the node.
    if ( startOffset === childCount ) {
        startContainer.appendChild( node );
    }
    // Otherwise, insert the node before the child at the specified offset.
    else {
        startContainer.insertBefore( node, children[ startOffset ] );
    }

    // Adjust the endOffset if the insertion happened within the same container
    // as the range's end point.
    if ( startContainer === endContainer ) {
        endOffset += children.length - childCount; // Account for new nodes.
    }

    // Update the range boundaries to encompass the inserted node.
    range.setStart( startContainer, startOffset );
    range.setEnd( endContainer, endOffset );

};



/**
 * Extracts the contents of a range.
 * This removes the content from the DOM and returns it as a DocumentFragment.
 * @param {Range} range - The DOM Range object.
 * @param {Node} [common] - Optional common ancestor; if not provided, it's computed.
 * @returns {DocumentFragment} A DocumentFragment containing the extracted content.
 */
var extractContentsOfRange = function ( range, common ) {
    // Store original range boundaries.
    var startContainer = range.startContainer,
        startOffset    = range.startOffset,
        endContainer   = range.endContainer,
        endOffset      = range.endOffset;

    // If a common ancestor is not explicitly provided, calculate it.
    if ( !common ) {
        common = range.commonAncestorContainer;
    }

    // If the common ancestor is a text node, use its parent instead.
    if ( common.nodeType === TEXT_NODE ) {
        common = common.parentNode;
    }

    // Split the endContainer and startContainer at their respective offsets.
    // This isolates the content to be extracted.
    var endNode   = split( endContainer, endOffset, common ),
        startNode = split( startContainer, startOffset, common ),
        // Create a document fragment to hold the extracted nodes.
        frag      = common.ownerDocument.createDocumentFragment(),
        next, before, after; // Declare variables for loop and merging.

    // Iterate through the nodes between startNode and endNode,
    // moving them into the document fragment.
    // Note: endNode will be null if the split occurred at the very end of the child list.
    while ( startNode !== endNode ) {
        // Keep a reference to the next sibling before appending.
        next = startNode.nextSibling;
        // Append the current startNode to the fragment.
        frag.appendChild( startNode );
        // Move to the next node.
        startNode = next;
    }

    // Update the range's start point after extraction.
    startContainer = common;
    // If an endNode exists, the startOffset is its index; otherwise, it's the end of children.
    startOffset    = endNode ?
        indexOf.call( common.childNodes, endNode ) :
        common.childNodes.length;

    /*
     * Important optimization/fix: Merge adjacent text nodes.
     * This is particularly relevant for IE10, which can struggle with focusing
     * between two separate but adjacent text nodes.
     */
    after  = common.childNodes[ startOffset ];          // Node immediately after the extraction point.
    before = after && after.previousSibling;            // Node immediately before the extraction point.

    // Check if both 'before' and 'after' nodes exist and are text nodes.
    if ( before &&
            before.nodeType === TEXT_NODE &&
            after.nodeType  === TEXT_NODE ) {
        // If so, merge them.
        startContainer = before;                     // New start container is the 'before' text node.
        startOffset    = before.length;              // New start offset is its current length.
        before.appendData( after.data );             // Append data from 'after' to 'before'.
        detach( after );                             // Remove the 'after' text node from the DOM.
    }

    // Collapse the range to its new start point.
    range.setStart( startContainer, startOffset );
    range.collapse( true );

    // Ensure the cursor is fixed in the common ancestor.
    fixCursor( common );

    // Return the document fragment containing the extracted content.
    return frag;
};



/**
 * Deletes the contents of a given range from the DOM.
 * This function also handles merging blocks if necessary after deletion.
 * @param {Range} range - The DOM Range object whose contents are to be deleted.
 */
var deleteContentsOfRange = function ( range ) {
    // Step 1: Move the range boundaries up the tree as much as possible.
    // This helps to reduce the need for splitting nodes, simplifying deletion.
    moveRangeBoundariesUpTree( range );

    // Step 2: Extract the content within the (now expanded) range.
    // This effectively removes the content from the DOM.
    extractContentsOfRange( range );

    // Step 3: Move the range boundaries back down the tree.
    // This ensures the range collapses *inside* a block-level element,
    // preventing cases where it might be collapsed between two blocks,
    // which could lead to get(Start|End)BlockOfRange returning null.
    moveRangeBoundariesDownTree( range );

    // Step 4: Check if the deletion caused two different blocks to meet.
    // If so, merge them to maintain structural integrity.
    var startBlock = getStartBlockOfRange( range ), // Get the block containing the start of the range.
        endBlock   = getEndBlockOfRange( range );   // Get the block containing the end of the range.

    // If both blocks exist and they are different, merge them.
    if ( startBlock && endBlock && startBlock !== endBlock ) {
        mergeWithBlock( startBlock, endBlock, range );
    }

    // Step 5: Ensure the start block (if it still exists) has necessary children (e.g., <br> if empty).
    if ( startBlock ) {
        fixCursor( startBlock );
    }

    // Step 6: Ensure the document body has at least one block-level element.
    // This prevents the body from becoming completely empty or containing only inline content.
    var body  = range.endContainer.ownerDocument.body,
        child = body.firstChild;

    // If the body is empty or only contains a <br>, fix the cursor.
    if ( !child || child.nodeName === 'BR' ) {
        fixCursor( body );
        range.selectNodeContents( body.firstChild ); // Select the contents of the newly fixed body.
    }
};

// --- Section separator ---



/**
 * Inserts a DocumentFragment containing a tree of nodes into a given range.
 * This function handles both inline and block-level content insertion,
 * splitting and merging nodes as necessary to maintain valid HTML structure.
 *
 * @param {Range} range - The DOM Range object where the fragment will be inserted.
 * @param {DocumentFragment} frag - The DocumentFragment to insert.
 */
var insertTreeFragmentIntoRange = function ( range, frag ) {

    // First, determine if the fragment contains only inline content.
    var allInline = true,
        children  = frag.childNodes,
        l         = children.length;

    // Iterate through the fragment's children to check if all are inline.
    while ( l-- ) {
        if ( !isInline( children[l] ) ) {
            allInline = false; // Found a non-inline element.
            break;             // No need to check further.
        }
    }

    // If the range is not collapsed, delete any existing selected content.
    if ( !range.collapsed ) {
        deleteContentsOfRange( range );
    }

    // Move the range boundaries down into the deepest possible text nodes.
    // This provides a more precise insertion point.
    moveRangeBoundariesDownTree( range );

    // Case 1: The fragment contains only inline content.
    if ( allInline ) {
        // Simply insert the fragment at the current range position.
        insertNodeInRange( range, frag );
        // Collapse the range to its end, placing the cursor after the inserted content.
        range.collapse( false );
    }
    // Case 2: The fragment contains block-level content.
    else {
        // Determine the split point and the ancestor up to which to split.
        var splitPoint     = range.startContainer,
            // Split the DOM at the range's start.
            // The split will go up to the nearest BLOCKQUOTE ancestor, or the body.
            nodeAfterSplit = split( splitPoint, range.startOffset,
                getNearest( splitPoint.parentNode, 'BLOCKQUOTE' ) ||
                splitPoint.ownerDocument.body ),
            // Get the node immediately before the split point.
            nodeBeforeSplit = nodeAfterSplit.previousSibling,
            // Initialize start and end containers/offsets for the new range.
            startContainer  = nodeBeforeSplit,
            startOffset     = startContainer.childNodes.length, // End of nodeBeforeSplit
            endContainer    = nodeAfterSplit,
            endOffset       = 0, // Start of nodeAfterSplit
            parent          = nodeAfterSplit.parentNode, // Parent where insertion happens
            child, node; // Helper variables for loops.

        // Traverse down into nodeBeforeSplit to find the deepest inline element.
        while ( ( child = startContainer.lastChild ) &&
                child.nodeType === ELEMENT_NODE &&
                child.nodeName !== 'BR' ) {
            startContainer = child;
            startOffset    = startContainer.childNodes.length;
        }
        // Traverse down into nodeAfterSplit to find the deepest inline element.
        while ( ( child = endContainer.firstChild ) &&
                child.nodeType === ELEMENT_NODE &&
                child.nodeName !== 'BR' ) {
            endContainer = child;
        }

        // Move leading inline children from the fragment into nodeBeforeSplit.
        while ( ( child = frag.firstChild ) && isInline( child ) ) {
            startContainer.appendChild( child );
        }
        // Move trailing inline children from the fragment into nodeAfterSplit.
        while ( ( child = frag.lastChild ) && isInline( child ) ) {
            endContainer.insertBefore( child, endContainer.firstChild );
            endOffset += 1;
        }

        // Fix cursors for any new block elements in the fragment, then insert the block(s).
        node = frag;
        while ( node = getNextBlock( node ) ) {
            fixCursor( node );
        }
        // Insert the remaining (block-level) fragment between the split points.
        parent.insertBefore( frag, nodeAfterSplit );

        // Clean up: Remove empty nodes created by the split and merge containers.
        node = nodeAfterSplit.previousSibling; // 'node' is now the last inserted block or nodeBeforeSplit.

        // If nodeAfterSplit is now empty, remove it. Otherwise, merge it.
        if ( !nodeAfterSplit.textContent ) {
            parent.removeChild( nodeAfterSplit );
        } else {
            mergeContainers( nodeAfterSplit );
        }
        // If nodeAfterSplit was removed, update endContainer/endOffset.
        if ( !nodeAfterSplit.parentNode ) {
            endContainer = node;
            endOffset    = getLength( endContainer );
        }

        // If nodeBeforeSplit is now empty, remove it. Otherwise, merge it.
        if ( !nodeBeforeSplit.textContent ) {
            startContainer = nodeBeforeSplit.nextSibling;
            startOffset    = 0;
            parent.removeChild( nodeBeforeSplit );
        } else {
            mergeContainers( nodeBeforeSplit );
        }

        // Update the range to enclose the newly inserted content and merged structures.
        range.setStart( startContainer, startOffset );
        range.setEnd( endContainer, endOffset );
        // Move boundaries down again for precise cursor placement.
        moveRangeBoundariesDownTree( range );
    }
};

// --- End of a major section ---



/**
 * Checks if a given node is contained within a DOM Range.
 *
 * @param {Range} range - The DOM Range object.
 * @param {Node} node - The DOM Node to check.
 * @param {boolean} partial - If true, returns true if any part of the node overlaps the range.
 *                            If false, returns true only if the node is fully enclosed by the range.
 * @returns {boolean} True if the node is contained (partially or fully) within the range, false otherwise.
 */
var isNodeContainedInRange = function ( range, node, partial ) {
    // Create a temporary range to represent the node's boundaries.
    var nodeRange = node.ownerDocument.createRange();

    // Select the entire node within this temporary range.
    nodeRange.selectNode( node );

    // Logic for partial containment check.
    if ( partial ) {
        /*
         * For partial containment, the node must *not* finish before the range starts,
         * AND it must *not* start after the range finishes.
         */
        var nodeEndBeforeStart   = ( range.compareBoundaryPoints(
                END_TO_START, nodeRange ) > -1 ), // Node's end is before range's start.
            nodeStartAfterEnd    = ( range.compareBoundaryPoints(
                START_TO_END, nodeRange ) < 1 );  // Node's start is after range's end.

        return ( !nodeEndBeforeStart && !nodeStartAfterEnd );
    }
    // Logic for full containment check.
    else {
        /*
         * For full containment, the node must start after or at the range's start,
         * AND it must finish before or at the range's end.
         */
        var nodeStartAfterStart  = ( range.compareBoundaryPoints(
                START_TO_START, nodeRange ) < 1 ), // Node's start is after range's start.
            nodeEndBeforeEnd     = ( range.compareBoundaryPoints(
                END_TO_END, nodeRange ) > -1 );    // Node's end is before range's end.

        return ( nodeStartAfterStart && nodeEndBeforeEnd );
    }
};



/**
 * Moves the boundaries of a range down the DOM tree into the deepest possible text nodes.
 * This is useful for normalizing range positions to be within text content or just before/after leaf nodes.
 *
 * @param {Range} range - The DOM Range object to adjust.
 */
var moveRangeBoundariesDownTree = function ( range ) {
    // Extract current range boundary information.
    var startContainer = range.startContainer,
        startOffset    = range.startOffset,
        endContainer   = range.endContainer,
        endOffset      = range.endOffset,
        child; // Variable to hold child nodes during traversal.

    // Move start boundary down:
    // Keep traversing down as long as the container is not a text node.
    while ( startContainer.nodeType !== TEXT_NODE ) {
        // Get the child at the current offset.
        child = startContainer.childNodes[ startOffset ];
        // If no child exists or the child is a leaf node (cannot go deeper), break.
        if ( !child || isLeaf( child ) ) {
            break;
        }
        // Move the container to the child and reset offset to 0 (beginning of child).
        startContainer = child;
        startOffset    = 0;
    }

    // Move end boundary down:
    // If endOffset is not 0 (meaning the end is not at the very beginning of a container).
    if ( endOffset ) {
        // Keep traversing down as long as the container is not a text node.
        while ( endContainer.nodeType !== TEXT_NODE ) {
            // Get the child *before* the current offset.
            child = endContainer.childNodes[ endOffset - 1 ];
            // If no child exists or the child is a leaf node, break.
            if ( !child || isLeaf( child ) ) {
                break;
            }
            // Move the container to the child and set offset to its length (end of child).
            endContainer = child;
            endOffset    = getLength( endContainer );
        }
    }
    // If endOffset is 0 (meaning the end is at the very beginning of a container).
    else {
        // Keep traversing down as long as the container is not a text node.
        while ( endContainer.nodeType !== TEXT_NODE ) {
            // Get the first child.
            child = endContainer.firstChild;
            // If no child exists or the child is a leaf node, break.
            if ( !child || isLeaf( child ) ) {
                break;
            }
            // Move the container to the first child. Offset remains 0.
            endContainer = child;
        }
    }

    // After adjusting boundaries, apply them to the range.
    // Special handling for collapsed ranges: The algorithm above might find
    // positions *outside* the original collapsed point and then flip them.
    if ( range.collapsed ) {
        // For a collapsed range, both start and end should be the same.
        // The previous logic for `endContainer`/`endOffset` effectively tracks
        // the correct final collapsed point.
        range.setStart( endContainer, endOffset );
        range.setEnd( startContainer, startOffset );
    } else {
        // For an expanded range, simply set the adjusted start and end.
        range.setStart( startContainer, startOffset );
        range.setEnd( endContainer, endOffset );
    }
};



/**
 * Moves the boundaries of a range up the DOM tree as much as possible.
 * This function attempts to move the range's start and end containers
 * to higher-level parent nodes, adjusting offsets accordingly, without
 * changing the actual content encompassed by the range.
 *
 * @param {Range} range - The DOM Range object to adjust.
 * @param {Node} [common] - Optional common ancestor; if not provided, it's computed.
 */
var moveRangeBoundariesUpTree = function ( range, common ) {
    // Get the current start and end points of the range.
    var startContainer = range.startContainer,
        startOffset    = range.startOffset,
        endContainer   = range.endContainer,
        endOffset      = range.endOffset,
        parent; // Variable to temporarily hold parent nodes.

    // If a common ancestor is not provided, calculate it from the range.
    if ( !common ) {
        common = range.commonAncestorContainer;
    }

    // Move the start boundary up:
    // Continue moving up as long as the startContainer is not the common ancestor
    // and the startOffset is 0 (meaning the start is at the beginning of its container).
    while ( startContainer !== common && !startOffset ) {
        parent       = startContainer.parentNode; // Get the parent of the current container.
        startOffset  = indexOf.call( parent.childNodes, startContainer ); // Get the index of the current container within its parent.
        startContainer = parent;                  // Move the startContainer up to its parent.
    }

    // Move the end boundary up:
    // Continue moving up as long as the endContainer is not the common ancestor
    // and the endOffset is at the very end of its container.
    while ( endContainer !== common &&
            endOffset === getLength( endContainer ) ) {
        parent      = endContainer.parentNode; // Get the parent of the current container.
        endOffset   = indexOf.call( parent.childNodes, endContainer ) + 1; // Get the index of the container + 1 (after it).
        endContainer = parent;                 // Move the endContainer up to its parent.
    }

    // Apply the adjusted start and end boundaries to the range.
    range.setStart( startContainer, startOffset );
    range.setEnd( endContainer, endOffset );
};



/**
 * Retrieves the first block-level element that is at least partially
 * contained within the given range.
 *
 * @param {Range} range - The DOM Range object.
 * @returns {Element|null} The first block element, or null if none is found.
 */
var getStartBlockOfRange = function ( range ) {
    var container = range.startContainer, // The node where the range begins.
        block;                            // Variable to store the found block.

    // If the start container is an inline element (or text node within one).
    if ( isInline( container ) ) {
        block = getPreviousBlock( container ); // Find the containing block for this inline content.
    }
    // If the start container itself is a block element.
    else if ( isBlock( container ) ) {
        block = container; // The container is the block.
    }
    // If the start container is a parent of blocks or mixed content.
    else {
        // Find the node before the start offset, then the next block from there.
        block = getNodeBefore( container, range.startOffset );
        block = getNextBlock( block );
    }

    // Final check: Ensure the found block actually intersects with the range.
    // 'true' for partial containment.
    return block && isNodeContainedInRange( range, block, true ) ? block : null;
};



/**
 * Retrieves the last block-level element that is at least partially
 * contained within the given range.
 *
 * @param {Range} range - The DOM Range object.
 * @returns {Element|null} The last block element, or null if none is found.
 */
var getEndBlockOfRange = function ( range ) {
    var container = range.endContainer, // The node where the range ends.
        block, child;                   // Variables to store the found block and for traversal.

    // If the end container is an inline element (or text node within one).
    if ( isInline( container ) ) {
        block = getPreviousBlock( container ); // Find the containing block for this inline content.
    }
    // If the end container itself is a block element.
    else if ( isBlock( container ) ) {
        block = container; // The container is the block.
    }
    // If the end container is a parent of blocks or mixed content.
    else {
        // Find the node after the end offset.
        block = getNodeAfter( container, range.endOffset );
        // If no node was found (e.g., at the very end of the document).
        if ( !block ) {
            // Default to the document body, then traverse to its last child.
            block = container.ownerDocument.body;
            while ( child = block.lastChild ) {
                block = child;
            }
        }
        block = getPreviousBlock( block ); // Find the block preceding this node.

    }
    // Final check: Ensure the found block actually intersects with the range.
    // 'true' for partial containment.
    return block && isNodeContainedInRange( range, block, true ) ? block : null;
};



/**
 * A TreeWalker instance configured to find significant content nodes.
 * It considers text nodes (that are not just whitespace) and IMG elements.
 *
 * - `root`: This will be set dynamically based on the current search context.
 * - `whatToShow`: `SHOW_TEXT | SHOW_ELEMENT` means it will show both text and element nodes.
 * - `filter`: A function that determines if a node is 'visible' to the walker.
 *   - For text nodes, it checks if `notWS.test(node.data)` is true (i.e., contains non-whitespace).
 *   - For element nodes, it checks if `node.nodeName === 'IMG'` (i.e., only images are considered).
 */
var contentWalker = new TreeWalker( null,
    SHOW_TEXT | SHOW_ELEMENT, // Show both text and element nodes.
    function ( node ) {
        return node.nodeType === TEXT_NODE ? // If it's a text node...
            notWS.test( node.data ) :        // ...return true if it contains non-whitespace.
            node.nodeName === 'IMG';         // If it's an element, return true if it's an IMG.
    }
);



/**
 * Determines if a given range starts at the beginning of a block-level boundary.
 * This means there is no significant content (text or image) before the range's start
 * within its containing block.
 *
 * @param {Range} range - The DOM Range object to check.
 * @returns {boolean} True if the range starts at a block boundary, false otherwise.
 */
var rangeDoesStartAtBlockBoundary = function ( range ) {
    var startContainer = range.startContainer, // The node where the range starts.
        startOffset    = range.startOffset;    // The offset within that node.

    // If the range starts within a text node.
    if ( startContainer.nodeType === TEXT_NODE ) {
        // If the offset is not 0, it means we are in the middle or end of the text node,
        // so it's not a block boundary.
        if ( startOffset ) {
            return false;
        }
        // If offset is 0, set the walker's current node to this text node.
        contentWalker.currentNode = startContainer;
    }
    // If the range starts within an element node.
    else {
        // Set the walker's current node to the node *after* the start offset.
        // This positions the walker to search backward.
        contentWalker.currentNode = getNodeAfter( startContainer, startOffset );
    }

    // Set the root of the TreeWalker to the block containing the range's start.
    // This confines the search for previous content to the current block.
    contentWalker.root = getStartBlockOfRange( range );

    // If `previousNode()` returns null, it means there is no significant content
    // before the current position within the block, so it's a block boundary.
    return !contentWalker.previousNode();
};



/**
 * Determines if a given range ends at the end of a block-level boundary.
 * This means there is no significant content (text or image) after the range's end
 * within its containing block.
 *
 * @param {Range} range - The DOM Range object to check.
 * @returns {boolean} True if the range ends at a block boundary, false otherwise.
 */
var rangeDoesEndAtBlockBoundary = function ( range ) {
    var endContainer = range.endContainer, // The node where the range ends.
        endOffset    = range.endOffset,    // The offset within that node.
        length;                            // Variable to store node length.

    // If the range ends within a text node.
    if ( endContainer.nodeType === TEXT_NODE ) {
        length = endContainer.data.length; // Get the length of the text content.
        // If the text node has content and the offset is not at its very end,
        // it's not a block boundary.
        if ( length && endOffset < length ) {
            return false;
        }
        // If at the end, set the walker's current node to this text node.
        contentWalker.currentNode = endContainer;
    }
    // If the range ends within an element node.
    else {
        // Set the walker's current node to the node *before* the end offset.
        // This positions the walker to search forward.
        contentWalker.currentNode = getNodeBefore( endContainer, endOffset );
    }

    // Set the root of the TreeWalker to the block containing the range's end.
    // This confines the search for further content to the current block.
    contentWalker.root = getEndBlockOfRange( range );

    // If `nextNode()` returns null, it means there is no significant content
    // after the current position within the block, so it's a block boundary.
    return !contentWalker.nextNode();
};



/**
 * Expands a given range to encompass the full block-level boundaries of its content.
 * This means the range will be adjusted to start at the beginning of the first
 * block it contains and end at the end of the last block it contains.
 *
 * @param {Range} range - The DOM Range object to expand.
 */
var expandRangeToBlockBoundaries = function ( range ) {
    var start  = getStartBlockOfRange( range ), // Get the first block containing the range.
        end    = getEndBlockOfRange( range ),   // Get the last block containing the range.
        parent;                                 // Variable to store parent node.

    // Only proceed if both a start and end block are found.
    if ( start && end ) {
        // Adjust the range's start point:
        parent = start.parentNode; // Get the parent of the start block.
        // Set range start to the parent, at the index of the start block.
        range.setStart( parent, indexOf.call( parent.childNodes, start ) );

        // Adjust the range's end point:
        parent = end.parentNode; // Get the parent of the end block.
        // Set range end to the parent, at the index *after* the end block.
        range.setEnd( parent, indexOf.call( parent.childNodes, end ) + 1 );
    }
};