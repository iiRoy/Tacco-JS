function parseInputData(rawLines) {
    if (!Array.isArray(rawLines) || rawLines.length < 2) {
        // Provide a more robust error handling or default values based on context
        throw new Error("Input data malformed: Expected at least two lines of data.");
    }

    // Extract and process the first line containing sequence length and total jumps
    const firstLineSegments = rawLines[0].trim().split(" ");
    if (firstLineSegments.length !== 2) {
        throw new Error("First line format error: Expected two space-separated numbers.");
    }
    const sequenceLength = Number(firstLineSegments[0]);
    const totalJumpCount = BigInt(firstLineSegments[1]);

    // Extract and process the second line containing the jump targets
    const jumpTargets = rawLines[1].trim().split(" ").map(val => Number(val));

    // Basic consistency check (optional, but good for robust applications)
    if (jumpTargets.length !== sequenceLength) {
        console.warn("Warning: Provided sequence length does not match the number of jump targets.");
        // Depending on requirements, could throw error or adjust sequenceLength
    }

    return {
        seqLen: sequenceLength,
        jumpsToMake: totalJumpCount,
        targets: jumpTargets
    };
}

// Helper function to simulate a specific number of jumps
function findFinalNodeAfterSteps(startNode, numSteps, targetsArr) {
    let currentNode = startNode;
    // Iterate 'numSteps' times, updating the current node based on targetsArr
    for (let s = 0n; s < numSteps; s++) {
        currentNode = targetsArr[currentNode];
    }
    return currentNode;
}

// The main entry point for processing the sequence logic
function processSequence(rawData) {
    // Parse the raw input into structured variables
    const { seqLen, jumpsToMake, targets } = parseInputData(rawData);

    // Adjust jump targets to be 0-indexed for array access
    const adjustedTargets = targets.map(target => target - 1);

    // Initialize an array to keep track of the step count when each node was first visited.
    // 'null' signifies an unvisited node.
    const visitedStepOrder = new Array(seqLen).fill(null);

    let currentPosition = 0;    // The current node in the sequence, starting at index 0
    let currentStepCount = 0;   // The total number of steps taken so far

    // Simulate the sequence to detect if and where a cycle occurs
    // This loop continues indefinitely until a previously visited node is encountered.
    while (true) {
        const nextNodeCandidate = adjustedTargets[currentPosition];

        // Check if the next node we are about to jump to has been visited before
        if (visitedStepOrder[nextNodeCandidate] === null) {
            // This is the first time we're visiting 'nextNodeCandidate'
            visitedStepOrder[nextNodeCandidate] = currentStepCount; // Record the step count
            currentStepCount++;                                     // Increment overall step counter
            currentPosition = nextNodeCandidate;                    // Move to the new node
        } else {
            // A cycle has been detected because 'nextNodeCandidate' was visited previously
            break; // Exit the cycle detection phase
        }
    }

    // At this point, 'currentPosition' is the node from which we were about to jump
    // to a node that completed the cycle.
    // 'adjustedTargets[currentPosition]' is the node that was revisited, marking the cycle's start.
    const cycleEntryNode = adjustedTargets[currentPosition];
    const stepsToReachCycleEntry = BigInt(visitedStepOrder[cycleEntryNode]); // Steps taken to first reach the cycle's entry point
    const detectedCycleLength = BigInt(currentStepCount) - stepsToReachCycleEntry; // The length of the detected cycle

    let finalEffectiveSteps = 0n; // This BigInt will store the total effective steps to simulate

    // Determine the actual number of steps needed based on total jumps and cycle properties
    if (jumpsToMake < stepsToReachCycleEntry) {
        // If the total jumps are fewer than the steps required to even enter the cycle,
        // then no cycle traversal happens.
        finalEffectiveSteps = jumpsToMake;
    } else {
        // The number of jumps is sufficient to enter and potentially traverse the cycle multiple times.
        const remainingJumpsInCyclePhase = jumpsToMake - stepsToReachCycleEntry;

        // Calculate the effective jumps within the cycle.
        // If cycleLength is 0 (e.g., n=1, a[0]=1, which is a self-loop handled correctly by stepsToReachCycleEntry=0, cycleLength=1),
        // modulo by zero needs to be avoided. However, detectedCycleLength will always be >= 1 here.
        const cycleRemainderSteps = detectedCycleLength > 0n ? remainingJumpsInCyclePhase % detectedCycleLength : 0n;
        finalEffectiveSteps = stepsToReachCycleEntry + cycleRemainderSteps;
    }

    // Simulate the final effective steps to determine the ultimate destination node
    const finalNodeIndex = findFinalNodeAfterSteps(0, finalEffectiveSteps, adjustedTargets);

    // Output the result, converting the 0-indexed node to 1-indexed for display
    console.log(`${finalNodeIndex + 1}`);
}

// Standard competitive programming entry point: read from stdin and call the main function
processSequence(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));