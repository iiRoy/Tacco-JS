'use strict';

function assessTriangleValidity(sideDimensions) {
    const [firstSide, secondSide, thirdSide] = sideDimensions;

    const largestDimension = Math.max(firstSide, secondSide, thirdSide);
    const smallestDimension = Math.min(firstSide, secondSide, thirdSide);
    const middleDimension = firstSide + secondSide + thirdSide - largestDimension - smallestDimension;

    const inequalityCondition = largestDimension < middleDimension + smallestDimension;
    const distinctnessCondition = largestDimension !== middleDimension && middleDimension !== smallestDimension;

    return inequalityCondition && distinctnessCondition;
}

function* generateCombinationsOfThree(sourceCollection, currentPosition = 0, currentSelection = []) {
    if (currentSelection.length === 3) {
        yield currentSelection;
        return;
    }
    if (currentPosition >= sourceCollection.length) {
        return;
    }

    const remainingNeeded = 3 - currentSelection.length;
    const remainingAvailable = sourceCollection.length - currentPosition;

    // Option 1: Include the element at currentPosition
    if (remainingAvailable >= remainingNeeded) {
        yield* generateCombinationsOfThree(sourceCollection, currentPosition + 1, [...currentSelection, sourceCollection[currentPosition]]);
    }

    // Option 2: Exclude the element at currentPosition
    if (remainingAvailable - 1 >= remainingNeeded) {
        yield* generateCombinationsOfThree(sourceCollection, currentPosition + 1, currentSelection);
    }
}

function analyzeTriangleData(inputContent) {
    const contentLines = inputContent.split("\n");
    const totalSideCount = Number(contentLines[0]);
    const sideLengthValues = contentLines[1].split(' ').map(Number);

    let goodTriangleCounter = 0;

    for (const triplet of generateCombinationsOfThree(sideLengthValues)) {
        if (assessTriangleValidity(triplet)) {
            goodTriangleCounter++;
        }
    }

    console.log(goodTriangleCounter);
}

analyzeTriangleData(require("fs").readFileSync("/dev/stdin", "utf8"));
