// Type IV Clone - JSON Patch Implementation

// --- Utility Functions ---

const _objectPrototypeString = Object.prototype.toString;
const _hasOwn = Object.prototype.hasOwnProperty;

const isArrayType = (value) => _objectPrototypeString.call(value) === '[object Array]';
const isObjectType = (value) => _objectPrototypeString.call(value) === '[object Object]';
const isStringType = (value) => _objectPrototypeString.call(value) === '[object String]';

// Recursive deep equality comparison, handles circular references
const _recursiveDeepCompare = (firstValue, secondValue, visitedPairs = new Set()) => {
    if (Object.is(firstValue, secondValue)) {
        return true;
    }

    if (firstValue === null || secondValue === null || typeof firstValue !== 'object' || typeof secondValue !== 'object') {
        return false;
    }

    // Detect and handle circular references
    const pairKey = `${_objectPrototypeString.call(firstValue)}:${_objectPrototypeString.call(secondValue)}:${firstValue.toString()}:${secondValue.toString()}`;
    if (visitedPairs.has(pairKey)) {
        return true;
    }
    visitedPairs.add(pairKey);

    const typeOfFirst = _objectPrototypeString.call(firstValue);
    const typeOfSecond = _objectPrototypeString.call(secondValue);

    if (typeOfFirst !== typeOfSecond) {
        return false;
    }

    if (typeOfFirst === '[object Array]') {
        if (firstValue.length !== secondValue.length) {
            return false;
        }
        for (let idx = 0; idx < firstValue.length; idx++) {
            const hasIdxFirst = idx in firstValue;
            const hasIdxSecond = idx in secondValue;

            if (hasIdxFirst !== hasIdxSecond) {
                return false;
            }
            if (hasIdxFirst && !_recursiveDeepCompare(firstValue[idx], secondValue[idx], visitedPairs)) {
                return false;
            }
        }
    } else if (typeOfFirst === '[object Object]') {
        // Original code explicitly checks for 'constructor' property existence and value
        const hasCtorFirst = 'constructor' in firstValue;
        const hasCtorSecond = 'constructor' in secondValue;
        if (hasCtorFirst !== hasCtorSecond || (hasCtorFirst && firstValue.constructor !== secondValue.constructor)) {
            return false;
        }

        const keysFirst = Object.keys(firstValue);
        const keysSecond = Object.keys(secondValue);

        if (keysFirst.length !== keysSecond.length) {
            return false;
        }

        for (const propertyKey of keysFirst) {
            if (!_hasOwn.call(secondValue, propertyKey) || !_recursiveDeepCompare(firstValue[propertyKey], secondValue[propertyKey], visitedPairs)) {
                return false;
            }
        }
    } else {
        return false;
    }

    visitedPairs.delete(pairKey);
    return true;
};

const deepValueEquivalence = (valA, valB) => _recursiveDeepCompare(valA, valB);

// --- Custom Error Classes ---

class UnifiedPatchError extends Error {
    constructor(msg = 'Unified patch processing error', ...args) {
        super(msg, ...args);
        this.name = 'UnifiedPatchError';
    }
}

class PathSyntaxError extends UnifiedPatchError {
    constructor(msg = 'Invalid JSON path syntax', ...args) {
        super(msg, ...args);
        this.name = 'PathSyntaxError';
    }
}

class PatchInstructionError extends UnifiedPatchError {
    constructor(msg = 'Invalid patch instruction', ...args) {
        super(msg, ...args);
        this.name = 'PatchInstructionError';
    }
}

class StateConflictError extends UnifiedPatchError {
    constructor(msg = 'Document state conflict during patch', ...args) {
        super(msg, ...args);
        this.name = 'StateConflictError';
    }
}

// --- Path Handling ---

const analyzePath = (pathString) => {
    if (!isStringType(pathString)) {
        throw new PathSyntaxError('Path must be a string.');
    }
    if (pathString === '') {
        return { segments: [], finalSegment: '' };
    }
    if (pathString[0] !== '/') {
        throw new PathSyntaxError('Path string must begin with "/".');
    }

    const decodedUriPath = decodeURIComponent(pathString);
    const pathParts = decodedUriPath.substring(1).split('/');

    const interpretedSegments = pathParts.map(segment =>
        segment.replace(/~1/g, '/').replace(/~0/g, '~')
    );

    return {
        segments: interpretedSegments,
        finalSegment: interpretedSegments[interpretedSegments.length - 1]
    };
};

