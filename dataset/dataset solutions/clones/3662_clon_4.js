const processInputData = (rawData) => {
    const lineSegments = rawData.trim().split('\n');
    const [headerLine, ...intervalLines] = lineSegments;
    const [itemCount, pairCount] = headerLine.split(' ').map(Number);

    const intervalPairs = intervalLines.slice(0, pairCount).map(segment => segment.split(' ').map(Number));
    return { pairCount, intervalPairs };
};

const solveIntervalProblem = (inputData) => {
    const { pairCount, intervalPairs } = inputData;

    if (pairCount === 0) {
        return 0;
    }

    const orderedPairs = intervalPairs.sort((firstPair, secondPair) => firstPair[1] - secondPair[1]);

    const initialSelectionState = {
        chosenCount: 1,
        currentBoundary: orderedPairs[0][1] - 2
    };

    const finalSelectionState = orderedPairs.slice(1).reduce((accumulator, currentPair) => {
        const [startVal, endVal] = currentPair;
        if (startVal - 1 > accumulator.currentBoundary) {
            return {
                chosenCount: accumulator.chosenCount + 1,
                currentBoundary: endVal - 2
            };
        } else {
            return accumulator;
        }
    }, initialSelectionState);

    return finalSelectionState.chosenCount;
};

const entryPoint = (inputString) => {
    const parsedData = processInputData(inputString);
    const resultValue = solveIntervalProblem(parsedData);
    console.log(resultValue);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
