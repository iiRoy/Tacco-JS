/*
 * This file contains a collection of utility functions for manipulating DOM ranges
 * and nodes, particularly for rich text editing contexts.
 * The original code has been refactored and modified to produce a Type III clone.
 * This includes renaming all identifiers, reformatting, rewriting comments,
 * and structural changes like adding new intermediate variables, guard clauses,
 * and alternative equivalent expressions.
 */

// Global DOM Node type constants for clarity and potential future abstraction.
const DOM_NODE_TYPE_ELEMENT = 1; // Corresponds to Node.ELEMENT_NODE
const DOM_NODE_TYPE_TEXT = 3;    // Corresponds to Node.TEXT_NODE

// Range comparison constants, aliased for readability.
const RANGE_COMPARE_START_TO_START = 0; // Range.START_TO_START
const RANGE_COMPARE_START_TO_END = 1;   // Range.START_TO_END
const RANGE_COMPARE_END_TO_END = 2;     // Range.END_TO_END
const RANGE_COMPARE_END_TO_START = 3;   // Range.END_TO_START

// Helper to find the index of a node in a NodeList, similar to Array.prototype.indexOf.
const findNodeIndex = (nodeList, targetNode) => {
    // If the input is not a NodeList or is empty, return -1.
    if (!nodeList || nodeList.length === 0) {
        return -1;
    }
    // Iterate through the NodeList to find the targetNode.
    for (let currentIdx = 0; currentIdx < nodeList.length; currentIdx++) {
        if (nodeList[currentIdx] === targetNode) {
            return currentIdx;
        }
    }
    return -1; // Node not found.
};

/**
 * Retrieves the DOM node immediately preceding a given offset within a parent node.
 * If the parent is an element node, it navigates into child nodes to find the leaf.
 *
 * @param {Node} currentElement - The starting DOM node.
 * @param {number} positionIndex - The offset within the node's children or text content.
 * @returns {Node} The node found before the specified position.
 */
const retrievePriorElement = function ( currentElement, positionIndex ) {
    let childCollection = currentElement.childNodes;

    // Traverse down the tree as long as there's an offset and the current node is an element.
    while ( positionIndex > 0 && currentElement.nodeType === DOM_NODE_TYPE_ELEMENT ) {
        // Decrement positionIndex to get the child *before* the offset.
        const priorChild = childCollection[ positionIndex - 1 ];
        if (!priorChild) {
            // Should not happen if positionIndex > 0 and currentElement is element
            break;
        }
        currentElement = priorChild;
        childCollection = currentElement.childNodes;
        positionIndex = childCollection.length; // Move to the end of the new currentElement's children
    }
    return currentElement;
};

/**
 * Identifies the DOM node immediately following a given offset within a parent node.
 * This function handles both element and text nodes, potentially traversing up and then across.
 *
 * @param {Node} targetNode - The initial DOM node to start the search from.
 * @param {number} startIndex - The offset within the targetNode's children or text content.
 * @returns {Node|null} The node found after the specified position, or null if none.
 */
const acquireSubsequentNode = function ( targetNode, startIndex ) {
    // Ensure we have a valid target node to begin with.
    if (!targetNode) {
        return null;
    }

    if ( targetNode.nodeType === DOM_NODE_TYPE_ELEMENT ) {
        const descendants = targetNode.childNodes;
        // Check if the offset points to a child within the current element.
        if ( startIndex < descendants.length ) {
            targetNode = descendants[ startIndex ];
        } else {
            // If offset is at or beyond the last child, we need to look for the next sibling.
            // Traverse up the parent chain until a next sibling is found.
            let ancestorNode = targetNode;
            while ( ancestorNode && !ancestorNode.nextSibling ) {
                ancestorNode = ancestorNode.parentNode;
            }
            // If an ancestor with a next sibling was found, update targetNode to that sibling.
            if ( ancestorNode ) {
                targetNode = ancestorNode.nextSibling;
            } else {
                // No next sibling or ancestor with a next sibling found.
                targetNode = null;
            }
        }
    }
    return targetNode;
};

