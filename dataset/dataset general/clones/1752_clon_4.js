// --- Constants
const NUM_ELEM = 1;
const NUM_TEXT = 3;

const COMP_START_START = 0;
const COMP_END_START = 2;
const COMP_START_END = 3;
const COMP_END_END = 1;

const SHOW_CONTENT_ELEM = 1;
const SHOW_CONTENT_TEXT = 4;

// --- Utility Functions (renamed and minimally implemented to support clone)
// These are assumed to be part of the original system's environment.

const obtainChildPosition = (ancestor, descendant) => {
    return Array.from(ancestor.childNodes).indexOf(descendant);
};

const acquireChildren = (parent) => parent.childNodes;

const ascertainNodeExtent = (unit) => {
    return unit.nodeType === NUM_TEXT ? unit.length : unit.childNodes.length;
};

const isTerminalUnit = (unit) => !unit.hasChildNodes();

const removeUnitFromParent = (unit) => {
    if (unit && unit.parentNode) {
        unit.parentNode.removeChild(unit);
    }
};

const isInlineUnit = (unit) => {
    return unit.nodeType === NUM_ELEM && !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'TABLE'].includes(unit.nodeName);
};

const isBlockUnit = (unit) => {
    return unit.nodeType === NUM_ELEM && ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'TABLE'].includes(unit.nodeName);
};

const normalizeCursorPoint = (unit) => {
    if (unit && unit.nodeType === NUM_ELEM && !unit.firstChild) {
        unit.appendChild(unit.ownerDocument.createElement('br'));
    }
};

const delineateNode = (originContainer, separationPoint, sharedAncestor) => {
    if (originContainer.nodeType === NUM_TEXT) {
        if (separationPoint === ascertainNodeExtent(originContainer)) {
            return null;
        }
        return originContainer.splitText(separationPoint);
    } else {
        return acquireChildren(originContainer)[separationPoint] || null;
    }
};

const fetchNearestAncestor = (unit, tagName) => {
    let current = unit;
    while (current && current.parentNode) {
        if (current.nodeName === tagName) {
            return current;
        }
        current = current.parentNode;
    }
    return null;
};

const getFollowingBlockUnit = (unit) => {
    let current = unit;
    while (current) {
        if (isBlockUnit(current)) {
            return current;
        }
        current = current.nextSibling || current.parentNode;
    }
    return null;
};

const getPrecedingBlockUnit = (unit) => {
    let current = unit;
    while (current) {
        if (isBlockUnit(current)) {
            return current;
        }
        current = current.previousSibling || current.parentNode;
    }
    return null;
};

const unifyBlocks = (firstBlock, secondBlock, zone) => {
    if (!firstBlock || !secondBlock || firstBlock === secondBlock) return;
    while (secondBlock.firstChild) {
        firstBlock.appendChild(secondBlock.firstChild);
    }
    removeUnitFromParent(secondBlock);
    if (zone.startContainer === secondBlock) {
        zone.setStart(firstBlock, zone.startOffset);
    }
    if (zone.endContainer === secondBlock) {
        zone.setEnd(firstBlock, zone.endOffset);
    }
};

const coalesceContainers = (unit) => {
    if (unit && unit.parentNode) {
        unit.parentNode.normalize();
    }
};

const contentMatcherPattern = /[^\s]/;
const isNonWhitespaceContent = (node) => contentMatcherPattern.test(node.data);

// --- Cloned Functions

const retrievePrecedingNode = (currentUnit, currentOffset) => {
    let internalUnit = currentUnit;
    let internalOffset = currentOffset;
    let unitChildren = acquireChildren(internalUnit);

    while (internalOffset && internalUnit.nodeType === NUM_ELEM) {
        internalUnit = unitChildren[internalOffset - 1];
        unitChildren = acquireChildren(internalUnit);
        internalOffset = ascertainNodeExtent(internalUnit);
    }
    return internalUnit;
};