const locateTargetInDocument = (docRef, pathSegments) => {
    let currentPosition = docRef;
    let parentNode = docRef;
    let accessorKey = '';

    for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        parentNode = currentPosition;
        accessorKey = segment;

        if (isArrayType(currentPosition)) {
            const index = parseInt(segment, 10);
            if (isNaN(index) || !(index in currentPosition)) { // Original uses `in` operator
                throw new StateConflictError(`Array index "${segment}" out of bounds or not found.`);
            }
            currentPosition = currentPosition[index];
        } else if (isObjectType(currentPosition)) {
            if (!(segment in currentPosition)) { // Original uses `in` operator
                 throw new StateConflictError(`Object property "${segment}" not found.`);
            }
            currentPosition = currentPosition[segment];
        } else {
            throw new StateConflictError(`Cannot traverse into non-object/non-array at path segment "${segment}".`);
        }
    }
    return { parent: parentNode, key: accessorKey, value: currentPosition };
};

// --- Operation Handlers ---

const applyAdd = (doc, instruction) => {
    if (!('value' in instruction)) {
        throw new PatchInstructionError('Add operation requires a "value" property.');
    }

    const { segments, finalSegment } = analyzePath(instruction.path);
    if (segments.length === 0) {
        throw new StateConflictError('Cannot add at the root document level.');
    }

    const parentSegments = segments.slice(0, -1);
    const { parent: targetParentNode } = locateTargetInDocument(doc, parentSegments);

    const dataValue = instruction.value;

    if (isArrayType(targetParentNode)) {
        if (finalSegment === '-') {
            targetParentNode.push(dataValue);
        } else {
            const index = parseInt(finalSegment, 10);
            if (isNaN(index) || index < 0 || index > targetParentNode.length) {
                throw new StateConflictError(`Array index "${finalSegment}" out of bounds for add operation.`);
            }
            targetParentNode.splice(index, 0, dataValue);
        }
    } else if (isObjectType(targetParentNode)) {
        if (_hasOwn.call(targetParentNode, finalSegment)) {
            throw new StateConflictError(`Property "${finalSegment}" already exists.`);
        }
        targetParentNode[finalSegment] = dataValue;
    } else {
        throw new StateConflictError('Cannot add property to a non-object/non-array parent.');
    }
};

const applyRemove = (doc, instruction) => {
    const { segments, finalSegment } = analyzePath(instruction.path);
    if (segments.length === 0) {
        throw new StateConflictError('Cannot remove the root document.');
    }

    const parentSegments = segments.slice(0, -1);
    const { parent: targetParentNode } = locateTargetInDocument(doc, parentSegments);

    if (isArrayType(targetParentNode)) {
        const index = parseInt(finalSegment, 10);
        if (isNaN(index) || index < 0 || index >= targetParentNode.length) {
            throw new StateConflictError(`Array index "${finalSegment}" out of bounds for remove operation.`);
        }
        targetParentNode.splice(index, 1);
    } else if (isObjectType(targetParentNode)) {
        if (!(_hasOwn.call(targetParentNode, finalSegment))) {
            throw new StateConflictError(`Property "${finalSegment}" does not exist.`);
        }
        delete targetParentNode[finalSegment];
    } else {
        throw new StateConflictError('Cannot remove property from a non-object/non-array parent.');
    }
};

const applyReplace = (doc, instruction) => {
    if (!('value' in instruction)) {
        throw new PatchInstructionError('Replace operation requires a "value" property.');
    }

    const { segments, finalSegment } = analyzePath(instruction.path);
    if (segments.length === 0) {
        throw new StateConflictError('Replacing the root document is not supported by this implementation.');
    }

    const parentSegments = segments.slice(0, -1);
    const { parent: targetParentNode } = locateTargetInDocument(doc, parentSegments);

    const newDataValue = instruction.value;

    if (isArrayType(targetParentNode)) {
        const index = parseInt(finalSegment, 10);
        if (isNaN(index) || index < 0 || index >= targetParentNode.length) { // Original uses `>=`
            throw new StateConflictError(`Array index "${finalSegment}" out of bounds for replace operation.`);
        }
        targetParentNode.splice(index, 1, newDataValue);
    } else if (isObjectType(targetParentNode)) {
        if (!(_hasOwn.call(targetParentNode, finalSegment))) {
            throw new StateConflictError(`Property "${finalSegment}" does not exist.`);
        }
        targetParentNode[finalSegment] = newDataValue;
    } else {
        throw new StateConflictError('Cannot replace property in a non-object/non-array parent.');
    }
};

