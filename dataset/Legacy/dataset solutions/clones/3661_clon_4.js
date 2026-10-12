function processIntervals(inputData) {
    const inputLines = inputData.split('\n');

    const [totalRangeEnd, segmentCount] = inputLines[0].split(' ').map(Number.parseInt);

    const segmentPairs = inputLines.slice(1, segmentCount + 1).map(lineText =>
        lineText.split(' ').map(Number.parseInt)
    );

    const initialAccumulator = {
        activeLeftBound: 0,
        activeRightBound: totalRangeEnd - 1,
        resetCounter: 1
    };

    const finalState = segmentPairs.reduce((accumulator, currentSegment) => {
        const [segmentStart, segmentEnd] = currentSegment;
        let { activeLeftBound, activeRightBound, resetCounter } = accumulator;

        if (segmentEnd <= activeLeftBound || activeRightBound <= segmentStart) {
            resetCounter++;
            activeLeftBound = segmentStart;
            activeRightBound = segmentEnd;
        } else {
            activeLeftBound = Math.max(activeLeftBound, segmentStart);
            activeRightBound = Math.min(activeRightBound, segmentEnd);
        }

        return { activeLeftBound, activeRightBound, resetCounter };
    }, initialAccumulator);

    console.log(finalState.resetCounter);
}

processIntervals(require("fs").readFileSync("/dev/stdin", "utf8"));