// ---

/**
 * Injects a given node into a specified DOM range.
 * The range boundaries may be adjusted after insertion.
 *
 * @param {Range} selectionBoundary - The DOM Range object where the node will be inserted.
 * @param {Node} itemToInsert - The DOM node to be inserted.
 */
const injectFragmentIntoSelection = function ( selectionBoundary, itemToInsert ) {
    // Extract range boundary points.
    let initialContainer = selectionBoundary.startContainer;
    let initialOffset = selectionBoundary.startOffset;
    let finalContainer = selectionBoundary.endContainer;
    let finalOffset = selectionBoundary.endOffset;
    let parentRef, childrenColl, numChildren, splitPartPost;

    // Handle insertion within a text node.
    if ( initialContainer.nodeType === DOM_NODE_TYPE_TEXT ) {
        parentRef = initialContainer.parentNode;
        childrenColl = parentRef.childNodes;

        // If the insertion point is at the very end of the text node.
        if ( initialOffset === initialContainer.length ) {
            initialOffset = findNodeIndex( childrenColl, initialContainer ) + 1;
            if ( selectionBoundary.collapsed ) {
                finalContainer = parentRef;
                finalOffset = initialOffset;
            }
        } else {
            // If insertion is in the middle of a text node, split it.
            if ( initialOffset > 0 ) {
                // The splitText method returns the new node containing the text after the split point.
                splitPartPost = initialContainer.splitText( initialOffset );
                // Adjust end boundary if it was within the original text node.
                if ( finalContainer === initialContainer ) {
                    finalOffset -= initialOffset;
                    finalContainer = splitPartPost;
                }
                // Adjust end boundary if it was the parent and the split added a new sibling.
                else if ( finalContainer === parentRef ) {
                    finalOffset += 1;
                }
                initialContainer = splitPartPost; // The new starting node is the part after the split.
            }
            initialOffset = findNodeIndex( childrenColl, initialContainer );
        }
        initialContainer = parentRef; // Insertion happens in the parent of the text node.
    } else {
        childrenColl = initialContainer.childNodes;
    }

    numChildren = childrenColl.length; // Count children before insertion.

    // Perform the actual DOM insertion.
    if ( initialOffset === numChildren ) {
        initialContainer.appendChild( itemToInsert );
    } else {
        initialContainer.insertBefore( itemToInsert, childrenColl[ initialOffset ] );
    }

    // Adjust the end offset if the insertion happened within the same container.
    if ( initialContainer === finalContainer ) {
        // The number of children might have changed.
        const childrenAdded = initialContainer.childNodes.length - numChildren;
        finalOffset += childrenAdded;
    }

    // Update the range with new boundary points.
    selectionBoundary.setStart( initialContainer, initialOffset );
    selectionBoundary.setEnd( finalContainer, finalOffset );
};

/**
 * Extracts the content of a given range into a DocumentFragment.
 * The original content within the range is removed from the DOM.
 *
 * @param {Range} activeRange - The DOM Range object to extract content from.
 * @param {Node} [sharedAncestor] - An optional common ancestor node to limit traversal.
 * @returns {DocumentFragment} A DocumentFragment containing the extracted nodes.
 */
