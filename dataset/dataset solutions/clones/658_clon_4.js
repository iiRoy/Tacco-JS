'use strict';

let incomingData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    incomingData += chunk;
});
process.stdin.on('end', () => {
    const inputLines = incomingData.split('\n');

    // Tree representation: a plain object { l: leftChild, r: rightChild }
    // An empty child is represented by null.

    // Function to parse a string into the new tree structure
    function buildStructure(structureString) {
        const rootWrapper = { branch: null }; // A dummy wrapper for the actual root
        let currentBranchingPoint = rootWrapper; // The object whose child we are currently setting
        let isSettingLeft = true; // True if setting 'l', false if setting 'r'
        const branchStack = []; // Stack of parent branching points

        if (structureString === undefined) {
            // Replicate original behavior for undefined input string
            // Original `for (var _iterator = str[Symbol.iterator](), _s; ...)` throws TypeError
            // if `str` is undefined.
            // This loop will also throw if `structureString` is undefined.
        }

        for (const charToken of structureString) {
            if (charToken === '(') {
                const newBranch = { l: null, r: null };
                if (currentBranchingPoint === rootWrapper) {
                    currentBranchingPoint.branch = newBranch; // Set the actual root
                } else if (isSettingLeft) {
                    currentBranchingPoint.l = newBranch;
                } else {
                    currentBranchingPoint.r = newBranch;
                }
                branchStack.push(currentBranchingPoint); // Push the parent onto the stack
                currentBranchingPoint = newBranch; // Descend to the new branch
                isSettingLeft = true; // For the new branch, always start by expecting its left child
            } else if (charToken === ',') {
                isSettingLeft = false; // For the current branch, expect its right child next
            } else if (charToken === ')') {
                if (branchStack.length > 0) {
                    currentBranchingPoint = branchStack.pop(); // Ascend to parent
                    isSettingLeft = true; // Reset to true for the parent, as per original `comma = 0` logic
                }
            }
        }
        return rootWrapper.branch; // Return the actual root of the parsed tree
    }

    // Function to serialize the new tree structure back to a string
    function serializeStructure(nodeElement) {
        if (!nodeElement) {
            return '';
        }
        const leftPart = serializeStructure(nodeElement.l);
        const rightPart = serializeStructure(nodeElement.r);
        return `(${leftPart},${rightPart})`;
    }

    // Function to perform union operation
    function combineStructures(firstStruct, secondStruct) {
        if (!firstStruct) return secondStruct;
        if (!secondStruct) return firstStruct;

        const combinedNode = { l: null, r: null };
        const combinedLeft = combineStructures(firstStruct.l, secondStruct.l);
        if (combinedLeft) combinedNode.l = combinedLeft;
        const combinedRight = combineStructures(firstStruct.r, secondStruct.r);
        if (combinedRight) combinedNode.r = combinedRight;
        return combinedNode;
    }

    // Function to perform intersection operation
    function findCommonStructures(firstStruct, secondStruct) {
        if (!firstStruct || !secondStruct) return null;

        const commonNode = { l: null, r: null };
        const commonLeft = findCommonStructures(firstStruct.l, secondStruct.l);
        if (commonLeft) commonNode.l = commonLeft;
        const commonRight = findCommonStructures(firstStruct.r, secondStruct.r);
        if (commonRight) commonNode.r = commonRight;
        return commonNode;
    }

    for (const currentInputLine of inputLines) {
        const [operationType, firstTreeString, secondTreeString] = currentInputLine.split(' ');

        const firstParsedStructure = buildStructure(firstTreeString);
        const secondParsedStructure = buildStructure(secondTreeString);
        let operationResult;

        if (operationType === "u") {
            operationResult = combineStructures(firstParsedStructure, secondParsedStructure);
        } else if (operationType === "i") {
            operationResult = findCommonStructures(firstParsedStructure, secondParsedStructure);
        }
        console.log(serializeStructure(operationResult));
    }
});
