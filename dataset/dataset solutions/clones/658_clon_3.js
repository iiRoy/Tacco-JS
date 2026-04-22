'use strict';

// A buffer to hold all incoming data from standard input.
let receivedInputBuffer = '';

// Begin listening for data on the standard input stream.
process.stdin.resume();

// Configure the input stream to decode data as UTF-8 text.
process.stdin.setEncoding('utf8');

// Attach a listener for 'data' events, accumulating chunks into our buffer.
process.stdin.on('data', (dataChunk) => {
    receivedInputBuffer += dataChunk;
});

// Attach a listener for the 'end' event, triggered when all input has been received.
process.stdin.on('end', () => {
    // Once input is complete, initiate the main processing logic.
    executeTreeCalculations(receivedInputBuffer);
});

/**
 * Defines a structural component for a binary tree.
 * Each node manages references to its left child, right child, and parent.
 */
class BinaryTreeComponent {
    /**
     * Constructs a new BinaryTreeComponent.
     * @param {BinaryTreeComponent | null} lChild - The left child of this component. Defaults to null.
     * @param {BinaryTreeComponent | null} rChild - The right child of this component. Defaults to null.
     * @param {BinaryTreeComponent | null} pNode - The parent of this component. Defaults to null.
     */
    constructor(lChild = null, rChild = null, pNode = null) {
        this.lChild = lChild;
        this.rChild = rChild;
        this.pNode = pNode;
    }

    /**
     * Sets the left child of the current component.
     * Automatically updates the child's parent reference.
     * @param {BinaryTreeComponent | null} childUnit - The component to assign as the left child.
     */
    setLeft(childUnit) {
        this.lChild = childUnit;
        if (childUnit instanceof BinaryTreeComponent) {
            childUnit.pNode = this;
        }
    }

    /**
     * Sets the right child of the current component.
     * Automatically updates the child's parent reference.
     * @param {BinaryTreeComponent | null} childUnit - The component to assign as the right child.
     */
    setRight(childUnit) {
        this.rChild = childUnit;
        if (childUnit instanceof BinaryTreeComponent) {
            childUnit.pNode = this;
        }
    }

    /**
     * Generates a string representation of the tree structure starting from this component.
     * The format uses parentheses and commas to denote nested structures, e.g., '((,),())'.
     * @returns {string} The serialized tree structure.
     */
    serialize() {
        const leftSub = this.lChild ? this.lChild.serialize() : '';
        const rightSub = this.rChild ? this.rChild.serialize() : '';
        return `(${leftSub},${rightSub})`;
    }
}

/**
 * Converts a textual representation into a binary tree structure.
 * The input string adheres to a specific format like '((,),())'.
 * @param {string} structureText - The string to be parsed into a tree.
 * @returns {BinaryTreeComponent | null} The root component of the generated tree, or null if input is empty.
 * @throws {Error} If the input string is malformed or contains unexpected characters.
 */
const constructTreeFromString = (structureText) => {
    // Handle empty or whitespace-only input strings.
    if (!structureText || structureText.trim().length === 0) {
        return null;
    }

    // A temporary root node simplifies tree construction, acting as a parent to the actual tree's root.
    const temporaryRoot = new BinaryTreeComponent();
    let currentFocus = temporaryRoot; // The component currently being built or navigated from.
    let expectingRightChild = false; // Flag to determine if the next child should be left (false) or right (true).

    // Iterate through each character of the input string.
    for (const charToken of structureText) {
        switch (charToken) {
            case '(':
                const newComponent = new BinaryTreeComponent();
                if (!expectingRightChild) {
                    currentFocus.setLeft(newComponent);
                } else {
                    currentFocus.setRight(newComponent);
                }
                currentFocus = newComponent; // Move focus to the newly created child.
                expectingRightChild = false; // Reset, as a new node always starts with a potential left child.
                break;
            case ',':
                expectingRightChild = true; // The next child encountered will be the right one.
                break;
            case ')':
                // Move focus back to the parent component.
                if (!currentFocus.pNode) {
                    // This indicates an imbalance in parentheses, e.g., closing a non-existent parent.
                    throw new Error(`Invalid tree structure: Unmatched closing parenthesis found in "${structureText}"`);
                }
                currentFocus = currentFocus.pNode;
                expectingRightChild = false; // Reset after completing a sub-tree.
                break;
            default:
                // For robustness, unexpected characters could be logged or cause an error.
                // For this scenario, we'll simply ignore them.
                break;
        }
    }

    // After parsing, the actual root of the tree is the left child of the temporary root.
    // If the input was just "()", temporaryRoot.lChild would be an empty node, which is correct.
    return temporaryRoot.lChild;
};

/**
 * Performs a union operation on two binary trees.
 * Creates a new tree containing nodes present in either `treeAlpha` or `treeBeta` at corresponding locations.
 * @param {BinaryTreeComponent | null} treeAlpha - The first tree for the union.
 * @param {BinaryTreeComponent | null} treeBeta - The second tree for the union.
 * @returns {BinaryTreeComponent | null} The resulting tree after the union operation.
 */
