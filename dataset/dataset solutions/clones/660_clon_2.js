var incomingData = "";

// Establish an alias for the global process object to allow renaming its usage
const systemOperation = process;

// Activate the standard input stream to begin receiving data
systemOperation.stdin.resume();

// Specify the character encoding for the incoming data stream
systemOperation.stdin.setEncoding('utf8');

// Attach an event handler for when new data chunks arrive
systemOperation.stdin.on('data', function (dataBlock) {
    // Accumulate the received data block into the main data buffer
    incomingData += dataBlock;
});

// Attach an event handler for when the input stream concludes
systemOperation.stdin.on('end', function () {
    // Once all input is received, divide the accumulated data into individual lines
    const dataLines = incomingData.split('\n');

    // Definition for a structural unit within a tree-like data representation
    class Branch {
        // Constructor method to initialize a new Branch instance
        constructor() {
            this.childA = null;    // Reference to the first child branch
            this.childB = null;    // Reference to the second child branch
            this.ancestor = null;  // Reference to the parent branch
        }

        // Method to assign a sub-branch as the first child of this branch
        placeChildA(subBranch) {
            this.childA = subBranch;    // Set the first child
            subBranch.ancestor = this;  // Set the parent of the sub-branch to this branch
        }

        // Method to assign a sub-branch as the second child of this branch
        placeChildB(subBranch) {
            this.childB = subBranch;    // Set the second child
            subBranch.ancestor = this;  // Set the parent of the sub-branch to this branch
        }

        // Generates a string representation of the branch's structure
        renderStructure() {
            return `(${this.childA == null ? '' : this.childA.renderStructure()},${this.childB == null ? '' : this.childB.renderStructure()})`;
        }
    }

    // Function to construct a tree structure from a serialized string input
    const buildStructure = inputSequence => {
        const baseBranch = new Branch();    // Create a dummy root branch
        let currentStructure = baseBranch;  // Pointer to the current branch being processed
        let separatorFlag = 0;             // Flag to distinguish between first (0) and second (1) child

        // Iterate through each character of the input string
        for (const symbol of inputSequence) {
            if (symbol === "(") { // If an opening parenthesis is found, create a new child
                const newBranch = new Branch();
                if (separatorFlag === 0) {
                    currentStructure.placeChildA(newBranch); // Attach as the first child
                } else {
                    currentStructure.placeChildB(newBranch); // Attach as the second child
                }
                currentStructure = newBranch; // Move the pointer to the new child
            }
            if (symbol === ",") { // If a comma is found, subsequent child should be the second
                separatorFlag = 1;
            }
            if (symbol === ")") { // If a closing parenthesis is found, move up to the parent
                currentStructure = currentStructure.ancestor;
                separatorFlag = 0; // Reset flag for potential next sibling
            }
        }
        return baseBranch.childA; // Return the actual root of the tree (excluding the dummy root)
    };

    // Function to compute the union of two tree structures
    const mergeStructures = (structA, structB) => {
        const resultBranch = new Branch(); // Create a new branch for the merged result
        if (structA === null) return structB; // If first structure is null, return the second
        if (structB === null) return structA; // If second structure is null, return the first

        let tempResult = mergeStructures(structA.childA, structB.childA); // Recursively merge first children
        if (tempResult !== null) {
            resultBranch.placeChildA(tempResult); // Attach if a merged child exists
        }

        tempResult = mergeStructures(structA.childB, structB.childB); // Recursively merge second children
        if (tempResult !== null) {
            resultBranch.placeChildB(tempResult); // Attach if a merged child exists
        }
        return resultBranch; // Return the resulting merged branch
    };

    // Function to compute the intersection of two tree structures
    const findCommon = (structA_param, structB_param) => {
        const commonBranch = new Branch(); // Create a new branch for the common part
        if (structA_param === null || structB_param === null) {
            return null; // If either structure is null, there is no common part
        }

        let currentCommon = findCommon(structA_param.childA, structB_param.childA); // Recursively intersect first children
        if (currentCommon !== null) {
            commonBranch.placeChildA(currentCommon); // Attach if a common child exists
        }

        currentCommon = findCommon(structA_param.childB, structB_param.childB); // Recursively intersect second children
        if (currentCommon !== null) {
            commonBranch.placeChildB(currentCommon); // Attach if a common child exists
        }
        return commonBranch; // Return the resulting common branch
    };

    // Process each line of the input data
    for (const singleLineInput of dataLines) {
        // Deconstruct each line into the operation type and two tree strings
        const [operationKind, structureStringA, structureStringB] = singleLineInput.split(' ');

        const parsedStructureA = buildStructure(structureStringA); // Build the first tree from its string
        const parsedStructureB = buildStructure(structureStringB); // Build the second tree from its string

        let finalOutcome; // Variable to hold the result of the tree operation

        if (operationKind === "unite") { // Check if the operation is union
            finalOutcome = mergeStructures(parsedStructureA, parsedStructureB); // Perform the union operation
        } else if (operationKind === "intersect") { // Check if the operation is intersection
            finalOutcome = findCommon(parsedStructureA, parsedStructureB); // Perform the intersection operation
        }
        // The result `finalOutcome` is available here, but the original code does not print it.
    }
});