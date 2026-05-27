function processInputAndCalculate(inputData) {
    const allLines = inputData.split('\n');
    const nodeCount = Number(allLines[0]);

    const pointCoordinates = allLines.slice(1).map(lineSegment =>
        lineSegment.split(/\s/g).map(Number)
    );

    const cumulativeLength = pointCoordinates.reduce((currentTotal, pointOne, indexOne, allPoints) => {
        const subsequentPoints = allPoints.slice(indexOne + 1);

        const distancesFromPointOne = subsequentPoints.reduce((sumOfDistances, pointTwo) => {
            const deltaX = pointOne[0] - pointTwo[0];
            const deltaY = pointOne[1] - pointTwo[1];
            return sumOfDistances + Math.hypot(deltaX, deltaY);
        }, 0);

        return currentTotal + distancesFromPointOne;
    }, 0);

    console.log(cumulativeLength * 2 / nodeCount);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
