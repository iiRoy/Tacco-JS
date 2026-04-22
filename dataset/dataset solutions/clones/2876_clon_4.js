const dataContainer = [];
const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputProcessor.on('line', (dataLine) => {
    dataContainer.push(dataLine);
});

inputProcessor.on('close', () => {
    const numericParameters = dataContainer[0].split(" ").map(Number);
    // const totalNodes = numericParameters[0]; // N, unused in core logic
    const initialPosition = numericParameters[1]; // A (1-based)
    const intermediatePosition = numericParameters[2]; // B (1-based)
    const finalPositionC = numericParameters[3]; // C (1-based)
    const finalPositionD = numericParameters[4]; // D (1-based)

    const terrainMap = dataContainer[1]; // S (string)

    const hasImmediateBlockage = Array.from({ length: terrainMap.length - 1 })
        .some((_, charIndex) => {
            const firstCharBlocked = terrainMap[charIndex] === '#';
            const secondCharBlocked = terrainMap[charIndex + 1] === '#';
            const relevantRangeStart = initialPosition - 1; // 0-based A
            const relevantRangeEnd = Math.max(finalPositionC, finalPositionD) - 1; // 0-based max(C,D)

            const withinRelevantRangeStart = charIndex >= relevantRangeStart;
            const withinRelevantRangeEnd = (charIndex + 1) <= relevantRangeEnd;

            return firstCharBlocked && secondCharBlocked && withinRelevantRangeStart && withinRelevantRangeEnd;
        });

    if (hasImmediateBlockage) {
        console.log("No");
        return;
    }

    const canBypassObstacle = Array.from({ length: terrainMap.length - 2 })
        .some((_, charIndex) => {
            const middlePoint0Based = charIndex + 1;
            const hasThreeClearSpaces = terrainMap.substring(charIndex, charIndex + 3) === '...';
            const middleSpaceInTraversalRange = middlePoint0Based >= intermediatePosition - 1 && middlePoint0Based <= finalPositionD - 1;
            return hasThreeClearSpaces && middleSpaceInTraversalRange;
        });

    const isDestinationSwapped = finalPositionD < finalPositionC;

    const checkSpecificSpot = (position1Based) => {
        const index0Based = position1Based - 1;
        return index0Based >= 0 && index0Based < terrainMap.length && terrainMap[index0Based] === '#';
    };

    const isCriticalPathBlocked = () => {
        return checkSpecificSpot(intermediatePosition - 2) || // S[B-2] in 1-based problem context
               checkSpecificSpot(intermediatePosition) ||     // S[B] in 1-based problem context
               checkSpecificSpot(finalPositionD - 2) ||       // S[D-2] in 1-based problem context
               checkSpecificSpot(finalPositionD);             // S[D] in 1-based problem context
    };

    if (isDestinationSwapped && isCriticalPathBlocked() && !canBypassObstacle) {
        console.log("No");
    } else {
        console.log("Yes");
    }
});