const applyTest = (doc, instruction) => {
    if (!('value' in instruction)) {
        throw new PatchInstructionError('Test operation requires a "value" property.');
    }

    const { segments } = analyzePath(instruction.path);
    const { value: actualTargetValue } = locateTargetInDocument(doc, segments);

    const expectedValue = instruction.value;

    if (!deepValueEquivalence(actualTargetValue, expectedValue)) {
        throw new StateConflictError('Test operation failed: values are not equivalent.');
    }
    return true;
};

const applyMove = (doc, instruction) => {
    if (!('from' in instruction)) {
        throw new PatchInstructionError('Move operation requires a "from" property.');
    }

    const fromPathDetails = analyzePath(instruction.from);
    const toPathDetails = analyzePath(instruction.path);

    if (fromPathDetails.segments.length === 0) {
        throw new StateConflictError('Cannot move from the root document.');
    }
    if (toPathDetails.segments.length === 0) {
        throw new StateConflictError('Cannot move to the root document.');
    }

    // Check for moving an ancestor to a descendant (as per original code's restriction)
    let isMovingToDescendant = false;
    if (toPathDetails.segments.length > fromPathDetails.segments.length) {
        isMovingToDescendant = true;
        for (let i = 0; i < fromPathDetails.segments.length; i++) {
            if (fromPathDetails.segments[i] !== toPathDetails.segments[i]) {
                isMovingToDescendant = false;
                break;
            }
        }
    }
    if (isMovingToDescendant) {
        throw new PatchInstructionError('Cannot move an object to one of its own descendants.');
    }

    // If source and destination paths are identical, it's a no-op
    if (instruction.from === instruction.path) {
        return;
    }

    // 1. Extract value from source (and remove it)
    const fromParentSegments = fromPathDetails.segments.slice(0, -1);
    const { parent: sourceParentNode, value: extractedValue } = locateTargetInDocument(doc, fromPathDetails.segments);

    if (isArrayType(sourceParentNode)) {
        const fromIndex = parseInt(fromPathDetails.finalSegment, 10);
        if (isNaN(fromIndex) || fromIndex < 0 || fromIndex >= sourceParentNode.length) {
            throw new StateConflictError(`Array index "${fromPathDetails.finalSegment}" out of bounds for move source.`);
        }
        sourceParentNode.splice(fromIndex, 1);
    } else if (isObjectType(sourceParentNode)) {
        if (!(_hasOwn.call(sourceParentNode, fromPathDetails.finalSegment))) {
            throw new StateConflictError(`Property "${fromPathDetails.finalSegment}" does not exist at source.`);
        }
        delete sourceParentNode[fromPathDetails.finalSegment];
    } else {
        throw new StateConflictError('Cannot move from a non-object/non-array parent.');
    }

    // 2. Insert value at destination
    const toParentSegments = toPathDetails.segments.slice(0, -1);
    const { parent: destinationParentNode } = locateTargetInDocument(doc, toParentSegments);

    if (isArrayType(destinationParentNode)) {
        if (toPathDetails.finalSegment === '-') {
            destinationParentNode.push(extractedValue);
        } else {
            const toIndex = parseInt(toPathDetails.finalSegment, 10);
            if (isNaN(toIndex) || toIndex < 0 || toIndex > destinationParentNode.length) {
                throw new StateConflictError(`Array index "${toPathDetails.finalSegment}" out of bounds for move destination.`);
            }
            destinationParentNode.splice(toIndex, 0, extractedValue);
        }
    } else if (isObjectType(destinationParentNode)) {
        if (_hasOwn.call(destinationParentNode, toPathDetails.finalSegment)) {
            throw new StateConflictError(`Property "${toPathDetails.finalSegment}" already exists at destination.`);
        }
        destinationParentNode[toPathDetails.finalSegment] = extractedValue;
    } else {
        throw new StateConflictError('Cannot move to a non-object/non-array parent.');
    }
};