const obtainSubsequentNode = (currentUnit, currentOffset) => {
    if (currentUnit.nodeType === NUM_ELEM) {
        const unitChildren = acquireChildren(currentUnit);
        if (currentOffset < ascertainNodeExtent(currentUnit)) {
            currentUnit = unitChildren[currentOffset];
        } else {
            while (currentUnit && !currentUnit.nextSibling) {
                currentUnit = currentUnit.parentNode;
            }
            if (currentUnit) { currentUnit = currentUnit.nextSibling; }
        }
    }
    return currentUnit;
};

const injectContentWithinZone = (targetZone, contentUnit) => {
    let initialContainer = targetZone.startContainer;
    let initialOffset = targetZone.startOffset;
    let finalContainer = targetZone.endContainer;
    let finalOffset = targetZone.endOffset;
    let enclosingParent, childUnits, childrenBeforeCount, splitAfterwards;

    if (initialContainer.nodeType === NUM_TEXT) {
        enclosingParent = initialContainer.parentNode;
        childUnits = acquireChildren(enclosingParent);
        if (initialOffset === ascertainNodeExtent(initialContainer)) {
            initialOffset = obtainChildPosition(enclosingParent, initialContainer) + 1;
            if (targetZone.collapsed) {
                finalContainer = enclosingParent;
                finalOffset = initialOffset;
            }
        } else {
            if (initialOffset) {
                splitAfterwards = initialContainer.splitText(initialOffset);
                if (finalContainer === initialContainer) {
                    finalOffset -= initialOffset;
                    finalContainer = splitAfterwards;
                }
                else if (finalContainer === enclosingParent) {
                    finalOffset += 1;
                }
                initialContainer = splitAfterwards;
            }
            initialOffset = obtainChildPosition(enclosingParent, initialContainer);
        }
        initialContainer = enclosingParent;
    } else {
        childUnits = acquireChildren(initialContainer);
    }

    childrenBeforeCount = ascertainNodeExtent(childUnits);

    if (initialOffset === childrenBeforeCount) {
        initialContainer.appendChild(contentUnit);
    } else {
        initialContainer.insertBefore(contentUnit, childUnits[initialOffset]);
    }

    if (initialContainer === finalContainer) {
        finalOffset += ascertainNodeExtent(childUnits) - childrenBeforeCount;
    }

    targetZone.setStart(initialContainer, initialOffset);
    targetZone.setEnd(finalContainer, finalOffset);
};

const pullOutZoneContent = (targetZone, commonUnit) => {
    let initialContainer = targetZone.startContainer;
    let initialOffset = targetZone.startOffset;
    let finalContainer = targetZone.endContainer;
    let finalOffset = targetZone.endOffset;

    if (!commonUnit) {
        commonUnit = targetZone.commonAncestorContainer;
    }

    if (commonUnit.nodeType === NUM_TEXT) {
        commonUnit = commonUnit.parentNode;
    }

    let endingNode = delineateNode(finalContainer, finalOffset, commonUnit);
    let startingNode = delineateNode(initialContainer, initialOffset, commonUnit);
    let contentFragment = commonUnit.ownerDocument.createDocumentFragment();
    let nextUnit, beforeMerge, afterMerge;

    while (startingNode !== endingNode) {
        nextUnit = startingNode.nextSibling;
        contentFragment.appendChild(startingNode);
        startingNode = nextUnit;
    }

    initialContainer = commonUnit;
    initialOffset = endingNode ?
        obtainChildPosition(acquireChildren(commonUnit), endingNode) :
        ascertainNodeExtent(commonUnit);

    afterMerge = acquireChildren(commonUnit)[initialOffset];
    beforeMerge = afterMerge && afterMerge.previousSibling;
    if (beforeMerge &&
            beforeMerge.nodeType === NUM_TEXT &&
            afterMerge.nodeType === NUM_TEXT) {
        initialContainer = beforeMerge;
        initialOffset = ascertainNodeExtent(beforeMerge);
        beforeMerge.appendData(afterMerge.data);
        removeUnitFromParent(afterMerge);
    }

    targetZone.setStart(initialContainer, initialOffset);
    targetZone.collapse(true);

    normalizeCursorPoint(commonUnit);

    return contentFragment;
};