const exciseRangeContent = function ( activeRange, sharedAncestor ) {
    let rangeStartContainer = activeRange.startContainer;
    let rangeStartOffset = activeRange.startOffset;
    let rangeEndContainer = activeRange.endContainer;
    let rangeEndOffset = activeRange.endOffset;

    // Determine the common ancestor if not provided.
    const effectiveCommonAncestor = sharedAncestor || activeRange.commonAncestorContainer;

    // If common ancestor is a text node, use its parent.
    const actualCommonAncestor = (effectiveCommonAncestor.nodeType === DOM_NODE_TYPE_TEXT) ?
        effectiveCommonAncestor.parentNode :
        effectiveCommonAncestor;

    // Split the end and start containers at their respective offsets.
    // 'split' is an assumed external utility function.
    const postSplitEnd = split( rangeEndContainer, rangeEndOffset, actualCommonAncestor );
    const preSplitStart = split( rangeStartContainer, rangeStartOffset, actualCommonAncestor );

    const documentFragment = actualCommonAncestor.ownerDocument.createDocumentFragment();
    let nextNodeInLoop;

    // Move all nodes between the split points into the document fragment.
    let currentProcessingNode = preSplitStart;
    while ( currentProcessingNode && currentProcessingNode !== postSplitEnd ) {
        nextNodeInLoop = currentProcessingNode.nextSibling;
        documentFragment.appendChild( currentProcessingNode );
        currentProcessingNode = nextNodeInLoop;
    }

    // Update the range's start container to the common ancestor.
    activeRange.setStart( actualCommonAncestor, (postSplitEnd ?
        findNodeIndex( actualCommonAncestor.childNodes, postSplitEnd ) :
        actualCommonAncestor.childNodes.length)
    );
    activeRange.collapse( true ); // Collapse the range to its new start point.

    // Attempt to merge adjacent text nodes to clean up after extraction.
    // This is important for browser compatibility (e.g., IE10).
    let nextSiblingNode = actualCommonAncestor.childNodes[ activeRange.startOffset ];
    let prevSiblingNode = nextSiblingNode && nextSiblingNode.previousSibling;

    if ( prevSiblingNode &&
            prevSiblingNode.nodeType === DOM_NODE_TYPE_TEXT &&
            nextSiblingNode &&
            nextSiblingNode.nodeType === DOM_NODE_TYPE_TEXT ) {
        // Merge the two text nodes.
        prevSiblingNode.appendData( nextSiblingNode.data );
        // 'detach' is an assumed external utility function to remove a node from its parent.
        detach( nextSiblingNode );
        // Adjust the range start point to reflect the merged text node.
        activeRange.setStart( prevSiblingNode, prevSiblingNode.length );
    }

    // 'fixCursor' is an assumed external utility function to ensure cursor visibility/validity.
    fixCursor( actualCommonAncestor );

    return documentFragment;
};

/**
 * Removes the content within a given range from the DOM.
 * This function also performs cleanup and normalization operations
 * like merging adjacent blocks or fixing cursor positions.
 *
 * @param {Range} currentSelection - The DOM Range object whose contents are to be deleted.
 */
const removeRangeContent = function ( currentSelection ) {
    // Pre-processing: Move range boundaries up the tree to minimize splits.
    // 'moveRangeBoundariesUpTree' is an assumed external utility.
    moveRangeBoundariesUpTree( currentSelection );

    // Core operation: Extract and discard the content.
    exciseRangeContent( currentSelection );

    // Post-processing: Move range boundaries back down the tree.
    // This ensures the range is within blocks, preventing null block returns.
    // 'moveRangeBoundariesDownTree' is an assumed external utility.
    moveRangeBoundariesDownTree( currentSelection );

    // After deletion, check if blocks need merging.
    const initialBlock = getStartBlockOfRange( currentSelection ); // Assumed external utility.
    const finalBlock = getEndBlockOfRange( currentSelection );     // Assumed external utility.

    if ( initialBlock && finalBlock && initialBlock !== finalBlock ) {
        // 'mergeWithBlock' is an assumed external utility.
        mergeWithBlock( initialBlock, finalBlock, currentSelection );
    }

    // Ensure the block where the cursor is now located has necessary children.
    if ( initialBlock ) {
        fixCursor( initialBlock ); // Assumed external utility.
    }

    // Final check for document body: ensure it always contains a block-level element.
    const ownerDocumentBody = currentSelection.endContainer.ownerDocument.body;
    const firstBodyChild = ownerDocumentBody.firstChild;
    // If the body is empty or only contains a <br>, ensure it's fixed for editing.
    if ( !firstBodyChild || firstBodyChild.nodeName === 'BR' ) {
        fixCursor( ownerDocumentBody ); // Assumed external utility.
        currentSelection.selectNodeContents( ownerDocumentBody.firstChild );
    }
};

