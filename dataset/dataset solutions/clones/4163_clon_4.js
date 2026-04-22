function Processor(rawText) {
    const parsedLines = rawText.split("\n");
    const movementPattern = parsedLines[0];
    const targetCoordinates = parsedLines[1].split(" ").map(Number);

    const segmentGroups = movementPattern.split("T");
    const xDisplacements = [];
    const yDisplacements = [];

    for (let currentIdx = 0; currentIdx < segmentGroups.length; currentIdx++) {
        if (currentIdx % 2 === 0) {
            xDisplacements.push(segmentGroups[currentIdx].length);
        } else {
            yDisplacements.push(segmentGroups[currentIdx].length);
        }
    }

    function evaluatePathSegments(segmentValues, finalObjective, isXAxisCalculation) {
        // Replicates original code's behavior: if there's 0 or 1 segment,
        // the final check block (j === length - 1) is never hit, so the flag remains false.
        if (segmentValues.length <= 1) {
            return false;
        }

        // Initialize possible positions with the first segment's magnitude.
        // For X-axis, this is fixed positive. For Y-axis, it's also fixed positive
        // due to a bug in the original code (only 'y[j].push(dy[j])' for j=0).
        let currentPositionSet = new Set();
        currentPositionSet.add(segmentValues[0]);

        // Process intermediate segments (corresponding to j from 1 to length - 2 in original)
        for (let segmentIdx = 1; segmentIdx < segmentValues.length - 1; segmentIdx++) {
            const nextPositionSet = new Set();
            const stepMagnitude = segmentValues[segmentIdx];
            for (const positionValue of currentPositionSet) {
                nextPositionSet.add(positionValue + stepMagnitude);
                // Replicates original 'if(dx[j] !== 0)' condition
                if (stepMagnitude !== 0) {
                    nextPositionSet.add(positionValue - stepMagnitude);
                }
            }
            currentPositionSet = nextPositionSet;
        }

        // Process the last segment (corresponding to j = length - 1 in original)
        const lastStepMagnitude = segmentValues[segmentValues.length - 1];
        for (const positionValue of currentPositionSet) {
            if (positionValue + lastStepMagnitude === finalObjective) {
                return true;
            }
            // Replicates specific Y-axis bug: for negative moves, check against targetCoordinates[0]
            if (!isXAxisCalculation && (positionValue - lastStepMagnitude === targetCoordinates[0])) {
                return true;
            }
            // For X-axis, or if Y-axis behavior was correct (checking against its own target)
            if (isXAxisCalculation && (positionValue - lastStepMagnitude === finalObjective)) {
                return true;
            }
        }

        return false; // Target not reached after all segments
    }

    const xReached = evaluatePathSegments(xDisplacements, targetCoordinates[0], true);
    const yReached = evaluatePathSegments(yDisplacements, targetCoordinates[1], false); // Pass false to trigger Y-axis specific bug replication

    if (xReached && yReached) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

Processor(require("fs").readFileSync("/dev/stdin", "utf8"));