function* lineSource(rawText) {
    const lines = rawText.split("\n");
    let index = 0;
    while (index < lines.length) {
        yield lines[index++];
    }
}

const rotateCoordinates = (pointSet) => pointSet.map(coordPair => [coordPair[1], -coordPair[0]]);

const fixOrientation = (figureDots) => {
    let currentDots = figureDots.map(p => [...p]); 

    if (currentDots[1][1] > 0) {
        currentDots = rotateCoordinates(currentDots);
    }
    
    if (currentDots[1][0] < 0) {
        currentDots = rotateCoordinates(currentDots);
    }
    
    if (currentDots[1][1] < 0) {
        currentDots = rotateCoordinates(currentDots);
    }
    
    return currentDots;
};

const acquireShape = (allFiguresStorage, figureIndex, figureExtentData, lineIterator) => {
    figureExtentData[figureIndex] = Number.parseInt(lineIterator.next().value, 10);
    
    let temporaryPoints = [];
    const effectivePointCount = figureIndex === 0 ? figureExtentData[figureIndex] : figureExtentData[0];

    for (let i = 0; i < effectivePointCount; i++) {
        const coordinateParts = lineIterator.next().value.split(" ");
        temporaryPoints.push([Number.parseInt(coordinateParts[0], 10), Number.parseInt(coordinateParts[1], 10)]);
    }

    const initialPoint = temporaryPoints[0];
    const originNormalizedPoints = temporaryPoints.map((point, ptIdx) =>
        ptIdx === 0 ? [0, 0] : [point[0] - initialPoint[0], point[1] - initialPoint[1]]
    );

    allFiguresStorage[figureIndex] = fixOrientation(originNormalizedPoints);
};

const transformAndNormalize = (inputPointCollection, currentFigureSize) => {
    const originalPointsSnapshot = inputPointCollection.map(p => [...p]);

    const finalOriginalPoint = originalPointsSnapshot[currentFigureSize - 1];

    const invertedAndShifted = Array.from({ length: currentFigureSize }, (_, j) => {
        const sourcePoint = originalPointsSnapshot[currentFigureSize - 1 - j];
        return j === 0
            ? [0, 0]
            : [sourcePoint[0] - finalOriginalPoint[0], sourcePoint[1] - finalOriginalPoint[1]];
    });

    return fixOrientation(invertedAndShifted);
};

const checkPointSequenceMatch = (sequenceA, sequenceB) => {
    if (sequenceA.length !== sequenceB.length) return false;
    for (let i = 0; i < sequenceA.length; i++) {
        if (sequenceA[i][0] !== sequenceB[i][0] || sequenceA[i][1] !== sequenceB[i][1]) {
            return false;
        }
    }
    return true;
};

function ProcessAllFigures(fullRawInput){
    const inputIterator = lineSource(fullRawInput);

    const processNextSetOfFigures = () => {
        const currentNString = inputIterator.next().value;
        const currentNValue = Number.parseInt(currentNString, 10);
        if (currentNValue === 0) return;

        let totalPointCounts = [];
        let allFigureCoordinates = [];

        for (let i = 0; i <= currentNValue; i++) {
            acquireShape(allFigureCoordinates, i, totalPointCounts, inputIterator);
        }

        const primaryFigure = allFigureCoordinates[0];
        const primaryFigureCount = totalPointCounts[0];

        for (let i = 1; i <= currentNValue; i++) {
            if (primaryFigureCount === totalPointCounts[i]) {
                let candidateFigure = allFigureCoordinates[i];
                let isMatch = checkPointSequenceMatch(primaryFigure, candidateFigure);

                if (isMatch) {
                    console.log(i);
                } else {
                    const invertedCandidate = transformAndNormalize(candidateFigure, totalPointCounts[i]);
                    isMatch = checkPointSequenceMatch(primaryFigure, invertedCandidate);
                    if (isMatch) {
                        console.log(i);
                    }
                }
            }
        }
        console.log("+++++");
        processNextSetOfFigures();
    };

    processNextSetOfFigures();
}

ProcessAllFigures(require("fs").readFileSync("/dev/stdin","utf8"));