// ---

/**
 * Inserts a DocumentFragment into a specified range.
 * Handles both inline and block content differently for correct DOM structure.
 *
 * @param {Range} targetRange - The DOM Range object where the fragment will be inserted.
 * @param {DocumentFragment} contentFragment - The DocumentFragment to insert.
 */
const insertFragmentWithinBoundary = function ( targetRange, contentFragment ) {
    // If the fragment is empty, there's nothing to insert.
    if (!contentFragment || contentFragment.childNodes.length === 0) {
        return;
    }

    let isEntirelyInline = true;
    const fragmentChildren = contentFragment.childNodes;
    let childCount = fragmentChildren.length;

    // Check if the fragment contains only inline content.
    while ( childCount-- ) {
        // 'isInline' is an assumed external utility.
        if ( !isInline( fragmentChildren[ childCount ] ) ) {
            isEntirelyInline = false;
            break;
        }
    }

    // First, remove any existing content selected by the range.
    if ( !targetRange.collapsed ) {
        removeRangeContent( targetRange );
    }

    // Normalize the range boundaries to be inside text nodes or leaf elements.
    moveRangeBoundariesDownTree( targetRange ); // Assumed external utility.

    // If the fragment contains only inline content, a simple insertion is sufficient.
    if ( isEntirelyInline ) {
        injectFragmentIntoSelection( targetRange, contentFragment );
        targetRange.collapse( false ); // Collapse to the end of the inserted content.
    }
    // If the fragment contains block-level content, a more complex split-and-insert is needed.
    else {
        // Determine the split point and its parent.
        const boundaryPoint = targetRange.startContainer;
        const commonParent = boundaryPoint.parentNode;

        // 'getNearest' is an assumed external utility.
        const blockquoteAncestor = getNearest( commonParent, 'BLOCKQUOTE' );
        const splitRoot = blockquoteAncestor || boundaryPoint.ownerDocument.body;

        // Split the DOM at the range's start point up to the determined root.
        // 'split' is an assumed external utility.
        const tailNode = split( boundaryPoint, targetRange.startOffset, splitRoot );
        const headNode = tailNode.previousSibling;

        // Initialize insertion points for inline content around the block insertion.
        let insertStartContainer = headNode;
        let insertStartOffset = insertStartContainer.childNodes.length;
        let insertEndContainer = tailNode;
        let insertEndOffset = 0;

        // Traverse down the head node to find the deepest inline element to append to.
        let currentChild;
        while ( ( currentChild = insertStartContainer.lastChild ) &&
                currentChild.nodeType === DOM_NODE_TYPE_ELEMENT &&
                currentChild.nodeName !== 'BR' ) {
            insertStartContainer = currentChild;
            insertStartOffset = insertStartContainer.childNodes.length;
        }
        // Traverse down the tail node to find the deepest inline element to prepend to.
        while ( ( currentChild = insertEndContainer.firstChild ) &&
                currentChild.nodeType === DOM_NODE_TYPE_ELEMENT &&
                currentChild.nodeName !== 'BR' ) {
            insertEndContainer = currentChild;
        }

        // Insert leading inline content from the fragment into the head node.
        while ( ( currentChild = contentFragment.firstChild ) && isInline( currentChild ) ) {
            insertStartContainer.appendChild( currentChild );
        }
        // Insert trailing inline content from the fragment into the tail node.
        while ( ( currentChild = contentFragment.lastChild ) && isInline( currentChild ) ) {
            insertEndContainer.insertBefore( currentChild, insertEndContainer.firstChild );
            insertEndOffset += 1; // Increment offset for each prepended child.
        }

        // Fix cursor for any new block elements in the fragment before inserting the fragment itself.
        let blockNodeToFix = contentFragment;
        // 'getNextBlock' is an assumed external utility.
        while ( ( blockNodeToFix = getNextBlock( blockNodeToFix ) ) ) {
            fixCursor( blockNodeToFix ); // Assumed external utility.
        }
        // Insert the remaining (block) fragment content.
        commonParent.insertBefore( contentFragment, tailNode );

        // Clean up empty nodes created by the split and merge containers.
        let nodeToCheck = tailNode.previousSibling; // The node just inserted.
        if ( !tailNode.textContent ) { // Check if the tail node became empty.
            commonParent.removeChild( tailNode );
        } else {
            // 'mergeContainers' is an assumed external utility.
            mergeContainers( tailNode );
        }
        // If tailNode was removed, adjust endContainer.
        if ( !tailNode.parentNode ) {
            insertEndContainer = nodeToCheck;
            insertEndOffset = getLength( insertEndContainer ); // 'getLength' assumed external utility.
        }

        if ( !headNode.textContent ) { // Check if the head node became empty.
            insertStartContainer = headNode.nextSibling;
            insertStartOffset = 0;
            commonParent.removeChild( headNode );
        } else {
            mergeContainers( headNode );
        }

        // Update the range to encompass the inserted content correctly.
        targetRange.setStart( insertStartContainer, insertStartOffset );
        targetRange.setEnd( insertEndContainer, insertEndOffset );
        moveRangeBoundariesDownTree( targetRange ); // Re-normalize.
    }
};