const applyCopy = (doc, instruction) => {
    if (!('from' in instruction)) {
        throw new PatchInstructionError('Copy operation requires a "from" property.');
    }

    const fromPathDetails = analyzePath(instruction.from);
    const toPathDetails = analyzePath(instruction.path);

    if (fromPathDetails.segments.length === 0) {
        throw new StateConflictError('Cannot copy from the root document.');
    }
    if (toPathDetails.segments.length === 0) {
        throw new StateConflictError('Cannot copy to the root document.');
    }

    // Replicating original code's restriction: Cannot copy an ancestor to a descendant
    let isCopyingToDescendant = false;
    if (toPathDetails.segments.length > fromPathDetails.segments.length) {
        isCopyingToDescendant = true;
        for (let i = 0; i < fromPathDetails.segments.length; i++) {
            if (fromPathDetails.segments[i] !== toPathDetails.segments[i]) {
                isCopyingToDescendant = false;
                break;
            }
        }
    }
    if (isCopyingToDescendant) {
        throw new PatchInstructionError('Cannot copy an object to one of its own descendants.');
    }

    // 1. Obtain value to copy
    const { value: valueToDuplicate } = locateTargetInDocument(doc, fromPathDetails.segments);

    // 2. Insert duplicated value at destination
    const toParentSegments = toPathDetails.segments.slice(0, -1);
    const { parent: destinationParentNode } = locateTargetInDocument(doc, toParentSegments);

    if (isArrayType(destinationParentNode)) {
        if (toPathDetails.finalSegment === '-') {
            destinationParentNode.push(valueToDuplicate);
        } else {
            const toIndex = parseInt(toPathDetails.finalSegment, 10);
            if (isNaN(toIndex) || toIndex < 0 || toIndex > destinationParentNode.length) {
                throw new StateConflictError(`Array index "${toPathDetails.finalSegment}" out of bounds for copy destination.`);
            }
            destinationParentNode.splice(toIndex, 0, valueToDuplicate);
        }
    } else if (isObjectType(destinationParentNode)) {
        if (_hasOwn.call(destinationParentNode, toPathDetails.finalSegment)) {
            throw new StateConflictError(`Property "${toPathDetails.finalSegment}" already exists at destination.`);
        }
        destinationParentNode[toPathDetails.finalSegment] = valueToDuplicate;
    } else {
        throw new StateConflictError('Cannot copy to a non-object/non-array parent.');
    }
};

// --- Operation Dispatcher ---

const actionExecutorMap = {
    add: applyAdd,
    remove: applyRemove,
    replace: applyReplace,
    test: applyTest,
    move: applyMove,
    copy: applyCopy
};

const makePatchProcessor = (patchArray) => {
    if (!isArrayType(patchArray)) {
        throw new PatchInstructionError('Patch instructions must be an array.');
    }

    // Pre-validate patch types and required 'path' property
    for (const singleInstruction of patchArray) {
        if (!isObjectType(singleInstruction) || !isStringType(singleInstruction.op) || !actionExecutorMap[singleInstruction.op]) {
            throw new PatchInstructionError(`Invalid or unrecognized patch operation: ${singleInstruction.op}`);
        }
        if (!('path' in singleInstruction)) {
            throw new PatchInstructionError('Each patch operation requires a "path" property.');
        }
    }

    return (documentReference) => {
        let finalOpResult = undefined;
        for (const singleInstruction of patchArray) {
            finalOpResult = actionExecutorMap[singleInstruction.op](documentReference, singleInstruction);
        }
        return finalOpResult;
    };
};

const executeUnifiedPatches = (targetDocument, patchInstructions) => {
    const processorFunction = makePatchProcessor(patchInstructions);
    return processorFunction(targetDocument);
};

// --- Global Export ---

const unifiedPatchTool = {};
unifiedPatchTool.execute = executeUnifiedPatches;
unifiedPatchTool.prepare = makePatchProcessor;

unifiedPatchTool.UnifiedPatchError = UnifiedPatchError;
unifiedPatchTool.PathSyntaxError = PathSyntaxError;
unifiedPatchTool.PatchInstructionError = PatchInstructionError;
unifiedPatchTool.StateConflictError = StateConflictError;

// Mimicking original's UMD-like global assignment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unifiedPatchTool;
} else if (typeof window !== 'undefined') {
    window.unifiedPatchTool = unifiedPatchTool;
} else if (typeof self !== 'undefined') {
    self.unifiedPatchTool = unifiedPatchTool;
}