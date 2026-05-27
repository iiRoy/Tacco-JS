const processInputData = (rawDataString) => {
    const allLines = rawDataString.trim().split('\n');
    const pointQuantity = parseInt(allLines[0].split(' ')[0], 10);

    const coordinateData = allLines.slice(1).map(lineText =>
        lineText.split(' ').map(valStr => parseInt(valStr, 10))
    );

    const redCoordinates = coordinateData.slice(0, pointQuantity);
    const blueCoordinates = coordinateData.slice(pointQuantity, 2 * pointQuantity);

    return { pointQuantity, redCoordinates, blueCoordinates };
};

const coordinateComparator = (pointAlpha, pointBeta) =>
    Math.min(pointAlpha[0], pointAlpha[1]) - Math.min(pointBeta[0], pointBeta[1]);

const determineMatchCount = (redPointsCollection, bluePointsCollection) => {
    const initialMatchState = { currentMatchCount: 0, nextBluePointIndex: 0 };

    const finalMatchState = redPointsCollection.reduce((accumulator, currentRedPoint) => {
        const availableBluePoints = bluePointsCollection.slice(accumulator.nextBluePointIndex);

        const relativeMatchIndex = availableBluePoints.findIndex(candidateBluePoint =>
            currentRedPoint[0] < candidateBluePoint[0] && currentRedPoint[1] < candidateBluePoint[1]
        );

        if (relativeMatchIndex !== -1) {
            const absoluteMatchIndex = accumulator.nextBluePointIndex + relativeMatchIndex;
            return {
                currentMatchCount: accumulator.currentMatchCount + 1,
                nextBluePointIndex: absoluteMatchIndex + 1
            };
        } else {
            return accumulator;
        }
    }, initialMatchState);

    return finalMatchState.currentMatchCount;
};

const mainExecution = (inputContent) => {
    const { redCoordinates, blueCoordinates } = processInputData(inputContent);

    redCoordinates.sort(coordinateComparator);
    blueCoordinates.sort(coordinateComparator);

    const totalMatches = determineMatchCount(redCoordinates, blueCoordinates);

    return `${totalMatches}`;
};

console.log(mainExecution(require('fs').readFileSync('/dev/stdin', 'utf8')));