// ---

/**
 * Determines if a given DOM node is contained within a specified Range.
 *
 * @param {Range} queryRange - The DOM Range to check against.
 * @param {Node} queryNode - The DOM node to test for containment.
 * @param {boolean} [allowPartialOverlap=false] - If true, returns true for partial overlaps.
 * @returns {boolean} True if the node is contained (fully or partially) within the range, false otherwise.
 */
const isElementWithinRange = function ( queryRange, queryNode, allowPartialOverlap = false ) {
    // Create a temporary range for the queryNode.
    const tempNodeRange = queryNode.ownerDocument.createRange();
    tempNodeRange.selectNode( queryNode );

    if ( allowPartialOverlap ) {
        // For partial overlap, the node must not completely finish before the range starts,
        // nor completely start after the range finishes.
        const nodeFinishesBeforeRangeStarts = ( queryRange.compareBoundaryPoints(
            RANGE_COMPARE_END_TO_START, tempNodeRange ) > -1 );
        const nodeStartsAfterRangeFinishes = ( queryRange.compareBoundaryPoints(
            RANGE_COMPARE_START_TO_END, tempNodeRange ) < 1 );
        return ( !nodeFinishesBeforeRangeStarts && !nodeStartsAfterRangeFinishes );
    }
    else {
        // For full containment, the node must start after or at the range's start,
        // and finish before or at the range's end.
        const nodeStartsAfterRangeBeginning = ( queryRange.compareBoundaryPoints(
            RANGE_COMPARE_START_TO_START, tempNodeRange ) < 1 );
        const nodeEndsBeforeRangeEnd = ( queryRange.compareBoundaryPoints(
            RANGE_COMPARE_END_TO_END, tempNodeRange ) > -1 );
        return ( nodeStartsAfterRangeBeginning && nodeEndsBeforeRangeEnd );
    }
};

/**
 * Adjusts the boundaries of a given range downwards into the deepest possible leaf nodes.
 * This is typically used to normalize ranges to text nodes for more precise editing.
 *
 * @param {Range} targetRange - The DOM Range object to adjust.
 */
