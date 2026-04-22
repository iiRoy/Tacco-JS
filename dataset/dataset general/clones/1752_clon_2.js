/* This module provides advanced DOM range and node manipulation utilities.
 * It handles insertion, extraction, and deletion of content within selections,
 * along with boundary adjustments and block-level operations.
 */

var arrProtoIndexOf = Array.prototype.indexOf;
var nonSpacePattern = /[^\s]/;

var getPreviousDomElement = function( targetNode, indexPosition ) {
    var subNodes = targetNode.childNodes;
    while ( indexPosition && targetNode.nodeType === ELEMENT_NODE ) {
        targetNode = subNodes[ indexPosition - 1 ];
        subNodes = targetNode.childNodes;
        indexPosition = subNodes.length;
    }
    return targetNode;
};

var getNextDomElement = function( targetNode, indexPosition ) {
    if ( targetNode.nodeType === ELEMENT_NODE ) {
        var subNodes = targetNode.childNodes;
        if ( indexPosition < subNodes.length ) {
            targetNode = subNodes[ indexPosition ];
        } else {
            while ( targetNode && !targetNode.nextSibling ) {
                targetNode = targetNode.parentNode;
            }
            if ( targetNode ) {
                targetNode = targetNode.nextSibling;
            }
        }
    }
    return targetNode;
};

// --- Core Range Operations ---

// Placeholder for external helper functions.
// These functions are assumed to be available in the scope.
var divideNodeAtOffset = function( nodeToSplit, offsetIndex, ancestorLimit ) { /* ... */ };
var removeNodeFromParent = function( nodeToRemove ) { /* ... */ };
var adjustDomCursor = function( nodeToAdjust ) { /* ... */ };
var getElementContentLength = function( node ) { /* ... */ };
var checkIfInlineElement = function( node ) { /* ... */ };
var findNearestAncestor = function( node, tagName ) { /* ... */ };
var retrieveNextBlockElement = function( node ) { /* ... */ };
var uniteContainers = function( node ) { /* ... */ };
var isLeafNode = function( node ) { /* ... */ };
var checkIfBlockElement = function( node ) { /* ... */ };
var retrievePreviousBlockElement = function( node ) { /* ... */ };
var combineBlocks = function( block1, block2, rangeObj ) { /* ... */ };

var placeElementInSelection = function( boundarySelection, newElement ) {
    // Determine insertion point parameters.
    var initialContainer = boundarySelection.startContainer,
        initialOffset = boundarySelection.startOffset,
        finalContainer = boundarySelection.endContainer,
        finalOffset = boundarySelection.endOffset,
        ancestorElement, subNodes, numChildren, postSplitSegment;

    // Handle text node splitting if insertion is mid-text.
    if ( initialContainer.nodeType === TEXT_NODE ) {
        ancestorElement = initialContainer.parentNode;
        subNodes = ancestorElement.childNodes;
        if ( initialOffset === initialContainer.length ) {
            initialOffset = arrProtoIndexOf.call( subNodes, initialContainer ) + 1;
            if ( boundarySelection.collapsed ) {
                finalContainer = ancestorElement;
                finalOffset = initialOffset;
            }
        } else {
            if ( initialOffset ) {
                postSplitSegment = initialContainer.splitText( initialOffset );
                if ( finalContainer === initialContainer ) {
                    finalOffset -= initialOffset;
                    finalContainer = postSplitSegment;
                }
                else if ( finalContainer === ancestorElement ) {
                    finalOffset += 1;
                }
                initialContainer = postSplitSegment;
            }
            initialOffset = arrProtoIndexOf.call( subNodes, initialContainer );
        }
        initialContainer = ancestorElement;
    } else {
        subNodes = initialContainer.childNodes;
    }

    numChildren = subNodes.length;

    // Perform the actual insertion.
    if ( initialOffset === numChildren ) {
        initialContainer.appendChild( newElement );
    } else {
        initialContainer.insertBefore( newElement, subNodes[ initialOffset ] );
    }

    // Adjust end offset if insertion affects the same container.
    if ( initialContainer === finalContainer ) {
        finalOffset += subNodes.length - numChildren;
    }

    // Update the range boundaries.
    boundarySelection.setStart( initialContainer, initialOffset );
    boundarySelection.setEnd( finalContainer, finalOffset );
};

