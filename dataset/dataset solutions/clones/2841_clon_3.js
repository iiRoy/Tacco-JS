function processInputData(rawData) {
    const getCleanLines = (text) => text.split("\n").filter(line => line.trim() !== '');
    const inputLines = getCleanLines(rawData);

    const totalPointsCount = Number(inputLines[0]);

    if (totalPointsCount <= 2) {
        console.log(1);
        return;
    }

    const parsePoint = (pointString) => pointString.split(' ').map(val => Number(val));

    const pointCoordinates = inputLines.slice(1).map(parsePoint);

    const vectorFrequencyMap = {};

    const recordVectorOccurrence = (mapRef, vectorIdentifier) => {
        mapRef[vectorIdentifier] = (mapRef[vectorIdentifier] || 0) + 1;
    };

    const createVectorKey = (vectorComponents) => vectorComponents.join('_');

    for (let i = 0; i < totalPointsCount; i++) {
        const currentPointA = pointCoordinates[i];
        for (let j = 0; j < totalPointsCount; j++) {
            const currentPointB = pointCoordinates[j];

            if (i === j) {
                continue;
            }

            const deltaX = currentPointB[0] - currentPointA[0];
            const deltaY = currentPointB[1] - currentPointA[1];
            const currentVector = [deltaX, deltaY];

            const vectorIdentifier = createVectorKey(currentVector);

            recordVectorOccurrence(vectorFrequencyMap, vectorIdentifier);
        }
    }

    const maxObservedVectorData = Object.keys(vectorFrequencyMap).reduce((currentMax, vectorKeyString) => {
        const currentVectorCount = vectorFrequencyMap[vectorKeyString];
        if (currentVectorCount > currentMax[0]) {
            return [currentVectorCount, vectorKeyString];
        } else {
            return currentMax;
        }
    }, [1, '']);

    console.log(totalPointsCount - maxObservedVectorData[0]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