const adjustRangeDownwards = function ( targetRange ) {
    let currentStartContainer = targetRange.startContainer;
    let currentStartOffset = targetRange.startOffset;
    let currentEndContainer = targetRange.endContainer;
    let currentEndOffset = targetRange.endOffset;
    let currentChildNode;

    // Move start boundary down into the deepest non-leaf child.
    while ( currentStartContainer.nodeType !== DOM_NODE_TYPE_TEXT ) {
        currentChildNode = currentStartContainer.childNodes[ currentStartOffset ];
        // Stop if no child at offset, or if child is a leaf element (e.g., BR, IMG).
        // 'isLeaf' is an assumed external utility.
        if ( !currentChildNode || isLeaf( currentChildNode ) ) {
            break;
        }
        currentStartContainer = currentChildNode;
        currentStartOffset = 0; // Move to the beginning of the new container.
    }

    // Move end boundary down into the deepest non-leaf child.
    if ( currentEndOffset > 0 ) { // Only if the end offset is not 0 (i.e., not at the very beginning of a container).
        while ( currentEndContainer.nodeType !== DOM_NODE_TYPE_TEXT ) {
            currentChildNode = currentEndContainer.childNodes[ currentEndOffset - 1 ];
            if ( !currentChildNode || isLeaf( currentChildNode ) ) {
                break;
            }
            currentEndContainer = currentChildNode;
            // 'getLength' is an assumed external utility.
            currentEndOffset = getLength( currentEndContainer ); // Move to the end of the new container.
        }
    } else { // If end offset is 0, we need to find the first child.
        while ( currentEndContainer.nodeType !== DOM_NODE_TYPE_TEXT ) {
            currentChildNode = currentEndContainer.firstChild;
            if ( !currentChildNode || isLeaf( currentChildNode ) ) {
                break;
            }
            currentEndContainer = currentChildNode;
            // End offset remains 0 for the new container as we're looking at its start.
        }
    }

    // If the range is collapsed, the algorithm might swap start/end internally.
    // The original logic had a bug where it would flip start/end if collapsed.
    // Ensure that for a collapsed range, start and end are set to the same point.
    if ( targetRange.collapsed ) {
        targetRange.setStart( currentEndContainer, currentEndOffset );
        targetRange.setEnd( currentEndContainer, currentEndOffset ); // Explicitly set end to same point.
    } else {
        targetRange.setStart( currentStartContainer, currentStartOffset );
        targetRange.setEnd( currentEndContainer, currentEndOffset );
    }
};

/**
 * Adjusts the boundaries of a given range upwards in the DOM tree.
 * This is useful for normalizing ranges to encompass entire nodes or blocks.
 *
 * @param {Range} targetRange - The DOM Range object to adjust.
 * @param {Node} [ancestorContext] - An optional common ancestor node to limit upward traversal.
 */
const elevateRangeBoundaries = function ( targetRange, ancestorContext ) {
    // Validate input range.
    if (!targetRange || !targetRange.startContainer || !targetRange.endContainer) {
        console.warn("Invalid range provided to elevateRangeBoundaries.");
        return;
    }

    let currentStartNode = targetRange.startContainer;
    let currentStartPos = targetRange.startOffset;
    let currentEndNode = targetRange.endContainer;
    let currentEndPos = targetRange.endOffset;
    let parentNodeRef;

    // Determine the effective common ancestor.
    const effectiveAncestor = ancestorContext || targetRange.commonAncestorContainer;

    // Move start boundary up the tree until it's not at the beginning of its parent,
    // or until the common ancestor is reached.
    while ( currentStartNode !== effectiveAncestor && currentStartPos === 0 ) {
        parentNodeRef = currentStartNode.parentNode;
        currentStartPos = findNodeIndex( parentNodeRef.childNodes, currentStartNode );
        currentStartNode = parentNodeRef;
    }

    // Move end boundary up the tree until it's not at the end of its parent,
    // or until the common ancestor is reached.
    while ( currentEndNode !== effectiveAncestor &&
            currentEndPos === getLength( currentEndNode ) ) { // 'getLength' assumed external utility.
        parentNodeRef = currentEndNode.parentNode;
        currentEndPos = findNodeIndex( parentNodeRef.childNodes, currentEndNode ) + 1;
        currentEndNode = parentNodeRef;
    }

    // Update the range with the new, elevated boundary points.
    targetRange.setStart( currentStartNode, currentStartPos );
    targetRange.setEnd( currentEndNode, currentEndPos );
};

