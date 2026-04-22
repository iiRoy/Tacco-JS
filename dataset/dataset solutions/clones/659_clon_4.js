let dataBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', fragment => {
    dataBuffer += fragment;
});
process.stdin.on('end', () => {
    const lineSegments = dataBuffer.split('\n').filter(Boolean);

    // Tree representation: null for an empty subtree, [leftSubtree, rightSubtree] for a branch node.
    // This replaces the imperative Node class with a functional array-based structure.

    // Builds a branch structure from its string representation.
    // This function mimics the original createTree's behavior using recursion
    // and shared state (charIndex) to traverse the input string.
    const buildBranch = (branchText) => {
        if (branchText === '') {
            return null; // Empty string results in a null branch, matching original.
        }

        const characters = branchText.split('');
        let charIndex = 0; // Shared index for recursive calls

        // Recursive helper function to populate the currentParent's children
        const recursivePopulate = (currentParent) => {
            let isLeftChild = true; // State to track whether to assign to left or right
            while (charIndex < characters.length) {
                const char = characters[charIndex];
                charIndex++; // Consume the character

                if (char === '(') {
                    const childBranch = [null, null]; // A new branch node
                    if (isLeftChild) {
                        currentParent[0] = childBranch; // Assign to left child
                    } else {
                        currentParent[1] = childBranch; // Assign to right child
                    }
                    recursivePopulate(childBranch); // Descend: recurse with the new child as the parent
                    // When recursivePopulate returns, it means we've finished parsing the child's subtree
                    // and 'ascended' back to the currentParent's context.
                } else if (char === ',') {
                    isLeftChild = false; // Switch to parsing the right child
                } else if (char === ')') {
                    return; // Ascend: return to the parent's recursive call
                }
            }
        };

        // The original `createTree` creates an implicit `root` and returns `root.left`.
        // We simulate this by creating an `implicitRoot` array and populating its children.
        const implicitRoot = [null, null];
        recursivePopulate(implicitRoot);
        return implicitRoot[0]; // Return the left child of the implicit root.
    };

    // Renders the internal branch structure to the required string format.
    const renderBranch = (currentBranch) => {
        if (currentBranch === null) {
            return ''; // Null branch renders as an empty string.
        }
        const [left, right] = currentBranch;
        return `(${renderBranch(left)},${renderBranch(right)})`;
    };

    // Combines two branches (union operation) recursively.
    const combineBranches = (firstBranch, secondBranch) => {
        if (firstBranch === null) {
            return secondBranch; // If first is empty, union is second.
        }
        if (secondBranch === null) {
            return firstBranch; // If second is empty, union is first.
        }

        // Recursively combine children.
        const combinedLeft = combineBranches(firstBranch[0], secondBranch[0]);
        const combinedRight = combineBranches(firstBranch[1], secondBranch[1]);

        return [combinedLeft, combinedRight]; // Create a new branch node.
    };

    // Finds common elements in two branches (intersection operation) recursively.
    const findCommonBranches = (firstBranch, secondBranch) => {
        if (firstBranch === null || secondBranch === null) {
            return null; // If either is empty, intersection is empty.
        }

        // Recursively find common children.
        const commonLeft = findCommonBranches(firstBranch[0], secondBranch[0]);
        const commonRight = findCommonBranches(firstBranch[1], secondBranch[1]);

        // If we reach this point, both firstBranch and secondBranch are non-null.
        // This implies a node exists at this position in the intersection,
        // even if its children are null (e.g., intersection of (,) and (,) is (,)).
        return [commonLeft, commonRight];
    };

    lineSegments.forEach(line => {
        const [opType, firstBranchStr, secondBranchStr] = line.split(' ');
        const branchA = buildBranch(firstBranchStr);
        const branchB = buildBranch(secondBranchStr);

        let finalOutcome;
        if (opType === "u") {
            finalOutcome = combineBranches(branchA, branchB);
        } else if (opType === "i") {
            finalOutcome = findCommonBranches(branchA, branchB);
        }
        console.log(renderBranch(finalOutcome));
    });
});