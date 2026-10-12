function processInput(rawData) {
    const lineData = rawData.split("\n");

    const parseDimensions = (dimString) => {
        const parts = dimString.split(" ");
        return {
            totalLength: parseInt(parts[0], 10),
            maxJump: parseInt(parts[1], 10)
        };
    };

    const { totalLength, maxJump } = parseDimensions(lineData[0]);
    const pathChars = lineData[1].split("");

    const initialJumps = [];
    let currentPos = 0;
    const targetPosition = totalLength - 1;

    while (currentPos < targetPosition) {
        let bestNextJump = -1;
        for (let jumpAttempt = 1; jumpAttempt <= maxJump; jumpAttempt++) {
            const potentialLandingSpot = currentPos + jumpAttempt;
            if (potentialLandingSpot <= targetPosition && pathChars[potentialLandingSpot] === '0') {
                bestNextJump = jumpAttempt;
                break;
            }
        }

        if (bestNextJump === -1) {
            console.log(-1);
            return;
        }
        currentPos += bestNextJump;
        initialJumps.push(bestNextJump);
    }

    const allOptimizedPaths = [];

    const canCombineJumps = (jumpA, jumpB, maxAllowed) => (jumpA + jumpB <= maxAllowed);

    const exploreCombinations = function(currentPath) {
        let mergedAny = false;
        for (let k = 0; k < currentPath.length - 1; k++) {
            if (canCombineJumps(currentPath[k], currentPath[k + 1], maxJump)) {
                const nextPath = [...currentPath];
                nextPath[k] += nextPath[k + 1];
                nextPath.splice(k + 1, 1);
                exploreCombinations(nextPath);
                mergedAny = true;
            }
        }
        if (!mergedAny && currentPath.length <= optimizedPath.length) {
            allOptimizedPaths.push([...currentPath]);
        }
    };

    const optimizedPath = [];
    let currentJumpIndex = initialJumps.length - 1;

    const combineBackwardSegments = (startIndex, jumpsArray, maxAllowed) => {
        let segmentSum = jumpsArray[startIndex];
        let lookBackIndex = startIndex - 1;
        while (lookBackIndex >= 0 && segmentSum + jumpsArray[lookBackIndex] <= maxAllowed) {
            segmentSum += jumpsArray[lookBackIndex];
            lookBackIndex--;
        }
        return { combinedValue: segmentSum, nextStartIndex: lookBackIndex };
    };

    while (currentJumpIndex >= 0) {
        const { combinedValue, nextStartIndex } = combineBackwardSegments(currentJumpIndex, initialJumps, maxJump);
        optimizedPath.unshift(combinedValue);
        currentJumpIndex = nextStartIndex;
    }

    console.log(optimizedPath.join(""));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
