function calculateFinalPosition(inputString) {
    const dataLines = inputString.trim().split("\n");
    let [graphSize, totalStepsCount] = dataLines[0].split(' ');
    graphSize = +graphSize;
    totalStepsCount = BigInt(totalStepsCount);
    const nextNodeMap = dataLines[1].split(' ').map(Number);

    const positionVisitOrder = new Map();
    const pathTrace = [];

    let currentPositionIndex = 0;
    let stepsCompleted = 0;

    while (totalStepsCount > BigInt(stepsCompleted) && !positionVisitOrder.has(currentPositionIndex)) {
        positionVisitOrder.set(currentPositionIndex, stepsCompleted);
        pathTrace.push(currentPositionIndex);
        currentPositionIndex = nextNodeMap[currentPositionIndex] - 1;
        stepsCompleted++;
    }

    let resultPosition;

    if (totalStepsCount <= BigInt(stepsCompleted)) {
        resultPosition = currentPositionIndex;
    } else {
        const cycleEntryStep = positionVisitOrder.get(currentPositionIndex);
        const preCyclePathLength = cycleEntryStep;
        const cycleLength = stepsCompleted - cycleEntryStep;

        const remainingStepsAfterPreCycle = totalStepsCount - BigInt(preCyclePathLength);
        const offsetWithinCycle = remainingStepsAfterPreCycle % BigInt(cycleLength);

        resultPosition = pathTrace[cycleEntryStep + Number(offsetWithinCycle)];
    }

    console.log(resultPosition + 1);
}

function main(input) {
    calculateFinalPosition(input);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