var extractContentFromSelection = function( boundarySelection, sharedAncestor ) {
    var initialContainer = boundarySelection.startContainer,
        initialOffset = boundarySelection.startOffset,
        finalContainer = boundarySelection.endContainer,
        finalOffset = boundarySelection.endOffset;

    if ( !sharedAncestor ) {
        sharedAncestor = boundarySelection.commonAncestorContainer;
    }

    // Ensure common ancestor is an element node.
    if ( sharedAncestor.nodeType === TEXT_NODE ) {
        sharedAncestor = sharedAncestor.parentNode;
    }

    // Split nodes at the range boundaries.
    var terminatingNode = divideNodeAtOffset( finalContainer, finalOffset, sharedAncestor ),
        commencingNode = divideNodeAtOffset( initialContainer, initialOffset, sharedAncestor ),
        documentFragment = sharedAncestor.ownerDocument.createDocumentFragment(),
        nextNodeInSequence, precedingNode, succeedingNode;

    // Move all nodes between the split points into the fragment.
    while ( commencingNode !== terminatingNode ) {
        nextNodeInSequence = commencingNode.nextSibling;
        documentFragment.appendChild( commencingNode );
        commencingNode = nextNodeInSequence;
    }

    initialContainer = sharedAncestor;
    initialOffset = terminatingNode ?
        arrProtoIndexOf.call( sharedAncestor.childNodes, terminatingNode ) :
        sharedAncestor.childNodes.length;

    // Merge adjacent text nodes after extraction for cleanup.
    succeedingNode = sharedAncestor.childNodes[ initialOffset ];
    precedingNode = succeedingNode && succeedingNode.previousSibling;
    if ( precedingNode &&
            precedingNode.nodeType === TEXT_NODE &&
            succeedingNode.nodeType === TEXT_NODE ) {
        initialContainer = precedingNode;
        initialOffset = precedingNode.length;
        precedingNode.appendData( succeedingNode.data );
        removeNodeFromParent( succeedingNode );
    }

    // Collapse the range to the start of the extracted content.
    boundarySelection.setStart( initialContainer, initialOffset );
    boundarySelection.collapse( true );

    adjustDomCursor( sharedAncestor );

    return documentFragment;
};

var removeContentWithinSelection = function( boundarySelection ) {
    // Optimize by moving boundaries up the tree before extraction.
    adjustSelectionLimitsUpward( boundarySelection );

    // Perform the content removal.
    extractContentFromSelection( boundarySelection );

    // Restore boundaries to meaningful positions within blocks.
    adjustSelectionLimitsDownward( boundarySelection );

    // If deletion resulted in two separate blocks, attempt to merge them.
    var initialBlock = getSelectionStartBlock( boundarySelection ),
        finalBlock = getSelectionEndBlock( boundarySelection );
    if ( initialBlock && finalBlock && initialBlock !== finalBlock ) {
        combineBlocks( initialBlock, finalBlock, boundarySelection );
    }

    // Ensure the block is properly structured for cursor placement.
    if ( initialBlock ) {
        adjustDomCursor( initialBlock );
    }

    // Ensure the document body maintains a block-level element if it becomes empty.
    var documentBody = boundarySelection.endContainer.ownerDocument.body,
        descendant = documentBody.firstChild;
    if ( !descendant || descendant.nodeName === 'BR' ) {
        adjustDomCursor( documentBody );
        boundarySelection.selectNodeContents( documentBody.firstChild );
    }
};

// --- Fragment Insertion ---

