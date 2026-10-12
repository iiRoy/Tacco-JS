function Main(rawData) {
    const lines = rawData.split("\n");

    const [antCount, trackLength, timeElapsed] = lines[0].split(" ").map(Number);

    const antDetails = lines.slice(1, antCount + 1).map(line => {
        const [pos, dir] = line.split(" ").map(Number);
        return { initialPos: pos, direction: dir };
    });

    const calculateIndependentFinalPosition = (initialPos, direction, trackLength, timeElapsed) => {
        const directionValue = (direction === 1) ? 1 : -1;
        let finalPos = (initialPos + timeElapsed * directionValue) % trackLength;
        if (finalPos < 0) {
            finalPos += trackLength;
        }
        return finalPos;
    };

    const independentFinalPositions = antDetails.map(ant =>
        calculateIndependentFinalPosition(ant.initialPos, ant.direction, trackLength, timeElapsed)
    );

    const initialAntFinalPos = independentFinalPositions[0];

    const countRelativePasses = (antA, antB, trackLen, time) => {
        if (antA.direction === antB.direction) {
            return 0;
        }

        let rightMoverPosition, leftMoverPosition;
        if (antA.direction === 1) {
            rightMoverPosition = antA.initialPos;
            leftMoverPosition = antB.initialPos;
        } else {
            rightMoverPosition = antB.initialPos;
            leftMoverPosition = antA.initialPos;
        }

        let relativeTravelDistance = time * 2;
        let initialSeparation;

        if (leftMoverPosition >= rightMoverPosition) {
            initialSeparation = leftMoverPosition - rightMoverPosition;
        } else {
            initialSeparation = trackLen - rightMoverPosition + leftMoverPosition;
        }

        let passes = 0;
        if (relativeTravelDistance >= initialSeparation) {
            passes++;
            relativeTravelDistance -= initialSeparation;
            passes += Math.floor(relativeTravelDistance / trackLen);
        }
        return passes;
    };

    let effectiveShift = antDetails.slice(1).reduce((passesAccumulator, currentAntDetails) => {
        return passesAccumulator + countRelativePasses(antDetails[0], currentAntDetails, trackLength, timeElapsed);
    }, 0);

    effectiveShift %= antCount;
    if (antDetails[0].direction === 2) {
        effectiveShift = (antCount - effectiveShift) % antCount;
    }

    const sortedPositionsWithIndices = independentFinalPositions.map((pos, idx) => ({
        finalPos: pos,
        originalIdx: idx
    }));

    sortedPositionsWithIndices.sort((a, b) => a.finalPos - b.finalPos);

    let initialAntSortedIndex;
    const matchingEntries = sortedPositionsWithIndices
        .map((entry, idx) => ({ ...entry, sortedIdx: idx }))
        .filter(entry => entry.finalPos === initialAntFinalPos);

    if (antDetails[0].direction === 1) {
        initialAntSortedIndex = matchingEntries[matchingEntries.length - 1].sortedIdx;
    } else {
        initialAntSortedIndex = matchingEntries[0].sortedIdx;
    }

    const finalOutputIndex = (antCount + initialAntSortedIndex - effectiveShift) % antCount;

    const finalPositions = [];
    let currentOutputPointer = finalOutputIndex;
    for (let i = 0; i < antCount; i++) {
        finalPositions.push(sortedPositionsWithIndices[currentOutputPointer].finalPos);
        currentOutputPointer = (currentOutputPointer + 1) % antCount;
    }

    finalPositions.forEach(pos => console.log(pos));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