/**
 * Finds the first block element that is at least partially covered by the given range.
 *
 * @param {Range} inputRange - The DOM Range object to query.
 * @returns {Element|null} The starting block element, or null if no block is found.
 */
const findRangeStartingBlock = function ( inputRange ) {
    if (!inputRange) {
        return null;
    }

    let startBoundaryContainer = inputRange.startContainer;
    let resultBlock;

    // If the container is an inline element, find its containing block.
    // 'isInline' and 'isBlock' are assumed external utilities.
    if ( isInline( startBoundaryContainer ) ) {
        resultBlock = getPreviousBlock( startBoundaryContainer ); // Assumed external utility.
    }
    // If the container itself is a block, that's our starting block.
    else if ( isBlock( startBoundaryContainer ) ) {
        resultBlock = startBoundaryContainer;
    }
    // Otherwise, it's likely a text node or a non-block element.
    else {
        // Find the node before the range start, then find the next block from there.
        const nodeBeforeStart = retrievePriorElement( startBoundaryContainer, inputRange.startOffset );
        resultBlock = getNextBlock( nodeBeforeStart ); // Assumed external utility.
    }

    // Finally, verify that the identified block actually intersects with the range.
    return resultBlock && isElementWithinRange( inputRange, resultBlock, true ) ? resultBlock : null;
};

/**
 * Finds the last block element that is at least partially covered by the given range.
 *
 * @param {Range} inputRange - The DOM Range object to query.
 * @returns {Element|null} The ending block element, or null if no block is found.
 */
const locateRangeEndingBlock = function ( inputRange ) {
    if (!inputRange) {
        return null;
    }

    let endBoundaryContainer = inputRange.endContainer;
    let resultBlock;
    let lastChildElement;

    // If the container is an inline element, find its containing block.
    if ( isInline( endBoundaryContainer ) ) {
        resultBlock = getPreviousBlock( endBoundaryContainer ); // Assumed external utility.
    }
    // If the container itself is a block, that's our ending block.
    else if ( isBlock( endBoundaryContainer ) ) {
        resultBlock = endBoundaryContainer;
    }
    // Otherwise, it's likely a text node or a non-block element.
    else {
        // Find the node after the range end, then find the previous block from there.
        let nodeAfterEnd = acquireSubsequentNode( endBoundaryContainer, inputRange.endOffset );
        // If no node after end, it means we are at the very end of the document or a container.
        if ( !nodeAfterEnd ) {
            const documentBody = endBoundaryContainer.ownerDocument.body;
            resultBlock = documentBody;
            // Traverse to the deepest last child to find the effective end point.
            while ( (lastChildElement = resultBlock.lastChild) ) {
                resultBlock = lastChildElement;
            }
        } else {
            resultBlock = nodeAfterEnd;
        }
        resultBlock = getPreviousBlock( resultBlock ); // Assumed external utility.
    }

    // Verify that the identified block actually intersects with the range.
    return resultBlock && isElementWithinRange( inputRange, resultBlock, true ) ? resultBlock : null;
};

// Regular expression to check for non-whitespace characters.
const nonWhitespaceRegex = /[^\s\ufeff\xA0]/;

/**
 * A custom TreeWalker for finding significant content (text or images).
 * It skips whitespace-only text nodes.
 */
const domContentIterator = new TreeWalker( null,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, // Look for text nodes or element nodes.
    function ( traversalNode ) {
        // Filter function: accept text nodes with non-whitespace content or IMG elements.
        return traversalNode.nodeType === DOM_NODE_TYPE_TEXT ?
            nonWhitespaceRegex.test( traversalNode.data ) :
            traversalNode.nodeName === 'IMG';
    }
);

