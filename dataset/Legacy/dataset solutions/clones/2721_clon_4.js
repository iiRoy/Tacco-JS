const processInput = (rawData) => {
    const lines = rawData.split("\n");
    const [elementCountStr, iterationLimitStr] = lines[0].split(" ");
    const elementCount = parseInt(elementCountStr, 10);
    const iterationLimit = parseInt(iterationLimitStr, 10);
    const sourceElements = lines[1].split(" ");

    const stateTracker = new Map();
    const sequenceSnapshots = [];

    let currentSequence = [];
    let currentIteration = 0;
    let cycleStartPoint = -1;

    const evolveSequence = (initialSequence, elementsToProcess) => {
        return elementsToProcess.reduce((accumulator, currentElement) => {
            const existingIndex = accumulator.indexOf(currentElement);
            if (existingIndex !== -1) {
                return accumulator.slice(0, existingIndex);
            } else {
                return [...accumulator, currentElement];
            }
        }, initialSequence);
    };

    while (currentIteration <= iterationLimit) {
        const currentStateString = currentSequence.join(" ");

        if (stateTracker.has(currentStateString)) {
            cycleStartPoint = stateTracker.get(currentStateString);
            break;
        }

        stateTracker.set(currentStateString, currentIteration);
        sequenceSnapshots.push(currentStateString);

        if (currentIteration === iterationLimit) {
            break;
        }

        currentSequence = evolveSequence(currentSequence, sourceElements);
        currentIteration++;
    }

    if (cycleStartPoint === -1) {
        console.log(sequenceSnapshots[iterationLimit]);
    } else {
        const cycleLength = sequenceSnapshots.length - cycleStartPoint;
        const stepsBeyondCycleStart = iterationLimit - cycleStartPoint;
        const offsetInCycle = stepsBeyondCycleStart % cycleLength;
        console.log(sequenceSnapshots[cycleStartPoint + offsetInCycle]);
    }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
