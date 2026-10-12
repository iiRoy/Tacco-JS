let accumulatedData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingSegment) {
    accumulatedData += incomingSegment;
});
process.stdin.on('end', function() {

    // Function to transform a string representation into a nested array structure
    // e.g., "((,),())" -> [[null, [null,null]], [[null,null], null]] (simplified for conceptual understanding)
    function decodePattern(structureString) {
        const workingStack = [[null, null]]; // Initial dummy node for the root
        let currentFocus = workingStack[0];
        let fillingRightBranch = false; // Flag to determine if we're adding to left or right child

        for (const charSymbol of structureString) {
            if (charSymbol === '(') {
                const freshArrUnit = [null, null]; // A new node represented as [left_child, right_child]
                if (!fillingRightBranch) {
                    currentFocus[0] = freshArrUnit; // Assign to left child
                } else {
                    currentFocus[1] = freshArrUnit; // Assign to right child
                }
                workingStack.push(currentFocus); // Push current node to stack before moving deeper
                currentFocus = freshArrUnit; // Move focus to the newly created unit
                fillingRightBranch = false; // Reset for children of the new unit
            } else if (charSymbol === ',') {
                fillingRightBranch = true; // Next child will be the right one
            } else if (charSymbol === ')') {
                currentFocus = workingStack.pop(); // Move focus up to the parent node
                fillingRightBranch = false; // Reset (though not strictly necessary here, good practice)
            }
        }
        return workingStack[0][0]; // The actual tree is the left child of the initial dummy node
    }

    // Function to perform a union operation on two tree structures
    function fuseStructures(firstTreeUnit, secondTreeUnit) {
        if (firstTreeUnit === null) {
            return secondTreeUnit;
        }
        if (secondTreeUnit === null) {
            return firstTreeUnit;
        }
        // Both units are non-null arrays [left, right]
        return [
            fuseStructures(firstTreeUnit[0], secondTreeUnit[0]),
            fuseStructures(firstTreeUnit[1], secondTreeUnit[1])
        ];
    }

    // Function to perform an intersection operation on two tree structures
    function identifyCommon(firstTreeUnit, secondTreeUnit) {
        if (firstTreeUnit === null || secondTreeUnit === null) {
            return null;
        }
        // Both units are non-null arrays [left, right]
        const leftResult = identifyCommon(firstTreeUnit[0], secondTreeUnit[0]);
        const rightResult = identifyCommon(firstTreeUnit[1], secondTreeUnit[1]);

        // If both input nodes exist, the resulting node also exists.
        // Its children are populated based on the recursive intersection results.
        return [leftResult, rightResult];
    }

    // Function to convert a nested array structure back into its string representation
    function displayStructure(structuralUnit) {
        if (structuralUnit === null) {
            return '';
        }
        const leftSub = displayStructure(structuralUnit[0]);
        const rightSub = displayStructure(structuralUnit[1]);
        return '(' + leftSub + ',' + rightSub + ')';
    }

    const operationLines = accumulatedData.split('\n');
    operationLines.pop(); // Remove the last empty string if present

    for (const currentLine of operationLines) {
        const components = currentLine.split(' ');
        const operationKind = components[0];
        const primaryPattern = components[1];
        const secondaryPattern = components[2];

        const primaryStructure = decodePattern(primaryPattern);
        const secondaryStructure = decodePattern(secondaryPattern);

        let finalOutcome;
        if (operationKind === "u") {
            finalOutcome = fuseStructures(primaryStructure, secondaryStructure);
        } else if (operationKind === "i") {
            finalOutcome = identifyCommon(primaryStructure, secondaryStructure);
        }
        console.log(displayStructure(finalOutcome));
    }
});