/**
 * Checks if a given range's start boundary is at the beginning of a block.
 *
 * @param {Range} testedRange - The DOM Range object to check.
 * @returns {boolean} True if the range starts at a block boundary, false otherwise.
 */
const checkRangeBeginningBlockAlignment = function ( testedRange ) {
    // Guard clause for invalid range.
    if (!testedRange || !testedRange.startContainer) {
        return false;
    }

    let testStartContainer = testedRange.startContainer;
    let testStartOffset = testedRange.startOffset;

    // If the start is in the middle or end of a text node, it's not a block boundary.
    if ( testStartContainer.nodeType === DOM_NODE_TYPE_TEXT ) {
        if ( testStartOffset > 0 ) {
            return false;
        }
        domContentIterator.currentNode = testStartContainer;
    } else {
        // If it's an element, set the iterator's current node to the one *after* the offset.
        domContentIterator.currentNode = acquireSubsequentNode( testStartContainer, testStartOffset );
    }

    // Set the root of the walker to the containing block of the range start.
    domContentIterator.root = findRangeStartingBlock( testedRange );

    // If there's no previous node (content-wise) within the block, then we are at the boundary.
    return !domContentIterator.previousNode();
};

/**
 * Checks if a given range's end boundary is at the end of a block.
 *
 * @param {Range} evaluatedRange - The DOM Range object to check.
 * @returns {boolean} True if the range ends at a block boundary, false otherwise.
 */
const checkRangeEndingBlockAlignment = function ( evaluatedRange ) {
    // Guard clause for invalid range.
    if (!evaluatedRange || !evaluatedRange.endContainer) {
        return false;
    }

    let testEndContainer = evaluatedRange.endContainer;
    let testEndOffset = evaluatedRange.endOffset;
    let containerLength;

    // If the end is in a text node with content, and not at the very end, it's not a block boundary.
    if ( testEndContainer.nodeType === DOM_NODE_TYPE_TEXT ) {
        containerLength = testEndContainer.data.length;
        if ( containerLength > 0 && testEndOffset < containerLength ) {
            return false;
        }
        domContentIterator.currentNode = testEndContainer;
    } else {
        // If it's an element, set the iterator's current node to the one *before* the offset.
        domContentIterator.currentNode = retrievePriorElement( testEndContainer, testEndOffset );
    }

    // Set the root of the walker to the containing block of the range end.
    domContentIterator.root = locateRangeEndingBlock( evaluatedRange );

    // If there's no next node (content-wise) within the block, then we are at the boundary.
    return !domContentIterator.nextNode();
};

/**
 * Expands the given range to encompass its containing block boundaries.
 *
 * @param {Range} modifiableRange - The DOM Range object to expand.
 */
const widenRangeToContainingBlocks = function ( modifiableRange ) {
    // Find the starting and ending block elements for the range.
    const initialBlockElement = findRangeStartingBlock( modifiableRange );
    const finalBlockElement = locateRangeEndingBlock( modifiableRange );

    // Only proceed if both start and end blocks are found.
    if ( initialBlockElement && finalBlockElement ) {
        let commonParentNode;

        // Set the range start to the beginning of the initial block.
        commonParentNode = initialBlockElement.parentNode;
        modifiableRange.setStart( commonParentNode, findNodeIndex( commonParentNode.childNodes, initialBlockElement ) );

        // Set the range end to the end of the final block.
        commonParentNode = finalBlockElement.parentNode;
        modifiableRange.setEnd( commonParentNode, findNodeIndex( commonParentNode.childNodes, finalBlockElement ) + 1 );
    } else {
        // Optionally, log a warning or throw an error if blocks can't be determined.
        // console.warn("Could not expand range to block boundaries: start or end block not found.");
    }
};