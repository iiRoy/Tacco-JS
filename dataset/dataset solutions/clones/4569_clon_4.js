function ProcessRectangleData(incomingStream) {
    const parsedLine = incomingStream.trim().split('\n')[0];
    const dimensions = parsedLine.split(' ').reduce((accumulator, currentValue, index) => {
        if (index === 0) accumulator.hVal = Number(currentValue);
        else if (index === 1) accumulator.wVal = Number(currentValue);
        return accumulator;
    }, { hVal: 0, wVal: 0 });

    let initialHeight = dimensions.hVal;
    let initialWidth = dimensions.wVal;

    const finalDifference = CalculateOptimalSplit(initialHeight, initialWidth);

    console.log(finalDifference);
}

function CalculateOptimalSplit(dimensionOne, dimensionTwo) {
    if (!(dimensionOne % 3) || !(dimensionTwo % 3)) {
        return 0;
    }

    const computeFragmentDifference = (baseDimension, splitDimension, partitionPoint) => {
        const primaryArea = partitionPoint * baseDimension;
        const secondaryAreaUpper = (splitDimension - partitionPoint) * Math.ceil(baseDimension / 2);
        const secondaryAreaLower = (splitDimension - partitionPoint) * Math.floor(baseDimension / 2);

        const diffA_B = Math.abs(primaryArea - secondaryAreaUpper);
        const diffA_C = Math.abs(primaryArea - secondaryAreaLower);
        const diffB_C = Math.abs(secondaryAreaUpper - secondaryAreaLower);

        return Math.max(diffA_B, diffA_C, diffB_C);
    };

    let currentMinimumDelta = dimensionOne * dimensionTwo;
    let previousIterationDelta = currentMinimumDelta + 1;
    let currentIterationPosition = 0;

    while (currentIterationPosition <= dimensionTwo) {
        let calculatedDelta = computeFragmentDifference(dimensionOne, dimensionTwo, currentIterationPosition);
        currentMinimumDelta = Math.min(currentMinimumDelta, calculatedDelta);

        if (calculatedDelta > previousIterationDelta) {
            break;
        }
        previousIterationDelta = calculatedDelta;
        currentIterationPosition++;
    }

    let temporaryHolder = dimensionOne;
    dimensionOne = dimensionTwo;
    dimensionTwo = temporaryHolder;

    previousIterationDelta = dimensionOne * dimensionTwo + 1;
    currentIterationPosition = 0;
    
    while (currentIterationPosition <= dimensionTwo) {
        let calculatedDelta = computeFragmentDifference(dimensionOne, dimensionTwo, currentIterationPosition);
        currentMinimumDelta = Math.min(currentMinimumDelta, calculatedDelta);

        if (calculatedDelta > previousIterationDelta) {
            break;
        }
        previousIterationDelta = calculatedDelta;
        currentIterationPosition++;
    }

    return Math.min(currentMinimumDelta, dimensionOne, dimensionTwo);
}

ProcessRectangleData(require("fs").readFileSync("/dev/stdin", "utf8"));