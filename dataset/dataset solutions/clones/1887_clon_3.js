const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

console.log((function(inputString) {
    const OPEN_PARENTHESIS = '(';
    const CLOSE_PARENTHESIS = ')';

    const inputLines = inputString.trim().split('\n');
    const numberOfStrings = parseInt(inputLines.shift(), 10);

    // Helper function to compute the balance score for a single string segment
    const computeSegmentBalance = (segmentText) => {
        let balance = 0;
        for (const char of segmentText) {
            if (char === OPEN_PARENTHESIS) {
                balance++;
            } else if (char === CLOSE_PARENTHESIS) {
                balance--;
            }
        }
        return balance;
    };

    const segmentDetails = [];
    let totalOverallBalance = 0;
    let countStartingOpen = 0;
    let countEndingClosed = 0;

    // Process each input string to extract its properties
    for (let i = 0; i < numberOfStrings; i++) {
        const currentLine = inputLines[i];
        const firstCharacter = currentLine[0];
        const lastCharacter = currentLine[currentLine.length - 1];
        const segmentScore = computeSegmentBalance(currentLine);

        segmentDetails.push({
            firstCharacter: firstCharacter,
            lastCharacter: lastCharacter,
            segmentScore: segmentScore
        });

        totalOverallBalance += segmentScore;
        if (firstCharacter === OPEN_PARENTHESIS) {
            countStartingOpen++;
        }
        if (lastCharacter === CLOSE_PARENTHESIS) {
            countEndingClosed++;
        }
    }

    // Initial validation checks
    if (totalOverallBalance !== 0 || countStartingOpen === 0 || countEndingClosed === 0) {
        return 'No';
    }
    if (numberOfStrings === 1) {
        return 'Yes';
    }

    // Sort segments by their balance score in descending order
    segmentDetails.sort((a, b) => b.segmentScore - a.segmentScore);

    const allSegmentsMask = (1 << numberOfStrings) - 1;
    const explorationStack = [];
    const visitedMasks = new Array(1 << numberOfStrings).fill(false);

    // Initialize the stack with valid starting segments
    for (let i = 0; i < numberOfStrings; i++) {
        const currentSegment = segmentDetails[i];
        // A segment starting with ')' or having a negative balance cannot initiate a valid sequence
        if (currentSegment.firstCharacter === CLOSE_PARENTHESIS || currentSegment.segmentScore < 0) {
            continue;
        }
        const initialUsedMask = (1 << i);
        explorationStack.push({ usedMask: initialUsedMask, currentPathBalance: currentSegment.segmentScore });
        // Note: visitedMasks for initial pushes are NOT marked true here, matching original logic.
    }

    // Perform Depth-First Search (DFS)
    while (explorationStack.length > 0) {
        const currentPathState = explorationStack.pop();
        const { usedMask, currentPathBalance } = currentPathState;

        for (let nextSegmentIndex = 0; nextSegmentIndex < numberOfStrings; nextSegmentIndex++) {
            // Skip if this segment is already part of the current path
            if ((usedMask & (1 << nextSegmentIndex)) !== 0) {
                continue;
            }

            const nextSegment = segmentDetails[nextSegmentIndex];
            const newUsedMask = usedMask | (1 << nextSegmentIndex);
            const newPathBalance = currentPathBalance + nextSegment.segmentScore;

            // If all segments have been used in this path
            if (newUsedMask === allSegmentsMask) {
                // Check if the final segment ends with ')' and the total balance is zero
                if (nextSegment.lastCharacter === CLOSE_PARENTHESIS && newPathBalance === 0) {
                    return 'Yes';
                }
                // If not a valid final sequence, continue to the next possible segment
                continue;
            }

            // Memoization logic:
            // If this 'newUsedMask' has been encountered before (i.e., visitedMasks[newUsedMask] is true)
            // AND the 'newPathBalance' for the current path is negative,
            // then this path is not promising, so skip further exploration.
            // Otherwise, mark this 'newUsedMask' as visited and push the current path state.
            if (visitedMasks[newUsedMask] && newPathBalance < 0) {
                continue;
            }
            visitedMasks[newUsedMask] = true; // Mark as visited *before* pushing, as per original's logic
            explorationStack.push({ usedMask: newUsedMask, currentPathBalance: newPathBalance });
        }
    }

    // If no valid sequence is found after exploring all possibilities
    return 'No';
})(rawInputContent));
