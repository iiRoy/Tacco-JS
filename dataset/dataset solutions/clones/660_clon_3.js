let receivedDataBuffer = ''; // Buffer to accumulate incoming data from standard input.

// Resume standard input stream and set its encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
// Appends each data portion to the buffer.
process.stdin.on('data', function(dataPortion) {
    receivedDataBuffer += dataPortion;
});

// Event listener for the end of the standard input stream.
// This block contains the core logic for processing the received data.
process.stdin.on('end', function() {
    // Split the accumulated data into individual lines, filtering out any empty lines.
    const processingLines = receivedDataBuffer.split('\n').filter(line => line.trim().length > 0);

    /**
     * Represents a node within a binary tree-like structure.
     * Each node can have a left child, a right child, and a reference to its parent.
     */
    class StructuralElement {
        /**
         * Initializes a new StructuralElement instance.
         * @param {any} [payloadValue=null] - An optional value to store in the node. (Not used in original logic, but added for Type III variation).
         */
        constructor(payloadValue = null) {
            this.leftChildRef = null;  // Reference to the left child element.
            this.rightChildRef = null; // Reference to the right child element.
            this.parentRef = null;     // Reference to the parent element.
            this.nodeValue = payloadValue; // A placeholder for potential node data.
        }

        /**
         * Attaches a provided child element as the left child of this element.
         * Establishes a bidirectional link by also setting the child's parent.
         * @param {StructuralElement} childElement - The element to attach as the left child.
         */
        attachLeftChild(childElement) {
            if (!childElement || !(childElement instanceof StructuralElement)) {
                console.warn("Attempted to attach an invalid left child element.");
                return; // Guard clause for invalid input
            }
            this.leftChildRef = childElement;
            childElement.parentRef = this;
        }

        /**
         * Attaches a provided child element as the right child of this element.
         * Establishes a bidirectional link by also setting the child's parent.
         * @param {StructuralElement} childElement - The element to attach as the right child.
         */
        attachRightChild(childElement) {
            if (!childElement || !(childElement instanceof StructuralElement)) {
                console.warn("Attempted to attach an invalid right child element.");
                return; // Guard clause for invalid input
            }
            this.rightChildRef = childElement;
            childElement.parentRef = this;
        }

        /**
         * Provides a simplified string representation of the element's children.
         * This method's output format is deliberately different from the original's,
         * and it's primarily for debugging or internal display as it's not used
         * for final output in the main logic.
         * @returns {string} - A string indicating the presence of children.
         */
        displayChildrenStatus() {
            const leftStatus = this.leftChildRef ? "L" : "-";
            const rightStatus = this.rightChildRef ? "R" : "-";
            return `[${leftStatus}|${rightStatus}]`;
        }
    }

    /**
     * Constructs a binary tree-like structure based on a given pattern string.
     * The pattern uses parentheses for nesting and commas to separate left/right children.
     * Example: "((),())"
     * @param {string} patternString - The string representation of the tree structure.
     * @returns {StructuralElement|null} The root of the constructed tree's left branch, or null if the input is invalid.
     */
    const constructStructureFromPattern = (patternString) => {
        // Basic validation: if the pattern is empty or not a string, return null.
        if (typeof patternString !== 'string' || patternString.length === 0) {
            console.error("Invalid or empty pattern string provided for tree construction.");
            return null;
        }

        // Create an initial dummy root node; the actual tree will be its left child.
        const initialElement = new StructuralElement();
        let currentElementCursor = initialElement;
        let isProcessingRightChild = false; // Flag to indicate if the next child should be right (after a comma)

        // Iterate through each character of the pattern string.
        for (let charIndex = 0; charIndex < patternString.length; ++charIndex) {
            const symbolChar = patternString[charIndex];

            if (symbolChar === '(') {
                // Encountered an opening parenthesis: create a new child node.
                const newChildElement = new StructuralElement();
                // Determine whether to attach it as a left or right child.
                if (!isProcessingRightChild) {
                    currentElementCursor.attachLeftChild(newChildElement);
                } else {
                    currentElementCursor.attachRightChild(newChildElement);
                }
                // Move the cursor to the newly created child for further construction.
                currentElementCursor = newChildElement;
                isProcessingRightChild = false; // Reset for the next potential child within this new element
            } else if (symbolChar === ',') {
                // Encountered a comma: signifies that the next child will be the right child.
                isProcessingRightChild = true;
            } else if (symbolChar === ')') {
                // Encountered a closing parenthesis: move the cursor up to the parent.
                // This assumes a well-formed input string; otherwise, currentElementCursor.parentRef could be null.
                if (currentElementCursor.parentRef) {
                    currentElementCursor = currentElementCursor.parentRef;
                } else {
                    // This case indicates an ill-formed pattern (e.g., too many closing parens)
                    console.warn("Encountered ')' without a parent element to ascend to. Pattern might be malformed.");
                }
                isProcessingRightChild = false; // Reset after moving up
            }
            // Other characters are ignored, providing some robustness to malformed input.
        }
        // Return the actual root of the constructed tree (which is the left child of the initial dummy element).
        return initialElement.leftChildRef;
    };

    /**
     * Performs a union operation on two tree-like structures.
     * For each corresponding position, if either structure has a node, the result will have a node.
     * @param {StructuralElement|null} firstStructure - The first tree structure.
     * @param {StructuralElement|null} secondStructure - The second tree structure.
     * @returns {StructuralElement|null} A new tree structure representing the union.
     */
    const combineStructures = (firstStructure, secondStructure) => {
        // Guard for base cases: if both are null, the union is null.
        if (!firstStructure && !secondStructure) {
            return null;
        }
        // If one is null, the union is the other structure (or a copy of it, for true immutability).
        // Here, we return the existing structure as a shortcut, which is functionally equivalent.
        if (!firstStructure) {
            return secondStructure;
        }
        if (!secondStructure) {
            return firstStructure;
        }

        // Create a new node for the current level of the union result.
        const resultantElement = new StructuralElement();

        // Recursively combine left children.
        const leftRecursionOutcome = combineStructures(firstStructure.leftChildRef, secondStructure.leftChildRef);
        // If the recursive call returned a node, attach it as the left child.
        if (leftRecursionOutcome) {
            resultantElement.attachLeftChild(leftRecursionOutcome);
        }

        // Recursively combine right children.
        const rightRecursionOutcome = combineStructures(firstStructure.rightChildRef, secondStructure.rightChildRef);
        // If the recursive call returned a node, attach it as the right child.
        if (rightRecursionOutcome) {
            resultantElement.attachRightChild(rightRecursionOutcome);
        }

        return resultantElement;
    };

    /**
     * Performs an intersection operation on two tree-like structures.
     * For each corresponding position, a node is present in the result only if nodes exist in both input structures.
     * @param {StructuralElement|null} firstComponent - The first tree component.
     * @param {StructuralElement|null} secondComponent - The second tree component.
     * @returns {StructuralElement|null} A new tree structure representing the intersection.
     */
    const findCommonElements = (firstComponent, secondComponent) => {
        // Base case: if either component is null, there can be no intersection at this point.
        if (!firstComponent || !secondComponent) {
            return null;
        }

        // Create a new node for the current level of the intersection result.
        const intersectionResultNode = new StructuralElement();

        // Recursively find common elements in left children.
        const leftSubResult = findCommonElements(firstComponent.leftChildRef, secondComponent.leftChildRef);
        // If the recursive call yielded a node, attach it.
        if (leftSubResult) {
            intersectionResultNode.attachLeftChild(leftSubResult);
        }

        // Recursively find common elements in right children.
        const rightSubResult = findCommonElements(firstComponent.rightChildRef, secondComponent.rightChildRef);
        // If the recursive call yielded a node, attach it.
        if (rightSubResult) {
            intersectionResultNode.attachRightChild(rightSubResult);
        }

        return intersectionResultNode;
    };

    // Process each line of input data.
    for (const singleLineData of processingLines) {
        // Split the line into operation type and two tree pattern strings.
        const parts = singleLineData.split(' ');
        if (parts.length < 3) {
            console.warn(`Skipping malformed input line: "${singleLineData}". Expected 3 parts.`);
            continue; // Skip to the next line if input is incomplete.
        }
        const [operationType, firstPatternString, secondPatternString] = parts;

        // Construct the two tree structures from their pattern strings.
        const parsedStructureA = constructStructureFromPattern(firstPatternString);
        const parsedStructureB = constructStructureFromPattern(secondPatternString);

        let finalOperationResult = null; // Variable to hold the result of the tree operation.

        // Use a switch statement for clearer handling of different operation types.
        switch (operationType) {
            case "u": // Union operation
                finalOperationResult = combineStructures(parsedStructureA, parsedStructureB);
                break;
            case "i": // Intersection operation
                finalOperationResult = findCommonElements(parsedStructureA, parsedStructureB);
                break;
            default: // Handle unknown operation types.
                console.error(`Unknown operation type encountered: '${operationType}'. Skipping this line.`);
                // No result for unknown operations, finalOperationResult remains null.
                break;
        }

        // Note: The original code does not output the 'res' variable.
        // If output were desired, it would typically be done here, e.g.,
        // console.log(finalOperationResult ? finalOperationResult.displayChildrenStatus() : "null");
    }
});