const uniteTreeStructures = (treeAlpha, treeBeta) => {
    // Base cases: If one tree is null, the union result is simply the other tree.
    if (!treeAlpha) {
        return treeBeta;
    }
    if (!treeBeta) {
        return treeAlpha;
    }

    // Create a new component for the current level of the combined tree.
    const combinedComponent = new BinaryTreeComponent();

    // Recursively unite the left subtrees.
    const leftUnionResult = uniteTreeStructures(treeAlpha.lChild, treeBeta.lChild);
    if (leftUnionResult) {
        combinedComponent.setLeft(leftUnionResult);
    }

    // Recursively unite the right subtrees.
    const rightUnionResult = uniteTreeStructures(treeAlpha.rChild, treeBeta.rChild);
    if (rightUnionResult) {
        combinedComponent.setRight(rightUnionResult);
    }

    return combinedComponent;
};

/**
 * Performs an intersection operation on two binary trees.
 * Creates a new tree containing only nodes that are common to both `treeAlpha` and `treeBeta` at corresponding locations.
 * @param {BinaryTreeComponent | null} treeAlpha - The first tree for the intersection.
 *   @param {BinaryTreeComponent | null} treeBeta - The second tree for the intersection.
 * @returns {BinaryTreeComponent | null} The resulting tree after the intersection operation.
 */
const intersectTreeStructures = (treeAlpha, treeBeta) => {
    // Base case: If either tree is null, there can be no common part at this level.
    if (!treeAlpha || !treeBeta) {
        return null;
    }

    // Create a new component for the current level of the common tree.
    const commonComponent = new BinaryTreeComponent();

    // Recursively find common left subtrees.
    const leftIntersectionResult = intersectTreeStructures(treeAlpha.lChild, treeBeta.lChild);
    if (leftIntersectionResult) {
        commonComponent.setLeft(leftIntersectionResult);
    }

    // Recursively find common right subtrees.
    const rightIntersectionResult = intersectTreeStructures(treeAlpha.rChild, treeBeta.rChild);
    if (rightIntersectionResult) {
        commonComponent.setRight(rightIntersectionResult);
    }

    return commonComponent;
};

/**
 * Orchestrates the processing of multiple input lines, each specifying a tree operation.
 * @param {string} aggregatedInput - The complete string gathered from standard input.
 */
const executeTreeCalculations = (aggregatedInput) => {
    // Split the input into individual lines and filter out any empty or whitespace-only lines.
    const inputLineArray = aggregatedInput.split('\n').filter(line => line.trim().length > 0);

    // Provide feedback if no valid input lines were found.
    if (inputLineArray.length === 0) {
        console.error("No valid input lines detected for tree operations. Please provide data.");
        return;
    }

    // Process each line sequentially.
    for (const currentInputRow of inputLineArray) {
        processSingleInstruction(currentInputRow);
    }
};

/**
 * Processes a single line of input, parsing tree definitions and executing the specified operation.
 * @param {string} instructionLine - A single line containing an operation type and two tree strings.
 */
const processSingleInstruction = (instructionLine) => {
    // Split the line into parts, handling multiple spaces by filtering empty strings.
    const instructionParts = instructionLine.split(' ').filter(part => part !== '');

    // Validate that the line contains the expected number of parts (operation, tree1, tree2).
    if (instructionParts.length !== 3) {
        console.error(`Skipping malformed input (expected 'operation tree1 tree2'): "${instructionLine}"`);
        return;
    }

    const [operationIdentifier, firstTreeString, secondTreeString] = instructionParts;

    let treeParsedA;
    let treeParsedB;

    // Attempt to construct the trees from their string representations.
    try {
        treeParsedA = constructTreeFromString(firstTreeString);
        treeParsedB = constructTreeFromString(secondTreeString);
    } catch (parseError) {
        console.error(`Failed to parse tree strings for line "${instructionLine}": ${parseError.message}`);
        return; // Abort processing this line if parsing fails.
    }

    let finalOperationOutcome = null; // Variable to hold the result of the tree operation.

    // Execute the appropriate tree operation based on the identifier.
    if (operationIdentifier === "u") {
        finalOperationOutcome = uniteTreeStructures(treeParsedA, treeParsedB);
    } else if (operationIdentifier === "i") {
        finalOperationOutcome = intersectTreeStructures(treeParsedA, treeParsedB);
    } else {
        console.error(`Unknown operation identifier '${operationIdentifier}' for line: "${instructionLine}". Expected 'u' (union) or 'i' (intersection).`);
        return; // Abort if the operation is unrecognized.
    }

    // Output the serialized form of the resulting tree.
    // If the operation results in a null tree (e.g., intersection of two disjoint trees),
    // represent it as an empty parenthesis pair '()'.
    if (finalOperationOutcome) {
        console.log(finalOperationOutcome.serialize());
    } else {
        console.log('()');
    }
};