var insertFragmentIntoSelection = function( boundarySelection, inputFragment ) {
    // Check if the fragment contains only inline content.
    var isEntirelyInline = true,
        subNodes = inputFragment.childNodes,
        loopCounter = subNodes.length;
    while ( loopCounter-- ) {
        if ( !checkIfInlineElement( subNodes[ loopCounter ] ) ) {
            isEntirelyInline = false;
            break;
        }
    }

    // Remove any content currently selected by the range.
    if ( !boundarySelection.collapsed ) {
        removeContentWithinSelection( boundarySelection );
    }

    // Normalize range boundaries to the deepest possible text nodes.
    adjustSelectionLimitsDownward( boundarySelection );

    // If the fragment is entirely inline, a simple insertion suffices.
    if ( isEntirelyInline ) {
        placeElementInSelection( boundarySelection, inputFragment );
        boundarySelection.collapse( false );
    }
    // For mixed or block-level content, a more complex splitting and merging is required.
    else {
        var divisionPoint = boundarySelection.startContainer,
            postDivisionNode = divideNodeAtOffset( divisionPoint, boundarySelection.startOffset,
                findNearestAncestor( divisionPoint.parentNode, 'BLOCKQUOTE' ) ||
                divisionPoint.ownerDocument.body ),
            preDivisionNode = postDivisionNode.previousSibling,
            initialContainer = preDivisionNode,
            initialOffset = initialContainer.childNodes.length,
            finalContainer = postDivisionNode,
            finalOffset = 0,
            ancestorElement = postDivisionNode.parentNode,
            descendantElement, currentElement;

        // Traverse into the deepest inline element at the end of the pre-split section.
        while ( ( descendantElement = initialContainer.lastChild ) &&
                descendantElement.nodeType === ELEMENT_NODE &&
                descendantElement.nodeName !== 'BR' ) {
            initialContainer = descendantElement;
            initialOffset = initialContainer.childNodes.length;
        }
        // Traverse into the deepest inline element at the beginning of the post-split section.
        while ( ( descendantElement = finalContainer.firstChild ) &&
                descendantElement.nodeType === ELEMENT_NODE &&
                descendantElement.nodeName !== 'BR' ) {
            finalContainer = descendantElement;
        }
        // Move leading inline content from fragment to the pre-split section.
        while ( ( descendantElement = inputFragment.firstChild ) && checkIfInlineElement( descendantElement ) ) {
            initialContainer.appendChild( descendantElement );
        }
        // Move trailing inline content from fragment to the post-split section.
        while ( ( descendantElement = inputFragment.lastChild ) && checkIfInlineElement( descendantElement ) ) {
            finalContainer.insertBefore( descendantElement, finalContainer.firstChild );
            finalOffset += 1;
        }

        // Adjust cursor positions for block elements within the fragment, then insert.
        currentElement = inputFragment;
        while ( currentElement = retrieveNextBlockElement( currentElement ) ) {
            adjustDomCursor( currentElement );
        }
        ancestorElement.insertBefore( inputFragment, postDivisionNode );

        // Clean up empty nodes created by the split and merge adjacent containers.
        currentElement = postDivisionNode.previousSibling;
        if ( !postDivisionNode.textContent ) {
            ancestorElement.removeChild( postDivisionNode );
        } else {
            uniteContainers( postDivisionNode );
        }
        if ( !postDivisionNode.parentNode ) { // If postDivisionNode was removed
            finalContainer = currentElement;
            finalOffset = getElementContentLength( finalContainer );
        }

        if ( !preDivisionNode.textContent ) {
            initialContainer = preDivisionNode.nextSibling;
            initialOffset = 0;
            ancestorElement.removeChild( preDivisionNode );
        } else {
            uniteContainers( preDivisionNode );
        }

        // Update range to encompass the inserted content and normalize.
        boundarySelection.setStart( initialContainer, initialOffset );
        boundarySelection.setEnd( finalContainer, finalOffset );
        adjustSelectionLimitsDownward( boundarySelection );
    }
};

// --- Range Boundary Utilities ---