const eraseZoneContent = (targetZone) => {
    shiftZoneBoundariesUp(targetZone);
    pullOutZoneContent(targetZone);
    shiftZoneBoundariesDown(targetZone);

    let startingBlock = getZoneStartingBlock(targetZone);
    let endingBlock = getZoneEndingBlock(targetZone);
    if (startingBlock && endingBlock && startingBlock !== endingBlock) {
        unifyBlocks(startingBlock, endingBlock, targetZone);
    }

    if (startingBlock) {
        normalizeCursorPoint(startingBlock);
    }

    let bodyElement = targetZone.endContainer.ownerDocument.body;
    let firstBodyChild = bodyElement.firstChild;
    if (!firstBodyChild || firstBodyChild.nodeName === 'BR') {
        normalizeCursorPoint(bodyElement);
        targetZone.selectNodeContents(bodyElement.firstChild);
    }
};

const placeFragmentInZone = (targetZone, fragmentPayload) => {
    let allContentInline = true;
    let fragmentChildren = acquireChildren(fragmentPayload);
    let childIndex = fragmentChildren.length;
    while (childIndex--) {
        if (!isInlineUnit(fragmentChildren[childIndex])) {
            allContentInline = false;
            break;
        }
    }

    if (!targetZone.collapsed) {
        eraseZoneContent(targetZone);
    }

    shiftZoneBoundariesDown(targetZone);

    if (allContentInline) {
        injectContentWithinZone(targetZone, fragmentPayload);
        targetZone.collapse(false);
    } else {
        let separationAnchor = targetZone.startContainer;
        let unitAfterSplit = delineateNode(separationAnchor, targetZone.startOffset,
            fetchNearestAncestor(separationAnchor.parentNode, 'BLOCKQUOTE') ||
            separationAnchor.ownerDocument.body);
        let unitBeforeSplit = unitAfterSplit.previousSibling;
        let currentStartContainer = unitBeforeSplit;
        let currentStartOffset = ascertainNodeExtent(currentStartContainer);
        let currentEndContainer = unitAfterSplit;
        let currentEndOffset = 0;
        let containingParent = unitAfterSplit.parentNode;
        let currentChild, currentUnit;

        while ( (currentChild = currentStartContainer.lastChild) &&
                currentChild.nodeType === NUM_ELEM &&
                currentChild.nodeName !== 'BR' ) {
            currentStartContainer = currentChild;
            currentStartOffset = ascertainNodeExtent(currentStartContainer);
        }
        while ( (currentChild = currentEndContainer.firstChild) &&
                currentChild.nodeType === NUM_ELEM &&
                currentChild.nodeName !== 'BR' ) {
            currentEndContainer = currentChild;
        }
        while ( (currentChild = fragmentPayload.firstChild) && isInlineUnit(currentChild) ) {
            currentStartContainer.appendChild(currentChild);
        }
        while ( (currentChild = fragmentPayload.lastChild) && isInlineUnit(currentChild) ) {
            currentEndContainer.insertBefore(currentChild, currentEndContainer.firstChild);
            currentEndOffset += 1;
        }

        currentUnit = fragmentPayload;
        while ( (currentUnit = getFollowingBlockUnit(currentUnit)) ) {
            normalizeCursorPoint(currentUnit);
        }
        containingParent.insertBefore(fragmentPayload, unitAfterSplit);

        currentUnit = unitAfterSplit.previousSibling;
        if (!unitAfterSplit.textContent) {
            containingParent.removeChild(unitAfterSplit);
        } else {
            coalesceContainers(unitAfterSplit);
        }
        if (!unitAfterSplit.parentNode) {
            currentEndContainer = currentUnit;
            currentEndOffset = ascertainNodeExtent(currentEndContainer);
        }

        if (!unitBeforeSplit.textContent) {
            currentStartContainer = unitBeforeSplit.nextSibling;
            currentStartOffset = 0;
            containingParent.removeChild(unitBeforeSplit);
        } else {
            coalesceContainers(unitBeforeSplit);
        }

        targetZone.setStart(currentStartContainer, currentStartOffset);
        targetZone.setEnd(currentEndContainer, currentEndOffset);
        shiftZoneBoundariesDown(targetZone);
    }
};

