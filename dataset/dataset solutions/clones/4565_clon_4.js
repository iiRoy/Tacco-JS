const extractNumericValue = (textualData) => Number.parseInt(textualData, 10);

const measureValueSpread = (valueCollection) => {
    const orderedValues = valueCollection.slice().sort((first, second) => second - first);
    return orderedValues[0] - orderedValues[orderedValues.length - 1];
};

const computeDivisionOutcome = (primaryAxis, secondaryAxis, splitAlongSecondary) => {
    const firstSegmentLength = Math.round(primaryAxis / 3);
    const remainingPrimarySegment = primaryAxis - firstSegmentLength;
    const firstPieceArea = firstSegmentLength * secondaryAxis;

    let secondPieceArea;
    let thirdPieceArea;

    if (splitAlongSecondary) {
        const secondSegmentLength = Math.round(secondaryAxis / 2);
        const remainingSecondarySegment = secondaryAxis - secondSegmentLength;
        secondPieceArea = remainingPrimarySegment * secondSegmentLength;
        thirdPieceArea = remainingPrimarySegment * remainingSecondarySegment;
    } else {
        const secondSegmentLength = Math.round(remainingPrimarySegment / 2);
        const remainingSecondPrimarySegment = remainingPrimarySegment - secondSegmentLength;
        secondPieceArea = secondSegmentLength * secondaryAxis;
        thirdPieceArea = remainingSecondPrimarySegment * secondaryAxis;
    }

    return measureValueSpread([firstPieceArea, secondPieceArea, thirdPieceArea]);
};

const processGeometryInput = (inputRecords) => {
    const initialDimensions = inputRecords[0].split(' ').map(extractNumericValue);
    const initialWidth = initialDimensions[0];
    const initialHeight = initialDimensions[1];

    const allStrategies = [
        () => computeDivisionOutcome(initialWidth, initialHeight, false),
        () => computeDivisionOutcome(initialWidth, initialHeight, true),
        () => computeDivisionOutcome(initialHeight, initialWidth, false),
        () => computeDivisionOutcome(initialHeight, initialWidth, true),
    ];

    const allSpreads = allStrategies.map(strategyExecutor => strategyExecutor());

    return Math.min(...allSpreads);
};

console.log(processGeometryInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim())));