const evaluateJourney = (rawTextualData) => {
    const [configLine, destinationLine, valueLine] = rawTextualData
        .trim()
        .split('\n')
        .map(line => line.split(' ').map(Number));

    const totalLocations = configLine[0];
    const maximumJumps = configLine[1];
    const destinationIndices = destinationLine;
    const locationValues = valueLine;

    const globallyVisitedLocations = new Set();
    let overallBestAccumulation = -Infinity;

    Array.from({ length: totalLocations }, (_, locationIdentifier) => locationIdentifier)
        .filter(idx => !globallyVisitedLocations.has(idx))
        .forEach(entryPoint => {
            const currentCycleNodes = [];
            const currentCycleRewards = [];
            let currentTraveler = entryPoint;

            while (!globallyVisitedLocations.has(currentTraveler)) {
                globallyVisitedLocations.add(currentTraveler);
                currentCycleNodes.push(currentTraveler);
                currentCycleRewards.push(locationValues[currentTraveler]);
                currentTraveler = destinationIndices[currentTraveler] - 1;
            }

            const cycleRingSize = currentCycleNodes.length;
            const cycleNetSum = currentCycleRewards.reduce((acc, val) => acc + val, 0);

            let initialSegmentLength;
            if (maximumJumps <= cycleRingSize) {
                initialSegmentLength = maximumJumps;
            } else if (cycleNetSum > 0) {
                initialSegmentLength = maximumJumps % cycleRingSize;
                if (initialSegmentLength === 0) initialSegmentLength = cycleRingSize;
            } else {
                initialSegmentLength = cycleRingSize;
            }

            let maxIntermediateGain = -Infinity;
            Array.from({ length: cycleRingSize }, (_, startOffset) => {
                let currentTraversalSum = 0;
                Array.from({ length: initialSegmentLength }, (_, step) => {
                    const effectiveIndex = (startOffset + step) % cycleRingSize;
                    currentTraversalSum += currentCycleRewards[effectiveIndex];
                    maxIntermediateGain = Math.max(maxIntermediateGain, currentTraversalSum);
                });
            });

            const fullLoopMultiples = Math.floor((maximumJumps - initialSegmentLength) / cycleRingSize);
            const cycleContribution = Math.max(0, cycleNetSum) * fullLoopMultiples;

            const currentCycleTotalScore = maxIntermediateGain + cycleContribution;
            overallBestAccumulation = Math.max(overallBestAccumulation, currentCycleTotalScore);
        });

    return overallBestAccumulation;
};

const initiateComputationalProcess = (inputStringContent) => {
    const finalCalculatedValue = evaluateJourney(inputStringContent);
    console.log(finalCalculatedValue);
};

initiateComputationalProcess(require("fs").readFileSync("/dev/stdin", "utf8"));