const checkNodeWithinZone = (targetZone, targetUnit, isPartial) => {
    let unitZone = targetUnit.ownerDocument.createRange();
    unitZone.selectNode(targetUnit);

    if (isPartial) {
        let unitEndBeforeStart = ( targetZone.compareBoundaryPoints(
                COMP_END_START, unitZone ) > -1 );
        let unitStartAfterEnd = ( targetZone.compareBoundaryPoints(
                COMP_START_END, unitZone ) < 1 );
        return ( !unitEndBeforeStart && !unitStartAfterEnd );
    }
    else {
        let unitStartAfterZoneStart = ( targetZone.compareBoundaryPoints(
                COMP_START_START, unitZone ) < 1 );
        let unitEndBeforeZoneEnd = ( targetZone.compareBoundaryPoints(
                COMP_END_END, unitZone ) > -1 );
        return ( unitStartAfterZoneStart && unitEndBeforeZoneEnd );
    }
};

const shiftZoneBoundariesDown = (targetZone) => {
    let initialContainer = targetZone.startContainer;
    let initialOffset = targetZone.startOffset;
    let finalContainer = targetZone.endContainer;
    let finalOffset = targetZone.endOffset;
    let childUnit;

    const traverseDownStart = (container, offset) => {
        let currentContainer = container;
        let currentOffset = offset;
        while (currentContainer.nodeType !== NUM_TEXT) {
            childUnit = acquireChildren(currentContainer)[currentOffset];
            if (!childUnit || isTerminalUnit(childUnit)) {
                break;
            }
            currentContainer = childUnit;
            currentOffset = 0;
        }
        return { container: currentContainer, offset: currentOffset };
    };

    const traverseDownEnd = (container, offset) => {
        let currentContainer = container;
        let currentOffset = offset;
        if (currentOffset) {
            while (currentContainer.nodeType !== NUM_TEXT) {
                childUnit = acquireChildren(currentContainer)[currentOffset - 1];
                if (!childUnit || isTerminalUnit(childUnit)) {
                    break;
                }
                currentContainer = childUnit;
                currentOffset = ascertainNodeExtent(currentContainer);
            }
        } else {
            while (currentContainer.nodeType !== NUM_TEXT) {
                childUnit = acquireChildren(currentContainer)[0];
                if (!childUnit || isTerminalUnit(childUnit)) {
                    break;
                }
                currentContainer = childUnit;
            }
        }
        return { container: currentContainer, offset: currentOffset };
    };

    let newStart = traverseDownStart(initialContainer, initialOffset);
    let newEnd = traverseDownEnd(finalContainer, finalOffset);

    if (targetZone.collapsed) {
        targetZone.setStart(newEnd.container, newEnd.offset);
        targetZone.setEnd(newStart.container, newStart.offset);
    } else {
        targetZone.setStart(newStart.container, newStart.offset);
        targetZone.setEnd(newEnd.container, newEnd.offset);
    }
};

const shiftZoneBoundariesUp = (targetZone, commonUnit) => {
    let initialContainer = targetZone.startContainer;
    let initialOffset = targetZone.startOffset;
    let finalContainer = targetZone.endContainer;
    let finalOffset = targetZone.endOffset;
    let parentUnit;

    if (!commonUnit) {
        commonUnit = targetZone.commonAncestorContainer;
    }

    while (initialContainer !== commonUnit && !initialOffset) {
        parentUnit = initialContainer.parentNode;
        initialOffset = obtainChildPosition(parentUnit, initialContainer);
        initialContainer = parentUnit;
    }

    while (finalContainer !== commonUnit &&
            finalOffset === ascertainNodeExtent(finalContainer)) {
        parentUnit = finalContainer.parentNode;
        finalOffset = obtainChildPosition(parentUnit, finalContainer) + 1;
        finalContainer = parentUnit;
    }

    targetZone.setStart(initialContainer, initialOffset);
    targetZone.setEnd(finalContainer, finalOffset);
};