var isElementWithinSelection = function( boundarySelection, targetNode, isPartialMatch ) {
    var elementBoundary = targetNode.ownerDocument.createRange();

    elementBoundary.selectNode( targetNode );

    if ( isPartialMatch ) {
        // A partial match means the node must not fully precede or fully succeed the range.
        var elementEndsBeforeSelectionStarts = ( boundarySelection.compareBoundaryPoints(
                END_TO_START, elementBoundary ) > -1 ),
            elementStartsAfterSelectionEnds = ( boundarySelection.compareBoundaryPoints(
                START_TO_END, elementBoundary ) < 1 );
        return ( !elementEndsBeforeSelectionStarts && !elementStartsAfterSelectionEnds );
    }
    else {
        // A full match means the node must be entirely contained within the range.
        var elementStartsAfterSelectionStarts = ( boundarySelection.compareBoundaryPoints(
                START_TO_START, elementBoundary ) < 1 ),
            elementEndsBeforeSelectionEnds = ( boundarySelection.compareBoundaryPoints(
                END_TO_END, elementBoundary ) > -1 );
        return ( elementStartsAfterSelectionStarts && elementEndsBeforeSelectionEnds );
    }
};

var adjustSelectionLimitsDownward = function( boundarySelection ) {
    var initialContainer = boundarySelection.startContainer,
        initialOffset = boundarySelection.startOffset,
        finalContainer = boundarySelection.endContainer,
        finalOffset = boundarySelection.endOffset,
        descendantElement;

    // Move start boundary deeper into the DOM tree.
    while ( initialContainer.nodeType !== TEXT_NODE ) {
        descendantElement = initialContainer.childNodes[ initialOffset ];
        if ( !descendantElement || isLeafNode( descendantElement ) ) {
            break;
        }
        initialContainer = descendantElement;
        initialOffset = 0;
    }
    // Move end boundary deeper into the DOM tree.
    if ( finalOffset ) {
        while ( finalContainer.nodeType !== TEXT_NODE ) {
            descendantElement = finalContainer.childNodes[ finalOffset - 1 ];
            if ( !descendantElement || isLeafNode( descendantElement ) ) {
                break;
            }
            finalContainer = descendantElement;
            finalOffset = getElementContentLength( finalContainer );
        }
    } else {
        while ( finalContainer.nodeType !== TEXT_NODE ) {
            descendantElement = finalContainer.firstChild;
            if ( !descendantElement || isLeafNode( descendantElement ) ) {
                break;
            }
            finalContainer = descendantElement;
        }
    }

    // Re-set the range, handling potential collapse-induced boundary swaps.
    if ( boundarySelection.collapsed ) {
        boundarySelection.setStart( finalContainer, finalOffset );
        boundarySelection.setEnd( initialContainer, initialOffset );
    } else {
        boundarySelection.setStart( initialContainer, initialOffset );
        boundarySelection.setEnd( finalContainer, finalOffset );
    }
};

var adjustSelectionLimitsUpward = function( boundarySelection, sharedAncestor ) {
    var initialContainer = boundarySelection.startContainer,
        initialOffset = boundarySelection.startOffset,
        finalContainer = boundarySelection.endContainer,
        finalOffset = boundarySelection.endOffset,
        ancestorElement;

    if ( !sharedAncestor ) {
        sharedAncestor = boundarySelection.commonAncestorContainer;
    }

    // Move start boundary up the tree until an offset is found or common ancestor is reached.
    while ( initialContainer !== sharedAncestor && !initialOffset ) {
        ancestorElement = initialContainer.parentNode;
        initialOffset = arrProtoIndexOf.call( ancestorElement.childNodes, initialContainer );
        initialContainer = ancestorElement;
    }

    // Move end boundary up the tree until it's not at the end of its container or common ancestor is reached.
    while ( finalContainer !== sharedAncestor &&
            finalOffset === getElementContentLength( finalContainer ) ) {
        ancestorElement = finalContainer.parentNode;
        finalOffset = arrProtoIndexOf.call( ancestorElement.childNodes, finalContainer ) + 1;
        finalContainer = ancestorElement;
    }

    boundarySelection.setStart( initialContainer, initialOffset );
    boundarySelection.setEnd( finalContainer, finalOffset );
};

// --- Block Analysis ---

