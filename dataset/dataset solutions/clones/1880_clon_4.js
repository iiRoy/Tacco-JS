const interpretPayloadLineOne = (payloadString) => {
    const parts = payloadString.trim().split(" ");
    return {
        nodeCount: parseInt(parts[0]),
        journeyLength: BigInt(parts[1])
    };
};

const interpretPayloadLineTwo = (payloadString) => {
    return payloadString.trim().split(" ").map(val => parseInt(val) - 1);
};

const recursiveCycleDetector = (currentPos, stepNum, pathVisited, connections) => {
    if (pathVisited.has(currentPos)) {
        const entryStep = pathVisited.get(currentPos);
        return {
            preCycleSteps: BigInt(entryStep),
            cycleDuration: BigInt(stepNum - entryStep),
            cycleStartNode: currentPos
        };
    }
    pathVisited.set(currentPos, stepNum);
    return recursiveCycleDetector(connections[currentPos], stepNum + 1, pathVisited, connections);
};

const recursivePathNavigator = (currentLocation, stepsRemaining, passageMapping) => {
    if (stepsRemaining === 0) {
        return currentLocation;
    }
    return recursivePathNavigator(passageMapping[currentLocation], stepsRemaining - 1, passageMapping);
};

const processSequenceOutcome = (payload) => {
    const { nodeCount, journeyLength } = interpretPayloadLineOne(payload[0]);
    const linkageArray = interpretPayloadLineTwo(payload[1]);

    const cycleData = recursiveCycleDetector(0, 0, new Map(), linkageArray);

    let ultimateStepCount;

    if (journeyLength < cycleData.preCycleSteps) {
        ultimateStepCount = journeyLength;
    } else {
        const remainingStepsInCycle = (journeyLength - cycleData.preCycleSteps) % cycleData.cycleDuration;
        ultimateStepCount = cycleData.preCycleSteps + remainingStepsInCycle;
    }

    const finalNodePosition = recursivePathNavigator(0, Number(ultimateStepCount), linkageArray);

    console.log((finalNodePosition + 1).toString());
};

processSequenceOutcome(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));