const getZoneStartingBlock = (targetZone) => {
    let currentContainer = targetZone.startContainer;
    let blockResult;

    if (isInlineUnit(currentContainer)) {
        blockResult = getPrecedingBlockUnit(currentContainer);
    } else if (isBlockUnit(currentContainer)) {
        blockResult = currentContainer;
    } else {
        blockResult = retrievePrecedingNode(currentContainer, targetZone.startOffset);
        blockResult = getFollowingBlockUnit(blockResult);
    }
    return blockResult && checkNodeWithinZone(targetZone, blockResult, true) ? blockResult : null;
};

const getZoneEndingBlock = (targetZone) => {
    let currentContainer = targetZone.endContainer;
    let blockResult, childUnit;

    if (isInlineUnit(currentContainer)) {
        blockResult = getPrecedingBlockUnit(currentContainer);
    } else if (isBlockUnit(currentContainer)) {
        blockResult = currentContainer;
    } else {
        blockResult = obtainSubsequentNode(currentContainer, targetZone.endOffset);
        if (!blockResult) {
            blockResult = currentContainer.ownerDocument.body;
            while ( (childUnit = blockResult.lastChild) ) {
                blockResult = childUnit;
            }
        }
        blockResult = getPrecedingBlockUnit(blockResult);
    }
    return blockResult && checkNodeWithinZone(targetZone, blockResult, true) ? blockResult : null;
};

const documentTraversalUnit = new TreeWalker( null,
    SHOW_CONTENT_TEXT | SHOW_CONTENT_ELEM,
    (unit) => {
        return unit.nodeType === NUM_TEXT ?
            isNonWhitespaceContent(unit) :
            unit.nodeName === 'IMG';
    }
);

const isZoneStartAtBlockEdge = (targetZone) => {
    let initialContainer = targetZone.startContainer;
    let initialOffset = targetZone.startOffset;

    if (initialContainer.nodeType === NUM_TEXT) {
        if (initialOffset) {
            return false;
        }
        documentTraversalUnit.currentNode = initialContainer;
    } else {
        documentTraversalUnit.currentNode = obtainSubsequentNode(initialContainer, initialOffset);
    }

    documentTraversalUnit.root = getZoneStartingBlock(targetZone);

    return !documentTraversalUnit.previousNode();
};

const isZoneEndAtBlockEdge = (targetZone) => {
    let finalContainer = targetZone.endContainer;
    let finalOffset = targetZone.endOffset;
    let nodeExtent;

    if (finalContainer.nodeType === NUM_TEXT) {
        nodeExtent = ascertainNodeExtent(finalContainer);
        if (nodeExtent && finalOffset < nodeExtent) {
            return false;
        }
        documentTraversalUnit.currentNode = finalContainer;
    } else {
        documentTraversalUnit.currentNode = retrievePrecedingNode(finalContainer, finalOffset);
    }

    documentTraversalUnit.root = getZoneEndingBlock(targetZone);

    return !documentTraversalUnit.nextNode();
};

const enlargeZoneToBlockEdges = (targetZone) => {
    let blockStart = getZoneStartingBlock(targetZone);
    let blockEnd = getZoneEndingBlock(targetZone);
    let parentOfBlock;

    if (blockStart && blockEnd) {
        parentOfBlock = blockStart.parentNode;
        targetZone.setStart(parentOfBlock, obtainChildPosition(parentOfBlock, blockStart));
        parentOfBlock = blockEnd.parentNode;
        targetZone.setEnd(parentOfBlock, obtainChildPosition(parentOfBlock, blockEnd) + 1);
    }
};