var getSelectionStartBlock = function( boundarySelection ) {
    var currentContainer = boundarySelection.startContainer,
        blockElement;

    // Determine the block containing the start of the selection.
    if ( checkIfInlineElement( currentContainer ) ) {
        blockElement = retrievePreviousBlockElement( currentContainer );
    } else if ( checkIfBlockElement( currentContainer ) ) {
        blockElement = currentContainer;
    } else {
        blockElement = getPreviousDomElement( currentContainer, boundarySelection.startOffset );
        blockElement = retrieveNextBlockElement( blockElement );
    }
    // Verify that the identified block actually overlaps with the selection.
    return blockElement && isElementWithinSelection( boundarySelection, blockElement, true ) ? blockElement : null;
};

var getSelectionEndBlock = function( boundarySelection ) {
    var currentContainer = boundarySelection.endContainer,
        blockElement, descendantElement;

    // Determine the block containing the end of the selection.
    if ( checkIfInlineElement( currentContainer ) ) {
        blockElement = retrievePreviousBlockElement( currentContainer );
    } else if ( checkIfBlockElement( currentContainer ) ) {
        blockElement = currentContainer;
    } else {
        blockElement = getNextDomElement( currentContainer, boundarySelection.endOffset );
        if ( !blockElement ) {
            blockElement = currentContainer.ownerDocument.body;
            while ( descendantElement = blockElement.lastChild ) {
                blockElement = descendantElement;
            }
        }
        blockElement = retrievePreviousBlockElement( blockElement );
    }
    // Verify that the identified block actually overlaps with the selection.
    return blockElement && isElementWithinSelection( boundarySelection, blockElement, true ) ? blockElement : null;
};

var contentTraversalAgent = new TreeWalker( null,
    SHOW_TEXT | SHOW_ELEMENT,
    function( node ) {
        return node.nodeType === TEXT_NODE ?
            nonSpacePattern.test( node.data ) :
            node.nodeName === 'IMG';
    }
);

var selectionBeginsAtBlockBoundary = function( boundarySelection ) {
    var initialContainer = boundarySelection.startContainer,
        initialOffset = boundarySelection.startOffset;

    // If starting mid-text, it's not a block boundary.
    if ( initialContainer.nodeType === TEXT_NODE ) {
        if ( initialOffset ) {
            return false;
        }
        contentTraversalAgent.currentNode = initialContainer;
    } else {
        contentTraversalAgent.currentNode = getNextDomElement( initialContainer, initialOffset );
    }

    // Check for any preceding content within the same block.
    contentTraversalAgent.root = getSelectionStartBlock( boundarySelection );

    return !contentTraversalAgent.previousNode();
};

var selectionEndsAtBlockBoundary = function( boundarySelection ) {
    var finalContainer = boundarySelection.endContainer,
        finalOffset = boundarySelection.endOffset,
        contentLength;

    // If ending mid-text with content, it's not a block boundary.
    if ( finalContainer.nodeType === TEXT_NODE ) {
        contentLength = finalContainer.data.length;
        if ( contentLength && finalOffset < contentLength ) {
            return false;
        }
        contentTraversalAgent.currentNode = finalContainer;
    } else {
        contentTraversalAgent.currentNode = getPreviousDomElement( finalContainer, finalOffset );
    }

    // Check for any succeeding content within the same block.
    contentTraversalAgent.root = getSelectionEndBlock( boundarySelection );

    return !contentTraversalAgent.nextNode();
};

var stretchSelectionToBlockLimits = function( boundarySelection ) {
    var startBlockElement = getSelectionStartBlock( boundarySelection ),
        endBlockElement = getSelectionEndBlock( boundarySelection ),
        ancestorElement;

    if ( startBlockElement && endBlockElement ) {
        ancestorElement = startBlockElement.parentNode;
        boundarySelection.setStart( ancestorElement, arrProtoIndexOf.call( ancestorElement.childNodes, startBlockElement ) );
        ancestorElement = endBlockElement.parentNode;
        boundarySelection.setEnd( ancestorElement, arrProtoIndexOf.call( ancestorElement.childNodes, endBlockElement ) + 1 );
    }
};