'use strict';

let accumulatedInputData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
    accumulatedInputData += dataChunk;
});
process.stdin.on('end', () => {
    const allInputLines = accumulatedInputData.split('\n');

    // A branch structure is represented as an array: [leftSubBranch, rightSubBranch]
    // An empty branch is represented as null.

    // Transforms a branch structure into its string representation.
    const renderBranch = (currentBranch) => {
        if (currentBranch === null) {
            return '';
        }
        // currentBranch is [leftSubBranch, rightSubBranch]
        const leftPart = renderBranch(currentBranch[0]);
        const rightPart = renderBranch(currentBranch[1]);
        return `(${leftPart},${rightPart})`;
    };

    // Recursively builds a branch structure from a string representation.
    // The `idxRef` object is used to pass the current parsing index by reference.
    const buildBranch = (expressionString, idxRef) => {
        // If the current character is not '(', it means this sub-branch is empty.
        // This handles cases like `(,)` where left/right children are implicitly empty.
        if (expressionString[idxRef.val] !== '(') {
            return null;
        }

        idxRef.val++; // Consume '('

        let leftChild = null;
        // If the next character is not ',', it means there's a left child to parse.
        if (expressionString[idxRef.val] !== ',') {
            leftChild = buildBranch(expressionString, idxRef);
        }

        idxRef.val++; // Consume ','

        let rightChild = null;
        // If the next character is not ')', it means there's a right child to parse.
        if (expressionString[idxRef.val] !== ')') {
            rightChild = buildBranch(expressionString, idxRef);
        }

        idxRef.val++; // Consume ')'

        return [leftChild, rightChild];
    };

    // Performs a logical OR-like combination of two branch structures.
    const combineBranches = (firstUnit, secondUnit) => {
        if (firstUnit === null) {
            return secondUnit;
        }
        if (secondUnit === null) {
            return firstUnit;
        }
        // Both units are non-null, so they are [L, R] arrays.
        const combinedLeft = combineBranches(firstUnit[0], secondUnit[0]);
        const combinedRight = combineBranches(firstUnit[1], secondUnit[1]);
        return [combinedLeft, combinedRight];
    };

    // Performs a logical AND-like intersection of two branch structures.
    const filterBranches = (firstUnit, secondUnit) => {
        if (firstUnit === null || secondUnit === null) {
            return null;
        }
        // Both units are non-null, so they are [L, R] arrays.
        const filteredLeft = filterBranches(firstUnit[0], secondUnit[0]);
        const filteredRight = filterBranches(firstUnit[1], secondUnit[1]);
        return [filteredLeft, filteredRight];
    };

    // Iterate through each processed input line
    for (let lineIterator = 0; lineIterator < allInputLines.length; lineIterator++) {
        const currentDataLine = allInputLines[lineIterator];
        if (!currentDataLine.trim()) {
            continue; // Skip any empty lines
        }

        const lineSegments = currentDataLine.split(' ');
        const operationIndicator = lineSegments[0];
        const firstStructureText = lineSegments[1];
        const secondStructureText = lineSegments[2];

        // Parse the two input structures
        const pointerA = { val: 0 };
        const primaryStructure = buildBranch(firstStructureText, pointerA);
        
        const pointerB = { val: 0 };
        const secondaryStructure = buildBranch(secondStructureText, pointerB);

        let finalStructure;
        if (operationIndicator === "u") {
            finalStructure = combineBranches(primaryStructure, secondaryStructure);
        } else if (operationIndicator === "i") {
            finalStructure = filterBranches(primaryStructure, secondaryStructure);
        }
        console.log(renderBranch(finalStructure));
    }
});