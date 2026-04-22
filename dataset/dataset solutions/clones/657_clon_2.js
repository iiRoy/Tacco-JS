/*
 * This script processes structural patterns from standard input.
 * It simulates operations on binary tree-like structures, specifically union and intersection.
 */

let receivedData = ''; // Variable to accumulate all incoming raw input.

// Resume the standard input stream to listen for data.
process.stdin.resume();
// Set the character encoding for the input stream to ensure proper interpretation.
process.stdin.setEncoding('utf8');

// Event handler for when data chunks are received from standard input.
process.stdin.on('data', function (dataBlock) {
    receivedData += dataBlock; // Append the new data chunk to the accumulator.
});

// Event handler for when the input stream has ended, signaling all data has been received.
process.stdin.on('end', function () {
    // Split the accumulated data into individual lines for processing.
    const lineEntries = receivedData.split('\n');
    // Remove the last element, which is often an empty string due to a trailing newline character.
    lineEntries.pop();

    /**
     * @class BinaryTreeNode
     * @description Represents a node within our custom binary tree-like structure.
     * Each node can have a primary child (analogous to left), a secondary child (analogous to right),
     * and an ancestor (parent) reference for traversal.
     */
    class BinaryTreeNode {
        constructor() {
            this.primaryChild = null;  // Reference to the first child node of this element.
            this.secondaryChild = null; // Reference to the second child node of this element.
            this.ancestor = null;      // Reference to the parent node of this element.
        }

        /**
         * Attaches a new node as the primary child of the current node.
         * Also sets the new child's ancestor property back to the current node.
         * @param {BinaryTreeNode} newChild - The node to be attached as the primary child.
         */
        attachPrimary(newChild) {
            this.primaryChild = newChild;
            newChild.ancestor = this;
        }

        /**
         * Attaches a new node as the secondary child of the current node.
         * Also sets the new child's ancestor property back to the current node.
         * @param {BinaryTreeNode} newChild - The node to be attached as the secondary child.
         */
        attachSecondary(newChild) {
            this.secondaryChild = newChild;
            newChild.ancestor = this;
        }

        /**
         * Generates a string representation of the node and its entire subtree.
         * This method recursively calls itself on its children to build the full structural string.
         * @returns {string} The string representation of the node's subtree, e.g., "((),())".
         */
        getStructureString() {
            return `(${this.primaryChild === null ? '' : this.primaryChild.getStructureString()},${this.secondaryChild === null ? '' : this.secondaryChild.getStructureString()})`;
        }
    }


    /**
     * @function constructDiagram
     * @description Parses a string pattern to build a binary tree-like structure.
     * The pattern uses parentheses `()` to denote nested structures and commas `,` to separate children.
     * For example, "((),())" represents a root with two children, each being a leaf node.
     * @param {string} patternString - The string defining the tree structure to be built.
     * @returns {BinaryTreeNode} The actual root of the constructed tree, which is the primary child
     *                           of an initial dummy base node.
     */
    const constructDiagram = patternString => {
        // Create an initial dummy base node to simplify the logic for handling the very first node.
        const baseNode = new BinaryTreeNode();
        let activeElement = baseNode; // Pointer to the currently active node during parsing.
        let branchIndicator = 0;      // Flag: 0 indicates attaching a primary child, 1 indicates a secondary child.

        // Iterate through each character of the input pattern string.
        for (const symbolUnit of patternString) {
            if (symbolUnit === "(") {
                const newElement = new BinaryTreeNode(); // Create a new node for a new branch or leaf.
                if (branchIndicator === 0) {
                    activeElement.attachPrimary(newElement); // Attach the new node as a primary child.
                } else {
                    activeElement.attachSecondary(newElement); // Attach the new node as a secondary child.
                }
                activeElement = newElement; // Move the active pointer to the newly created child node.
            }
            if (symbolUnit === ",") {
                branchIndicator = 1; // Set the flag to indicate that the next child should be secondary.
            }
            if (symbolUnit === ")") {
                activeElement = activeElement.ancestor; // Move the active pointer up to the parent node.
                branchIndicator = 0; // Reset the flag to primary child for the parent's next potential child.
            }
        }
        // Return the actual root of the tree, which is the primary child of the initial dummy base node.
        return baseNode.primaryChild;
    };


    /**
     * @function mergeStructures
     * @description Performs a union-like operation on two tree-like structures.
     * If a node (and its corresponding path) exists in either structure, it will exist in the merged structure.
     * This is a recursive function that traverses both input structures simultaneously.
     * @param {BinaryTreeNode} elementA - The first structure for the union operation.
     * @param {BinaryTreeNode} elementB - The second structure for the union operation.
     * @returns {BinaryTreeNode} A new structure representing the union of elementA and elementB.
     */
    const mergeStructures = (elementA, elementB) => {
        const resultNode = new BinaryTreeNode(); // Create a new node for the merged result at this level.

        // Base cases: if one structure is null, the union at this point is simply the other structure.
        if (elementA === null) {
            return elementB;
        }
        if (elementB === null) {
            return elementA;
        }

        // Recursively merge the primary children of both input elements.
        let tempOutcome = mergeStructures(elementA.primaryChild, elementB.primaryChild);
        if (tempOutcome !== null) {
            resultNode.attachPrimary(tempOutcome); // Attach the merged primary child if it exists.
        }

        // Recursively merge the secondary children of both input elements.
        tempOutcome = mergeStructures(elementA.secondaryChild, elementB.secondaryChild);
        if (tempOutcome !== null) {
            resultNode.attachSecondary(tempOutcome); // Attach the merged secondary child if it exists.
        }

        return resultNode; // Return the newly formed merged node for this level.
    };


    /**
     * @function overlapElements
     * @description Performs an intersection-like operation on two tree-like structures.
     * A node (and its corresponding path) exists in the intersection only if it exists in both input structures.
     * This is a recursive function that traverses both input structures simultaneously.
     * @param {BinaryTreeNode} elementA - The first structure for the intersection operation.
     * @param {BinaryTreeNode} elementB - The second structure for the intersection operation.
     * @returns {BinaryTreeNode|null} A new structure representing the intersection, or null if no overlap
     *                                  at this particular node or its children.
     */
    const overlapElements = (elementA, elementB) => {
        const resultNode = new BinaryTreeNode(); // Create a new node for the intersection result at this level.

        // Base case: if either structure is null, there's no intersection at this specific point.
        if (elementA === null || elementB === null) {
            return null;
        }

        // Recursively find the intersection of the primary children.
        let tempOutcome = overlapElements(elementA.primaryChild, elementB.primaryChild);
        if (tempOutcome !== null) {
            resultNode.attachPrimary(tempOutcome); // Attach the intersected primary child if it exists.
        }

        // Recursively find the intersection of the secondary children.
        tempOutcome = overlapElements(elementA.secondaryChild, elementB.secondaryChild);
        if (tempOutcome !== null) {
            resultNode.attachSecondary(tempOutcome); // Attach the intersected secondary child if it exists.
        }

        // Return the newly formed intersection node for this level.
        // A node is considered part of the intersection if both elementA and elementB exist at this level,
        // regardless of whether their children also intersect.
        return resultNode;
    };


    // Main loop to process each line entry received from standard input.
    for (const currentInputLine of lineEntries) {
        // Destructure the line into the operation type and two tree string patterns.
        const [actionKind, diagramStringOne, diagramStringTwo] = currentInputLine.split(' ');

        // Construct the first tree structure from its string representation.
        const firstStructure = constructDiagram(diagramStringOne);
        // Construct the second tree structure from its string representation.
        const secondStructure = constructDiagram(diagramStringTwo);

        let finalOutcome; // Variable to hold the result of the tree operation.

        // Perform the specified operation based on the 'actionKind'.
        if (actionKind === "u") { // 'u' for union operation.
            finalOutcome = mergeStructures(firstStructure, secondStructure);
        } else if (actionKind === "i") { // 'i' for intersection operation.
            finalOutcome = overlapElements(firstStructure, secondStructure);
        }

        // Print the string representation of the final resulting structure to standard output.
        console.log(finalOutcome.getStructureString());
    }
});